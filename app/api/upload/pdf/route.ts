import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { db } from "@/lib/database-service"
import { randomUUID } from "crypto"

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_TYPES = ["application/pdf"]

export async function POST(request: NextRequest) {
    try {
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

        // 解析表單數據
        const formData = await request.formData()
        const file = formData.get("file") as File
        const title = formData.get("title") as string
        const authors = formData.get("authors") as string
        const abstract = formData.get("abstract") as string
        const priority = parseInt(formData.get("priority") as string) || 5

        if (!file) {
            return NextResponse.json({ error: "未找到檔案" }, { status: 400 })
        }

        // 驗證檔案類型
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: "不支援的檔案類型，請上傳PDF檔案" },
                { status: 400 }
            )
        }

        // 驗證檔案大小
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `檔案過大，最大支援${MAX_FILE_SIZE / 1024 / 1024}MB` },
                { status: 400 }
            )
        }

        // 生成唯一檔案名
        const fileExtension = file.name.split('.').pop()
        const uniqueFileName = `${randomUUID()}.${fileExtension}`
        const bucketPath = `pending/${uniqueFileName}`

        try {
            // 將檔案轉換為ArrayBuffer
            const bytes = await file.arrayBuffer()

            // 上傳到Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('pdf')
                .upload(bucketPath, bytes, {
                    contentType: file.type,
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) {
                console.error("Supabase storage upload error:", uploadError)
                throw new Error(`檔案上傳失敗: ${uploadError.message}`)
            }

            // 獲取公開URL
            const { data: { publicUrl } } = supabase.storage
                .from('pdf')
                .getPublicUrl(bucketPath)

            // 記錄到資料庫
            const uploadRecord = await db.createPendingUpload({
                user_id: user.id,
                original_filename: file.name,
                file_url: publicUrl,
                file_size: file.size,
                status: "pending",
                extracted_title: title || null,
                extracted_authors: authors ? authors.split(',').map(a => a.trim()) : null,
                extracted_abstract: abstract || null,
                priority,
            })

            return NextResponse.json({
                success: true,
                message: "檔案上傳成功",
                data: {
                    id: uploadRecord.id,
                    filename: file.name,
                    size: file.size,
                    status: uploadRecord.status,
                    url: publicUrl,
                },
            })

        } catch (fileError) {
            console.error("File upload error:", fileError)
            return NextResponse.json(
                { error: fileError instanceof Error ? fileError.message : "檔案上傳失敗" },
                { status: 500 }
            )
        }

    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json(
            {
                error: "上傳失敗",
                message: error instanceof Error ? error.message : "未知錯誤",
            },
            { status: 500 }
        )
    }
}

// 獲取用戶的上傳列表
export async function GET(request: NextRequest) {
    try {
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

        const uploads = await db.getPendingUploads(user.id)

        return NextResponse.json({
            success: true,
            data: uploads,
        })

    } catch (error) {
        console.error("Get uploads error:", error)
        return NextResponse.json(
            {
                error: "獲取上傳列表失敗",
                message: error instanceof Error ? error.message : "未知錯誤",
            },
            { status: 500 }
        )
    }
} 