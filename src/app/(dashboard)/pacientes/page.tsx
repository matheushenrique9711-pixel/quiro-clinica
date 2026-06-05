import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Phone } from 'lucide-react'

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('patients')
    .select('id, name, phone, created_at')
    .order('name')

  if (q) query = query.ilike('name', `%${q}%`)

  const { data: patients } = await query.limit(50)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Pacientes</h1>
        <Link href="/pacientes/novo">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Novo
          </Button>
        </Link>
      </div>

      <form>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Buscar paciente..."
            className="pl-9 h-12 text-base"
          />
        </div>
      </form>

      <div className="space-y-2">
        {patients?.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Nenhum paciente encontrado.</p>
        )}
        {patients?.map(patient => (
          <Link key={patient.id} href={`/pacientes/${patient.id}`}>
            <div className="bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow flex items-center justify-between active:bg-gray-50">
              <div>
                <p className="font-semibold">{patient.name}</p>
                {patient.phone && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Phone className="h-3 w-3" />{patient.phone}
                  </p>
                )}
              </div>
              <span className="text-muted-foreground text-xl">›</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
