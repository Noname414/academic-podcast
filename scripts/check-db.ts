import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../lib/database.types'

// 加載環境變量
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
    console.error('錯誤：缺少必要的環境變量')
    process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function checkDatabase() {
    try {
        console.log('🔍 檢查數據庫狀態...')

        // 檢查 users 表結構
        console.log('\n1. 檢查 users 表是否存在...')
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('*')
            .limit(1)

        if (usersError) {
            console.error('Users 表錯誤:', usersError.message)
        } else {
            console.log('✅ Users 表存在，查詢成功')
            if (users.length > 0) {
                console.log('示例用戶數據:', JSON.stringify(users[0], null, 2))
            } else {
                console.log('🔸 Users 表為空')
            }
        }

        // 直接嘗試查詢 role 欄位
        console.log('\n2. 檢查 role 欄位...')
        const { data: roleData, error: roleError } = await supabase
            .from('users')
            .select('id, email, role')
            .limit(1)

        if (roleError) {
            console.error('Role 欄位錯誤:', roleError.message)
        } else {
            console.log('✅ Role 欄位存在並可查詢')
            console.log('Role 查詢結果:', roleData)
        }

    } catch (error) {
        console.error('檢查數據庫時發生錯誤:', error)
    }
}

checkDatabase().then(() => {
    console.log('\n🎯 數據庫檢查完成')
}).catch(console.error) 