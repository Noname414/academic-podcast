import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../lib/database.types'

// 加載環境變量
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
    console.error('錯誤：缺少必要的環境變量')
    console.error('請確保設置了 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function setAdminRole(email: string) {
    try {
        console.log(`正在為用戶 ${email} 設置管理員權限...`)

        // 首先檢查用戶是否存在
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, email, role')
            .eq('email', email)
            .single()

        if (userError) {
            console.error('找不到用戶:', userError.message)
            console.log('請確保用戶已經註冊並完成登錄')
            return false
        }

        if (user.role === 'admin') {
            console.log(`用戶 ${email} 已經是管理員`)
            return true
        }

        // 更新用戶角色為管理員
        const { error: updateError } = await supabase
            .from('users')
            .update({ role: 'admin' })
            .eq('id', user.id)

        if (updateError) {
            console.error('更新用戶角色失敗:', updateError.message)
            return false
        }

        console.log(`✅ 成功將用戶 ${email} 設置為管理員`)
        return true

    } catch (error) {
        console.error('設置管理員權限時發生錯誤:', error)
        return false
    }
}

async function listAdmins() {
    try {
        console.log('📋 當前管理員列表:')

        const { data: admins, error } = await supabase
            .from('users')
            .select('email, created_at')
            .eq('role', 'admin')
            .order('created_at', { ascending: true })

        if (error) {
            console.error('獲取管理員列表失敗:', error.message)
            return
        }

        if (admins.length === 0) {
            console.log('  沒有管理員用戶')
        } else {
            admins.forEach((admin, index) => {
                console.log(`  ${index + 1}. ${admin.email} (${new Date(admin.created_at).toLocaleDateString()})`)
            })
        }

    } catch (error) {
        console.error('列出管理員時發生錯誤:', error)
    }
}

async function main() {
    const args = process.argv.slice(2)

    if (args.length === 0) {
        console.log('📚 用法:')
        console.log('  npm run set-admin <email>    # 設置指定用戶為管理員')
        console.log('  npm run set-admin --list     # 列出所有管理員')
        console.log('')
        console.log('⚠️  重要提醒:')
        console.log('  - 確保用戶已經註冊並至少登錄過一次')
        console.log('  - 需要 SUPABASE_SERVICE_ROLE_KEY 環境變量')
        process.exit(0)
    }

    if (args[0] === '--list' || args[0] === '-l') {
        await listAdmins()
        return
    }

    const email = args[0]
    if (!email || !email.includes('@')) {
        console.error('錯誤：請提供有效的電子郵件地址')
        process.exit(1)
    }

    const success = await setAdminRole(email)
    process.exit(success ? 0 : 1)
}

main().catch(console.error) 