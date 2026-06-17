import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = 'https://ykhwgofkqxbxileymqpa.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlraHdnb2ZrcXhieGlsZXltcXBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NzUwNzMsImV4cCI6MjA5NjI1MTA3M30.o6aShHHxisv7T0jT5Gre7dqsTPpn_bN63eKrg9r4Njc'

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
