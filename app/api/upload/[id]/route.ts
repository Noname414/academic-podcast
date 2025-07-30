import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { db } from "@/lib/database-service"

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // 驗證用戶認證
        let response = NextResponse.next()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return request.cookies.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        response.cookies.set({ name, value, ...options })
                    },
                    remove(name: string, options: CookieOptions) {
                        response.cookies.set({ name, value: "", ...options })
                    },
                },
            },
        )

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "未授權訪問" }, { status: 401 })
        }

        // 獲取待刪除的上傳記錄
        const { data: upload, error: fetchError } = await supabase
            .from("pending_uploads")
            .select("*")
            .eq("id", id)
            .eq("user_id", user.id) // 確保只能刪除自己的上傳
            .single()

        if (fetchError || !upload) {
            return NextResponse.json(
                { error: "找不到指定的上傳記錄" },
                { status: 404 }
            )
        }

        // 從Supabase Storage刪除檔案
        if (upload.file_url) {
            // 從公開URL提取bucket路徑
            const urlParts = upload.file_url.split('/storage/v1/object/public/pdf/')
            if (urlParts.length > 1) {
                const bucketPath = urlParts[1]
                try {
                    const { error } = await supabase.storage
                        .from('pdf')
                        .remove([bucketPath])

                    if (error) {
                        console.error("Failed to delete file from Supabase Storage:", error)
                        // 不拋出錯誤，繼續刪除資料庫記錄
                    }
                } catch (fileError) {
                    console.error("Failed to delete file:", fileError)
                    // 不拋出錯誤，繼續刪除資料庫記錄
                }
            }
        }

        // 從資料庫刪除記錄
        const result = await db.deletePendingUpload(id)

        if (!result.success) {
            return NextResponse.json(
                { error: "刪除失敗" },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: "已成功刪除"
        })

    } catch (error) {
        console.error("Delete upload error:", error)
        return NextResponse.json(
            {
                error: "刪除失敗",
                message: error instanceof Error ? error.message : "未知錯誤",
            },
            { status: 500 }
        )
    }
} 