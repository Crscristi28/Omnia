// 🏗️ SUPABASE CLIENT - Cloudová databáze a storage
// Používá Vercel environment variables (bez VITE_ prefixů)

import { createClient } from '@supabase/supabase-js'

// Environment variables z Vercel (ne VITE_!)
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ [SUPABASE] Missing environment variables. Cloud sync disabled.')
}

// Vytvoření Supabase klienta
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper funkce pro kontrolu připojení
export const isSupabaseReady = () => {
  return supabase !== null
}

// Export jako default
export default supabase