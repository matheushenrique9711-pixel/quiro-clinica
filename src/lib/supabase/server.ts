import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const SUPABASE_URL = 'https://ykhwgofkqxbxileymqpa.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlraHdnb2ZrcXhieGlsZXltcXBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NzUwNzMsImV4cCI6MjA5NjI1MTA3M30.o6aShHHxisv7T0jT5Gre7dqsTPpn_bN63eKrg9r4Njc'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
