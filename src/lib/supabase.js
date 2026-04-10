import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://njjcljvmeraobrsuqxlf.supabase.co'
const supabaseKey = 'sb_publishable_1YgM8O_k8ceOfZflCys7vw_lNLNHanD'

export const supabase = createClient(supabaseUrl, supabaseKey)