import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Rota temporária para definir senha — remover após uso
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (token !== 'quiro-setup-2026') {
    return NextResponse.json({ error: 'não autorizado' }, { status: 401 })
  }

  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').replace(/\s+/g, '')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: users } = await supabase.auth.admin.listUsers()
  const user = users?.users?.find(u => u.email === 'matheus.henrique9711@gmail.com')

  if (!user) {
    // Cria o usuário se não existir
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'matheus.henrique9711@gmail.com',
      password: 'Quiro2026!',
      email_confirm: true,
      user_metadata: { name: 'Matheus' }
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await supabase.from('profiles').update({ role: 'admin', name: 'Matheus' }).eq('user_id', data.user.id)
    return NextResponse.json({ ok: true, acao: 'criado', email: data.user.email })
  }

  // Atualiza a senha
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    password: 'Quiro2026!',
    email_confirm: true,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('profiles').update({ role: 'admin', name: 'Matheus' }).eq('user_id', user.id)

  return NextResponse.json({
    ok: true,
    acao: 'senha atualizada',
    email: user.email,
    url_usada: process.env.NEXT_PUBLIC_SUPABASE_URL,
  })
}
