import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    // 檢查用戶會話
    const { data: { user } } = await supabase.auth.getUser()

    // 保護需要身份驗證的路由
    const protectedPaths = ['/admin', '/profile', '/favorites', '/history', '/settings']
    const currentPath = request.nextUrl.pathname

    const isProtectedPath = protectedPaths.some(path =>
        currentPath.startsWith(path)
    )

    if (isProtectedPath && !user) {
        // 如果訪問受保護路由但未登錄，重定向到主頁
        const redirectUrl = new URL('/', request.url)
        redirectUrl.searchParams.set('auth', 'required')
        return NextResponse.redirect(redirectUrl)
    }

    return response
}

export const config = {
    matcher: [
        /*
         * 匹配所有請求路徑，除了以下開頭的：
         * - _next/static (靜態文件)
         * - _next/image (圖像優化文件)
         * - favicon.ico (favicon 文件)
         * - public 文件夾中的文件
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
} 