'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { DollarSign } from 'lucide-react'

const paymentMethods = [
  { value: 'pix', label: 'PIX' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'cartao_credito', label: 'Cartão Crédito' },
  { value: 'cartao_debito', label: 'Cartão Débito' },
  { value: 'transferencia', label: 'Transferência' },
]

export function LancamentoRapido({
  patientId,
  patientName,
  activePackageId,
}: {
  patientId: string
  patientName: string
  activePackageId?: string
}) {
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('pix')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Informe um valor válido')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('financial_records').insert({
      patient_id: patientId,
      package_id: activePackageId ?? null,
      amount: parseFloat(amount.replace(',', '.')),
      payment_method: method,
      notes: notes || null,
      paid_at: new Date().toISOString(),
    })
    if (error) {
      toast.error('Erro ao salvar lançamento')
    } else {
      toast.success(`R$ ${amount} registrado para ${patientName}`)
      setAmount('')
      setNotes('')
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <DollarSign className="h-4 w-4" /> Lançamento Rápido
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="amount" className="text-xs">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                placeholder="0,00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="h-12 text-lg font-semibold"
                step="0.01"
                min="0"
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs">Forma de pagamento</Label>
              <Select value={method} onValueChange={(v) => setMethod(v ?? 'pix')}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Input
            placeholder="Observação (opcional)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="h-10"
          />
          <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
            {loading ? 'Salvando...' : '💰 Registrar Pagamento'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
