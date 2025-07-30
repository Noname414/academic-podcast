import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { type NextRequest } from "next/server"
import type { Database } from "./database.types"

/**
 * 檢查用戶是否為管理員
 * @param request - Next.js 請求對象
 * @returns Promise<{ isAdmin: boolean, user: any | null, error?: string }>
 */
export async function checkAdminAuth(request: NextRequest) {
    try {
        const supabase = createServerClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return request.cookies.get(name)?.value
                    },
                    set() {
                        // 這裡不需要設置cookies，只需要讀取
                    },
                    remove() {
                        // 這裡不需要移除cookies，只需要讀取
                    },
                },
            },
        )

        // 獲取當前用戶
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return {
                isAdmin: false,
                user: null,
                error: "未授權訪問"
            }
        }

        // 從數據庫獲取用戶角色
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single()

        if (userError || !userData) {
            return {
                isAdmin: false,
                user,
                error: "無法獲取用戶角色"
            }
        }

        const isAdmin = userData.role === 'admin'

        return {
            isAdmin,
            user,
            error: isAdmin ? undefined : "需要管理員權限"
        }

    } catch (error) {
        return {
            isAdmin: false,
            user: null,
            error: "權限檢查失敗"
        }
    }
}

/**
 * 管理員權限中間件包裝器
 * @param handler - API 處理函數
 * @returns 包裝後的處理函數，會先檢查管理員權限
 */
export function withAdminAuth<T extends any[]>(
    handler: (request: NextRequest, ...args: T) => Promise<Response>
) {
    return async (request: NextRequest, ...args: T): Promise<Response> => {
        const authResult = await checkAdminAuth(request)

        if (!authResult.isAdmin) {
            return new Response(
                JSON.stringify({
                    error: authResult.error || "需要管理員權限",
                    code: "ADMIN_REQUIRED"
                }),
                {
                    status: authResult.user ? 403 : 401,
                    headers: { "Content-Type": "application/json" }
                }
            )
        }

        return handler(request, ...args)
    }
} 