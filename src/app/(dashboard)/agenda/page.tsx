import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, User } from 'lucide-react'
import Link from 'next/link'
import { NovoAgendamentoButton } from '@/components/agenda/novo-agendamento-button'

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>
}) {
  const { data: dateParam } = await searchParams
  const supabase = await createClient()

  const selectedDate = dateParam ? new Date(dateParam + 'T00:00:00') : new Date()
  selectedDate.setHours(0, 0, 0, 0)
  const nextDay = new Date(selectedDate)
  nextDay.setDate(nextDay.getDate() + 1)

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, patients(id, name, phone), profiles(name)')
    .gte('scheduled_at', selectedDate.toISOString())
    .lt('scheduled_at', nextDay.toISOString())
    .order('scheduled_at')

  const { data: professionals } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('role', 'profissional')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Agenda</h1>
        <NovoAgendamentoButton professionals={professionals ?? []} />
      </div>

      {/* Seletor de data */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {[-1, 0, 1, 2, 3, 4, 5, 6].map(offset => {
          const d = new Date()
          d.setDate(d.getDate() + offset)
          const iso = d.toISOString().split('T')[0]
          const isSelected = selectedDate.toISOString().split('T')[0] === iso
          return (
            <Link key={offset} href={`/agenda?data=${iso}`}>
              <div className={`flex flex-col items-center p-2.5 rounded-xl min-w-[52px] border transition-colors ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50 border-gray-200'}`}>
                <span className="text-xs opacity-80">
                  {d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                </span>
                <span className="text-lg font-bold leading-tight">{d.getDate()}</span>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Calendar className="h-4 w-4" />
        {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        <span className="ml-auto text-xs">{appointments?.length ?? 0} consulta(s)</span>
      </div>

      {/* Lista de agendamentos */}
      <div className="space-y-2">
        {!appointments?.length && (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>Nenhuma consulta neste dia</p>
          </div>
        )}
        {appointments?.map(apt => (
          <Link key={apt.id} href={`/pacientes/${apt.patients?.id}`}>
            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="text-center min-w-[44px]">
                  <p className="text-sm font-bold">
                    {new Date(apt.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{apt.patients?.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {apt.profiles?.name ?? 'Profissional não definido'}
                    {apt.session_number && ` · Sessão ${apt.session_number}`}
                  </p>
                </div>
                <Badge variant={
                  apt.status === 'completed' ? 'default' :
                  apt.status === 'cancelled' ? 'destructive' :
                  apt.status === 'no_show' ? 'secondary' : 'outline'
                }>
                  {apt.status === 'completed' ? 'Feita' :
                   apt.status === 'cancelled' ? 'Cancel.' :
                   apt.status === 'no_show' ? 'Faltou' : 'Agend.'}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
