import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Hardcoded credentials to bypass environment variable issues
export const SUPABASE_URL = "https://urisspjzqickpatpvslg.supabase.co"
export const SUPABASE_ANON_KEY = "sb_publishable_-1RCOdOIj84D04W10swE6w_u6YnwAIb"

const supabaseUrl = SUPABASE_URL
const supabaseKey = SUPABASE_ANON_KEY

export const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

// Export createClient function for API routes
export function createClient() {
    return createSupabaseClient(supabaseUrl, supabaseKey);
}
