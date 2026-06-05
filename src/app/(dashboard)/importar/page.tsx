'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Upload, FileText, CheckCircle } from 'lucide-react'

export default function ImportarPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<Record<string, string>[]>([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(0)
  const supabase = createClient()

  function parseCSV(text: string): Record<string, string>[] {
    const lines = text.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase())
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
      return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
    }).filter(row => row.nome || row.name)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = ev => {
      const rows = parseCSV(ev.target?.result as string)
      setPreview(rows.slice(0, 5))
    }
    reader.readAsText(f, 'utf-8')
  }

  async function handleImport() {
    if (!file) return
    setLoading(true)
    const reader = new FileReader()
    reader.onload = async ev => {
      const rows = parseCSV(ev.target?.result as string)
      let count = 0
      for (const row of rows) {
        const name = row.nome || row.name || row['nome completo'] || ''
        if (!name) continue
        await supabase.from('patients').insert({
          name,
          phone: row.telefone || row.phone || row.celular || null,
          email: row.email || null,
          birth_date: row['data nascimento'] || row.nascimento || row.birthdate || null,
          cpf: row.cpf || null,
          imported_from: 'versality',
          notes: row.observacoes || row.notes || null,
        })
        count++
      }
      setDone(count)
      toast.success(`${count} pacientes importados!`)
      setLoading(false)
    }
    reader.readAsText(file, 'utf-8')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Importar do Versality</h1>
      <p className="text-sm text-muted-foreground">Exporte os pacientes do Versality em CSV e faça o upload aqui.</p>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Upload className="h-4 w-4" /> Upload do arquivo CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
            <FileText className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">{file ? file.name : 'Clique para selecionar o CSV'}</span>
            <input type="file" accept=".csv" className="hidden" onChange={handleFile} />
          </label>

          {preview.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Prévia (5 primeiros registros):</p>
              <div className="space-y-1">
                {preview.map((row, i) => (
                  <div key={i} className="text-xs bg-gray-50 rounded px-2 py-1.5">
                    <span className="font-medium">{row.nome || row.name}</span>
                    {(row.telefone || row.phone) && <span className="text-muted-foreground ml-2">· {row.telefone || row.phone}</span>}
                    {row.email && <span className="text-muted-foreground ml-2">· {row.email}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {done > 0 && (
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 rounded-lg p-3">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{done} pacientes importados com sucesso!</span>
            </div>
          )}

          <Button
            className="w-full h-12"
            onClick={handleImport}
            disabled={!file || loading}
          >
            {loading ? 'Importando...' : 'Importar Pacientes'}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4 text-sm text-amber-800">
          <p className="font-medium mb-1">Colunas aceitas no CSV:</p>
          <p className="text-xs font-mono">nome, telefone, email, data nascimento, cpf, observacoes</p>
          <p className="text-xs mt-1">Nomes de coluna em inglês também são aceitos (name, phone, email...)</p>
        </CardContent>
      </Card>
    </div>
  )
}
