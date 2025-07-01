'use client'

import { useState, useEffect, FormEvent } from "react"
import type { User } from "@supabase/supabase-js"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

// Define the type for a comment, based on what the API returns
interface Comment {
    id: string
    created_at: string
    content: string
    parent_id: string | null
    users: {
        name: string
        avatar_url: string | null
    } | null
}

interface CommentSectionProps {
    paperId: string
}

const CommentItem = ({ comment }: { comment: Comment }) => {
    return (
        <div className="flex items-start space-x-4">
            <Avatar>
                <AvatarImage src={comment.users?.avatar_url ?? undefined} alt={comment.users?.name} />
                <AvatarFallback>{comment.users?.name?.charAt(0) ?? 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <p className="font-semibold">{comment.users?.name ?? '匿名用戶'}</p>
                    <p className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                </div>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
            </div>
        </div>
    )
}

const CommentList = ({ comments }: { comments: Comment[] }) => {
    return (
        <div className="space-y-6">
            {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
            ))}
        </div>
    )
}

const CommentForm = ({ paperId, onCommentPosted }: { paperId: string, onCommentPosted: (newComment: Comment) => void }) => {
    const { user } = useAuth()
    const [content, setContent] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!content.trim() || !user) return

        setIsSubmitting(true)
        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paper_id: paperId,
                    content: content,
                }),
            })

            if (response.ok) {
                const newComment = await response.json()
                onCommentPosted(newComment)
                setContent("")
            } else {
                console.error("Failed to post comment")
            }
        } catch (error) {
            console.error("Error posting comment:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!user) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-400">
                請先 <Button variant="link" className="p-0 h-auto">登入</Button> 才能發表評論。
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="在這裡寫下你的評論..."
                rows={4}
                disabled={isSubmitting}
            />
            <div className="flex justify-end">
                <Button type="submit" disabled={!content.trim() || isSubmitting}>
                    {isSubmitting ? '發佈中...' : '發表評論'}
                </Button>
            </div>
        </form>
    )
}


export function CommentSection({ paperId }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchComments = async () => {
            setIsLoading(true)
            try {
                const response = await fetch(`/api/comments?paper_id=${paperId}`)
                if (response.ok) {
                    const data = await response.json()
                    setComments(data)
                } else {
                    console.error("Failed to fetch comments")
                    setComments([])
                }
            } catch (error) {
                console.error("Error fetching comments:", error)
                setComments([])
            } finally {
                setIsLoading(false)
            }
        }

        if (paperId) {
            fetchComments()
        }
    }, [paperId])

    const handleCommentPosted = (newComment: Comment) => {
        setComments(prevComments => [newComment, ...prevComments])
    }

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold">評論區</h2>

            <CommentForm paperId={paperId} onCommentPosted={handleCommentPosted} />

            {isLoading ? (
                <div className="space-y-6">
                    <Skeleton className="w-full h-20" />
                    <Skeleton className="w-full h-20" />
                </div>
            ) : comments.length > 0 ? (
                <CommentList comments={comments} />
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">還沒有評論，快來搶沙發！</p>
            )}
        </div>
    )
} 