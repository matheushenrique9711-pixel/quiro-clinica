'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function NovoAgendamentoButton({ professionals }: { professionals: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [patientSearch, setPatientSearch] = useState('')
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([])
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string } | null>(null)
  const [professionalId, setProfessionalId] = useState(professionals[0]?.id ?? '')
  const [datetime, setDatetime] = useState('')
  const [notes, setNotes] = useState('')
  const supabase = createClient()
  const router = useRouter()

  async function searchPatients(q: string) {
    setPatientSearch(q)
    if (q.length < 2) { setPatients([]); return }
    const { data } = await supabase.from('patients').select('id, name').ilike('name', `%${q}%`).limit(5)
    setPatients(data ?? [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPatient || !datetime) { toast.error('Preencha todos os campos'); return }
    setLoading(true)
    const { error } = await supabase.from('appointments').insert({
      patient_id: selectedPatient.id,
      professional_id: professionalId || null,
      scheduled_at: new Date(datetime).toISOString(),
      status: 'scheduled',
      notes: notes || null,
    })
    if (error) {
      toast.error('Erro ao agendar')
    } else {
      toast.success(`${selectedPatient.name} agendado!`)
      setOpen(false)
      setSelectedPatient(null)
      setPatientSearch('')
      setDatetime('')
      setNotes('')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Agendar</Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Paciente</Label>
            {selectedPatient ? (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <span className="font-medium text-sm">{selectedPatient.name}</span>
                <button type="button" className="text-xs text-muted-foreground hover:text-red-500" onClick={() => { setSelectedPatient(null); setPatientSearch('') }}>trocar</button>
              </div>
            ) : (
              <div className="relative">
                <Input placeholder="Buscar paciente..." value={patientSearch} onChange={e => searchPatients(e.target.value)} className="h-11" />
                {patients.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg overflow-hidden">
                    {patients.map(p => (
                      <button key={p.id} type="button" className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 border-b last:border-0" onClick={() => { setSelectedPatient(p); setPatients([]) }}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <Label>Data e Hora</Label>
            <Input type="datetime-local" value={datetime} onChange={e => setDatetime(e.target.value)} className="h-11" required />
          </div>

          {professionals.length > 0 && (
            <div className="space-y-1">
              <Label>Profissional</Label>
              <Select value={professionalId} onValueChange={(v) => setProfessionalId(v ?? '')}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {professionals.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <Input placeholder="Observações (opcional)" value={notes} onChange={e => setNotes(e.target.value)} className="h-10" />
          <Button type="submit" className="w-full h-11" disabled={loading}>{loading ? 'Agendando...' : 'Confirmar Agendamento'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
