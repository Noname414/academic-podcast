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

async function addRoleColumn() {
    try {
        console.log('🔧 正在通過 Supabase 添加 role 欄位...')

        // 使用 Supabase 的 RPC 功能執行 SQL
        const { data, error } = await supabase.rpc('exec_sql', {
            sql: `
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'users' AND column_name = 'role'
                    ) THEN
                        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user'));
                        UPDATE users SET role = 'user' WHERE role IS NULL;
                    END IF;
                END $$;
            `
        })

        if (error) {
            console.error('添加 role 欄位失敗:', error.message)

            // 如果 RPC 不可用，嘗試直接通過 REST API
            console.log('🔄 嘗試替代方法...')

            // 通過直接查詢添加欄位（這可能需要在 Supabase Dashboard 中手動執行）
            console.log(`
                請在 Supabase Dashboard 的 SQL 編輯器中執行以下 SQL：

                ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user'));
                UPDATE users SET role = 'user' WHERE role IS NULL;
            `)

            return false
        } else {
            console.log('✅ Role 欄位添加成功')
            return true
        }

    } catch (error) {
        console.error('執行過程中發生錯誤:', error)
        return false
    }
}

async function verifyRoleColumn() {
    try {
        console.log('🔍 驗證 role 欄位...')

        const { data, error } = await supabase
            .from('users')
            .select('id, email, role')
            .limit(1)

        if (error) {
            console.error('驗證失敗:', error.message)
            return false
        } else {
            console.log('✅ Role 欄位驗證成功')
            return true
        }
    } catch (error) {
        console.error('驗證過程中發生錯誤:', error)
        return false
    }
}

async function main() {
    console.log('🚀 開始修復 users 表...')

    const added = await addRoleColumn()
    if (added) {
        const verified = await verifyRoleColumn()
        if (verified) {
            console.log('🎉 修復完成！現在可以設置管理員了。')
        }
    } else {
        console.log(`
            ⚠️  請手動執行以下步驟：
            
            1. 前往 Supabase Dashboard
            2. 打開 SQL 編輯器
            3. 執行以下 SQL：
            
            ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user'));
            UPDATE users SET role = 'user' WHERE role IS NULL;
            
            4. 然後重新運行管理員設置腳本
        `)
    }
}

main().catch(console.error) 