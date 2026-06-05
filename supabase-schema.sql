-- Schema: quiro-clinica
-- Rodar no Supabase SQL Editor

-- Perfis de usuário (recepção, profissional, admin)
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  name text not null,
  role text not null check (role in ('admin', 'profissional', 'recepcao')),
  created_at timestamptz default now()
);

-- Pacientes
create table patients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  birth_date date,
  cpf text,
  address text,
  notes text,
  imported_from text,
  created_at timestamptz default now()
);

-- Anamneses (avaliações iniciais)
create table anamneses (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade not null,
  professional_id uuid references profiles(id),
  highlights text[],           -- frases em destaque que aparecem na ficha
  queixa_principal text,
  historico text,
  exame_postural text,
  data jsonb default '{}',     -- campos extras flexíveis
  created_at timestamptz default now()
);

-- Pacotes de sessões
create table packages (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade not null,
  professional_id uuid references profiles(id),
  total_sessions int not null,
  used_sessions int default 0,
  value numeric(10,2) not null,
  status text default 'active' check (status in ('active', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz default now()
);

-- Agendamentos
create table appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade not null,
  professional_id uuid references profiles(id),
  package_id uuid references packages(id),
  scheduled_at timestamptz not null,
  status text default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled', 'no_show')),
  session_number int,
  notes text,
  created_at timestamptz default now()
);

-- Lançamentos financeiros
create table financial_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade not null,
  appointment_id uuid references appointments(id),
  package_id uuid references packages(id),
  amount numeric(10,2) not null,
  payment_method text check (payment_method in ('pix', 'dinheiro', 'cartao_credito', 'cartao_debito', 'transferencia')),
  paid_at timestamptz default now(),
  notes text,
  professional_id uuid references profiles(id),
  created_at timestamptz default now()
);

-- RLS: habilitar segurança por linha
alter table profiles enable row level security;
alter table patients enable row level security;
alter table anamneses enable row level security;
alter table packages enable row level security;
alter table appointments enable row level security;
alter table financial_records enable row level security;

-- Políticas: usuários autenticados da clínica acessam tudo
create policy "autenticados podem ver perfis" on profiles for select using (auth.role() = 'authenticated');
create policy "autenticados podem ver pacientes" on patients for all using (auth.role() = 'authenticated');
create policy "autenticados podem ver anamneses" on anamneses for all using (auth.role() = 'authenticated');
create policy "autenticados podem ver pacotes" on packages for all using (auth.role() = 'authenticated');
create policy "autenticados podem ver agendamentos" on appointments for all using (auth.role() = 'authenticated');
create policy "autenticados podem ver financeiro" on financial_records for all using (auth.role() = 'authenticated');

-- Trigger: criar perfil ao registrar usuário
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (user_id, name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email), 'recepcao');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
