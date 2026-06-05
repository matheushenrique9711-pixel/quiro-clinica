import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, DollarSign, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [
    { count: totalPatients },
    { count: todayAppointments },
    { data: warningPackages },
    { data: recentFinancial },
  ] = await Promise.all([
    supabase.from('patients').select('*', { count: 'exact', head: true }),
    supabase.from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('scheduled_at', today.toISOString())
      .lt('scheduled_at', tomorrow.toISOString())
      .eq('status', 'scheduled'),
    supabase.from('packages')
      .select('id, patient_id, total_sessions, used_sessions, patients(name)')
      .eq('status', 'active')
      .filter('total_sessions - used_sessions', 'lte', '2'),
    supabase.from('financial_records')
      .select('amount, paid_at, patients(name)')
      .order('paid_at', { ascending: false })
      .limit(5),
  ])

  const todayTotal = recentFinancial
    ?.filter(r => new Date(r.paid_at) >= today)
    .reduce((sum, r) => sum + r.amount, 0) ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bom dia! 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Link href="/pacientes">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-muted-foreground">Pacientes</span>
              </div>
              <p className="text-2xl font-bold">{totalPatients ?? 0}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/agenda">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-green-600" />
                <span className="text-xs text-muted-foreground">Hoje</span>
              </div>
              <p className="text-2xl font-bold">{todayAppointments ?? 0}</p>
              <p className="text-xs text-muted-foreground">consultas</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/financeiro">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <span className="text-xs text-muted-foreground">Hoje</span>
              </div>
              <p className="text-2xl font-bold">R${todayTotal.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">recebido</p>
            </CardContent>
          </Card>
        </Link>

        <Card className={warningPackages && warningPackages.length > 0 ? 'border-orange-300 bg-orange-50' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className={`h-4 w-4 ${warningPackages && warningPackages.length > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
              <span className="text-xs text-muted-foreground">Pacotes</span>
            </div>
            <p className="text-2xl font-bold">{warningPackages?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">acabando</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de pacotes acabando */}
      {warningPackages && warningPackages.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-orange-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Pacotes prestes a acabar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {warningPackages.map((pkg: any) => (
              <div key={pkg.id} className="flex items-center justify-between text-sm">
                <Link href={`/pacientes/${pkg.patient_id}`} className="font-medium hover:underline text-orange-900">
                  {pkg.patients?.name}
                </Link>
                <span className="text-orange-600 font-semibold">
                  {pkg.total_sessions - pkg.used_sessions} sessão(ões) restante(s)
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Últimos lançamentos */}
      {recentFinancial && recentFinancial.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Últimos lançamentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentFinancial.map((r: any, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{r.patients?.name}</span>
                <span className="font-semibold text-emerald-700">R$ {r.amount.toFixed(2)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
