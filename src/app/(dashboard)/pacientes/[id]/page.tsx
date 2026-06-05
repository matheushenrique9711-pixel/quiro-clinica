import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Phone, Mail, Calendar, Package, DollarSign, AlertTriangle, ArrowLeft } from 'lucide-react'
import { LancamentoRapido } from '@/components/financeiro/lancamento-rapido'

export default async function PacientePerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: patient },
    { data: anamnese },
    { data: packages },
    { data: appointments },
  ] = await Promise.all([
    supabase.from('patients').select('*').eq('id', id).single(),
    supabase.from('anamneses').select('*, profiles(name)').eq('patient_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('packages').select('*, profiles(name)').eq('patient_id', id).order('created_at', { ascending: false }),
    supabase.from('appointments').select('*, profiles(name)').eq('patient_id', id).order('scheduled_at', { ascending: false }).limit(10),
  ])

  if (!patient) notFound()

  const activePackage = packages?.find(p => p.status === 'active')
  const sessionsLeft = activePackage ? activePackage.total_sessions - activePackage.used_sessions : null
  const packageWarning = sessionsLeft !== null && sessionsLeft <= 2

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/pacientes">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">{patient.name}</h1>
          <p className="text-sm text-muted-foreground">
            {patient.created_at && `Paciente desde ${new Date(patient.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`}
          </p>
        </div>
      </div>

      {/* Destaques da anamnese — aparecem sempre no topo */}
      {anamnese?.highlights && anamnese.highlights.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-blue-700">📌 Destaques da Avaliação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {anamnese.highlights.map((h: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-sm text-blue-900">
                <span className="mt-0.5 text-blue-500">•</span>
                <span className="font-medium">{h}</span>
              </div>
            ))}
            {anamnese.queixa_principal && (
              <p className="text-xs text-blue-600 mt-2 pt-2 border-t border-blue-200">
                <strong>Queixa principal:</strong> {anamnese.queixa_principal}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Alerta de pacote acabando */}
      {packageWarning && (
        <Card className="border-orange-300 bg-orange-50">
          <CardContent className="p-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0" />
            <p className="text-sm text-orange-800 font-medium">
              Pacote com apenas <strong>{sessionsLeft}</strong> sessão(ões) restante(s). Hora de renovar!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Contatos */}
      <Card>
        <CardContent className="p-4 space-y-2">
          {patient.phone && (
            <a href={`tel:${patient.phone}`} className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{patient.phone}</span>
            </a>
          )}
          {patient.email && (
            <a href={`mailto:${patient.email}`} className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{patient.email}</span>
            </a>
          )}
          {patient.birth_date && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(patient.birth_date).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pacote ativo */}
      {activePackage && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" /> Pacote Ativo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold">{activePackage.used_sessions}<span className="text-muted-foreground text-lg">/{activePackage.total_sessions}</span></p>
                <p className="text-xs text-muted-foreground">sessões usadas</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-emerald-600">R$ {activePackage.value.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">valor do pacote</p>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${packageWarning ? 'bg-orange-400' : 'bg-blue-500'}`}
                style={{ width: `${(activePackage.used_sessions / activePackage.total_sessions) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {sessionsLeft} sessão(ões) restante(s) · Prof. {activePackage.profiles?.name ?? '—'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Lançamento rápido */}
      <LancamentoRapido patientId={id} patientName={patient.name} activePackageId={activePackage?.id} />

      {/* Histórico de consultas */}
      {appointments && appointments.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Histórico de Consultas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {appointments.map(apt => (
              <div key={apt.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                <div>
                  <p className="font-medium">
                    {new Date(apt.scheduled_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })}
                    {apt.session_number && <span className="text-muted-foreground ml-1">· Sessão {apt.session_number}</span>}
                  </p>
                  {apt.profiles?.name && <p className="text-xs text-muted-foreground">{apt.profiles.name}</p>}
                </div>
                <Badge variant={
                  apt.status === 'completed' ? 'default' :
                  apt.status === 'cancelled' ? 'destructive' :
                  apt.status === 'no_show' ? 'secondary' : 'outline'
                }>
                  {apt.status === 'completed' ? 'Realizada' :
                   apt.status === 'cancelled' ? 'Cancelada' :
                   apt.status === 'no_show' ? 'Faltou' : 'Agendada'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
