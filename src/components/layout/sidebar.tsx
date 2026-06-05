'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  Users, Calendar, DollarSign, BarChart2,
  Upload, LogOut, Menu, X, Home
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/dashboard',       label: 'Início',      icon: Home },
  { href: '/pacientes',       label: 'Pacientes',   icon: Users },
  { href: '/agenda',          label: 'Agenda',      icon: Calendar },
  { href: '/financeiro',      label: 'Financeiro',  icon: DollarSign },
  { href: '/relatorios',      label: 'Relatórios',  icon: BarChart2 },
  { href: '/importar',        label: 'Importar',    icon: Upload },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b h-14 flex items-center px-4 gap-3">
        <button onClick={() => setOpen(true)} className="p-1">
          <Menu className="h-6 w-6" />
        </button>
        <span className="font-semibold text-lg">🦴 Quiro Clínica</span>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-64 bg-white h-full flex flex-col shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-bold text-lg">🦴 Quiro Clínica</span>
              <button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                    pathname.startsWith(href) && href !== '/dashboard'
                      ? 'bg-blue-600 text-white'
                      : pathname === href && href === '/dashboard'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {label}
                </Link>
              ))}
            </nav>
            <div className="p-3 border-t">
              <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-60 lg:bg-white lg:border-r">
        <div className="p-5 border-b">
          <span className="font-bold text-xl">🦴 Quiro Clínica</span>
          <p className="text-xs text-muted-foreground mt-0.5">Quiropraxia Pinheiros</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname.startsWith(href) && href !== '/dashboard'
                  ? 'bg-blue-600 text-white'
                  : pathname === href && href === '/dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t">
          <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            Sair
          </Button>
        </div>
      </div>
    </>
  )
}
