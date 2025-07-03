import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
    console.warn("Supabase admin client not initialized. Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.")
}

// The admin client is initialized with the service_role key for privileged operations.
// It should only be used in secure, server-side environments.
export const supabaseAdmin = supabaseUrl && serviceRoleKey
    ? createClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : null 