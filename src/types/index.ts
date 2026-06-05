export type Role = 'admin' | 'profissional' | 'recepcao'
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show'
export type PackageStatus = 'active' | 'completed' | 'cancelled'
export type PaymentMethod = 'pix' | 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'transferencia'

export interface Profile {
  id: string
  user_id: string
  name: string
  role: Role
  created_at: string
}

export interface Patient {
  id: string
  name: string
  phone: string | null
  email: string | null
  birth_date: string | null
  cpf: string | null
  address: string | null
  notes: string | null
  created_at: string
}

export interface Anamnese {
  id: string
  patient_id: string
  professional_id: string | null
  highlights: string[] | null
  queixa_principal: string | null
  historico: string | null
  exame_postural: string | null
  data: Record<string, unknown>
  created_at: string
  professional?: Profile
}

export interface Package {
  id: string
  patient_id: string
  professional_id: string | null
  total_sessions: number
  used_sessions: number
  value: number
  status: PackageStatus
  notes: string | null
  created_at: string
  professional?: Profile
}

export interface Appointment {
  id: string
  patient_id: string
  professional_id: string | null
  package_id: string | null
  scheduled_at: string
  status: AppointmentStatus
  session_number: number | null
  notes: string | null
  created_at: string
  patient?: Patient
  professional?: Profile
  package?: Package
}

export interface FinancialRecord {
  id: string
  patient_id: string
  appointment_id: string | null
  package_id: string | null
  amount: number
  payment_method: PaymentMethod | null
  paid_at: string
  notes: string | null
  professional_id: string | null
  created_at: string
  patient?: Patient
  professional?: Profile
}
