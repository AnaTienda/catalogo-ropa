import { createClient } from '@supabase/supabase-js'

// ⚠️  Reemplazá estos valores con los de tu proyecto Supabase:
//    Project URL → Settings → API → Project URL
//    Anon Key   → Settings → API → Project API Keys → anon / public
const supabaseUrl = 'https://njjcljvmeraobrsuqxlf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qamNsanZtZXJhb2Jyc3VxeGxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNjcxNTIsImV4cCI6MjA1OTc0MzE1Mn0.placeholder_replace_with_real_key'

// IMPORTANTE: La clave de arriba es un placeholder. 
// Copiá la "anon public" key desde tu dashboard de Supabase.
// NO uses la "sb_publishable_" key - esa no sirve para el cliente JS.

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
