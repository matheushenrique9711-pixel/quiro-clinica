import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users, Package, AlertCircle } from 'lucide-react'

export default async function RelatoriosPage() {
  const supabase = await createClient()

  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const [
    { data: monthFinancial },
    { data: monthAppointments },
    { data: inactivePatients },
    { data: openPackages },
  ] = await Promise.all([
    supabase.from('financial_records')
      .select('amount, payment_method')
      .gte('paid_at', firstOfMonth.toISOString()),
    supabase.from('appointments')
      .select('status, package_id')
      .gte('scheduled_at', firstOfMonth.toISOString()),
    // Pacientes com pacote ativo mas sem consulta há 6 meses
    supabase.from('patients')
      .select('id, name, appointments(scheduled_at)')
      .eq('appointments.status', 'completed'),
    supabase.from('packages')
      .select('id, patient_id, total_sessions, used_sessions, value, patients(name)')
      .eq('status', 'active')
      .gt('total_sessions - used_sessions', 0),
  ])

  const totalMonth = monthFinancial?.reduce((s, r) => s + r.amount, 0) ?? 0
  const completedApts = monthAppointments?.filter(a => a.status === 'completed').length ?? 0
  const cancelledApts = monthAppointments?.filter(a => a.status === 'cancelled').length ?? 0
  const newPackagesSold = monthAppointments?.filter(a => a.package_id).length ?? 0

  // Detectar pacientes inativos com sessões restantes
  const inactive = openPackages?.filter(pkg => {
    const apts = (pkg as any).patients
    return true // simplificado — agente cuida disso
  }) ?? []

  const byMethod = monthFinancial?.reduce((acc: Record<string, number>, r) => {
    const m = r.payment_method ?? 'outros'
    acc[m] = (acc[m] ?? 0) + r.amount
    return acc
  }, {}) ?? {}

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Relatório Mensal</h1>
      <p className="text-sm text-muted-foreground">
        {firstOfMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
      </p>

      {/* Financeiro */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-600" /> Financeiro do Mês</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center py-2">
            <p className="text-3xl font-bold text-emerald-600">R$ {totalMonth.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">total recebido</p>
          </div>
          <div className="space-y-1.5">
            {Object.entries(byMethod).map(([method, amount]) => (
              <div key={method} className="flex justify-between text-sm">
                <span className="capitalize text-muted-foreground">{method.replace('_', ' ')}</span>
                <span className="font-medium">R$ {(amount as number).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Consultas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-blue-600" /> Consultas do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{completedApts}</p>
              <p className="text-xs text-muted-foreground">realizadas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-500">{cancelledApts}</p>
              <p className="text-xs text-muted-foreground">canceladas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{newPackagesSold}</p>
              <p className="text-xs text-muted-foreground">em pacotes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pacotes abertos */}
      {openPackages && openPackages.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Package className="h-4 w-4 text-purple-600" /> Pacotes Ativos com Saldo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {openPackages.slice(0, 10).map((pkg: any) => (
              <div key={pkg.id} className="flex justify-between text-sm">
                <span>{pkg.patients?.name}</span>
                <Badge variant="outline">{pkg.total_sessions - pkg.used_sessions} sessão(ões)</Badge>
              </div>
            ))}
            {openPackages.length > 10 && (
              <p className="text-xs text-muted-foreground text-center">+{openPackages.length - 10} pacotes</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Aviso agente */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">Agente de acompanhamento ativo</p>
            <p className="text-xs text-blue-600 mt-0.5">O agente monitora automaticamente pacientes inativos há +6 meses com sessões restantes e envia alertas todo mês.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
