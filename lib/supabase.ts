import { createClient } from "@supabase/supabase-js"
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from "./database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
    "Please check your .env.local file and ensure these variables are set correctly."
  )
}

// 舊版本兼容性 - 保留原有的客戶端
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// 新版本 - 客戶端 Supabase 實例（使用 SSR 方式）
export const createClientComponentClient = () => {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// 服務端 Supabase 實例 - 用於服務器組件
export const createServerComponentClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
