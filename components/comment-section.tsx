'use client'

import { useState, useEffect, FormEvent } from "react"
import type { User } from "@supabase/supabase-js"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthDialog } from "@/components/auth-dialog"
import { Heart, ThumbsUp, MessageSquare } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

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
    likes: number
    is_liked_by_user?: boolean
    replies?: Comment[]
}

interface CommentSectionProps {
    paperId: string
}

const CommentLikeButton = ({ comment, onLikeToggle }: { comment: Comment, onLikeToggle: (commentId: string, isLiked: boolean) => void }) => {
    const { user } = useAuth()
    const { toast } = useToast()

    const handleLike = async () => {
        if (!user) {
            toast({ title: "需要登入", description: "請先登入才能對評論按讚。", variant: "destructive" })
            return
        }

        const originalLikeStatus = comment.is_liked_by_user ?? false

        // Optimistic update
        onLikeToggle(comment.id, !originalLikeStatus)

        try {
            const response = await fetch(`/api/comments/${comment.id}/like`, {
                method: 'POST'
            })

            if (!response.ok) {
                const errorData = await response.json()
                if (response.status === 501 && errorData.sql) {
                    toast({
                        title: "資料庫功能尚未建立",
                        description: (
                            <div className="space-y-2">
                                <p>{errorData.message}</p>
                                <p className="font-semibold">請在 Supabase SQL Editor 中執行以下指令碼來修復:</p>
                                <pre className="mt-2 w-full rounded-md bg-slate-950 p-4 text-xs text-white overflow-auto">
                                    <code>{errorData.sql}</code>
                                </pre>
                            </div>
                        ),
                        duration: 20000,
                        variant: "destructive",
                    })
                } else {
                    throw new Error(errorData.message || "按讚失敗")
                }
                // Revert on failure
                onLikeToggle(comment.id, originalLikeStatus)
            }
        } catch (e) {
            onLikeToggle(comment.id, originalLikeStatus) // Revert on error
            toast({
                title: "發生錯誤",
                description: e instanceof Error ? e.message : "無法完成操作，請稍後再試。",
                variant: "destructive"
            })
        }
    }

    return (
        <Button variant="ghost" size="sm" onClick={handleLike} className="flex items-center gap-1 text-muted-foreground px-2 h-auto py-1">
            <ThumbsUp className={`h-4 w-4 ${comment.is_liked_by_user ? 'text-blue-500 fill-blue-500' : ''}`} />
            <span>{comment.likes}</span>
        </Button>
    )
}

const CommentForm = ({
    paperId,
    onCommentPosted,
    parentId = null,
    onCancel,
    autoFocus = false,
}: {
    paperId: string
    onCommentPosted: (newComment: Comment) => void
    parentId?: string | null
    onCancel?: () => void
    autoFocus?: boolean
}) => {
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paper_id: paperId,
                    content: content,
                    parent_id: parentId,
                }),
            })

            if (response.ok) {
                const newComment = await response.json()
                onCommentPosted(newComment)
                setContent("")
                if (onCancel) onCancel()
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
            <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                請先{' '}<AuthDialog><Button variant="link" className="p-0 h-auto">登入</Button></AuthDialog>{' '}才能發表評論。
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={parentId ? "寫下你的回覆..." : "在這裡寫下你的評論..."}
                rows={3}
                disabled={isSubmitting}
                autoFocus={autoFocus}
            />
            <div className="flex justify-end gap-2">
                {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>取消</Button>}
                <Button type="submit" disabled={!content.trim() || isSubmitting}>
                    {isSubmitting ? '發佈中...' : (parentId ? '回覆' : '發表評論')}
                </Button>
            </div>
        </form>
    )
}

const CommentItem = ({ comment, onLikeToggle, onReplyPosted, paperId }: { comment: Comment; onLikeToggle: (commentId: string, isLiked: boolean) => void; onReplyPosted: (reply: Comment, parentId: string) => void; paperId: string }) => {
    const [isReplying, setIsReplying] = useState(false)

    return (
        <div className="flex items-start space-x-4">
            <Avatar className="h-9 w-9">
                <AvatarImage src={comment.users?.avatar_url ?? undefined} alt={comment.users?.name ?? ''} />
                <AvatarFallback>{comment.users?.name?.charAt(0) ?? 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <p className="font-semibold">{comment.users?.name ?? '匿名用戶'}</p>
                    <p className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleDateString()}</p>
                </div>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                <div className="mt-2 flex items-center gap-2">
                    <CommentLikeButton comment={comment} onLikeToggle={onLikeToggle} />
                    <Button variant="ghost" size="sm" onClick={() => setIsReplying(!isReplying)} className="flex items-center gap-1 text-muted-foreground px-2 h-auto py-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>回覆</span>
                    </Button>
                </div>
                {isReplying && (
                    <div className="mt-4">
                        <CommentForm
                            paperId={paperId}
                            parentId={comment.id}
                            onCommentPosted={(newReply) => {
                                onReplyPosted(newReply, comment.id)
                                setIsReplying(false)
                            }}
                            onCancel={() => setIsReplying(false)}
                            autoFocus
                        />
                    </div>
                )}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 pl-8 border-l-2 border-gray-200 dark:border-gray-700 space-y-4">
                        {comment.replies.map((reply) => (
                            <CommentItem key={reply.id} comment={reply} onLikeToggle={onLikeToggle} onReplyPosted={onReplyPosted} paperId={paperId} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

const CommentList = ({ comments, onLikeToggle, onReplyPosted, paperId }: { comments: Comment[]; onLikeToggle: (commentId: string, isLiked: boolean) => void; onReplyPosted: (reply: Comment, parentId: string) => void; paperId: string }) => {
    return (
        <div className="space-y-6">
            {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} onLikeToggle={onLikeToggle} onReplyPosted={onReplyPosted} paperId={paperId} />
            ))}
        </div>
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

    const addCommentToState = (newComment: Comment, parentId: string | null = null) => {
        if (!parentId) {
            setComments(prev => [newComment, ...prev])
        } else {
            const addReplyRecursively = (allComments: Comment[], reply: Comment, pId: string): Comment[] => {
                return allComments.map(c => {
                    if (c.id === pId) {
                        const newReplies = c.replies ? [reply, ...c.replies] : [reply];
                        return { ...c, replies: newReplies };
                    }
                    if (c.replies && c.replies.length > 0) {
                        return { ...c, replies: addReplyRecursively(c.replies, reply, pId) };
                    }
                    return c;
                });
            };
            setComments(prev => addReplyRecursively(prev, newComment, parentId));
        }
    }

    const handleLikeToggle = (commentId: string, isLiked: boolean) => {
        setComments(prev =>
            prev.map(c => {
                if (c.id === commentId) {
                    const currentLikes = c.likes ?? 0
                    // Check if the like status is actually changing to prevent double counting
                    const likeStatusChanged = c.is_liked_by_user !== isLiked
                    const newLikes = likeStatusChanged ? (isLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1)) : currentLikes

                    return { ...c, is_liked_by_user: isLiked, likes: newLikes }
                }
                return c
            })
        )
    }

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold">評論區</h2>

            <CommentForm paperId={paperId} onCommentPosted={(newComment) => addCommentToState(newComment)} />

            {isLoading ? (
                <div className="space-y-6">
                    <Skeleton className="w-full h-20" />
                    <Skeleton className="w-full h-20" />
                </div>
            ) : comments.length > 0 ? (
                <CommentList
                    comments={comments}
                    onLikeToggle={handleLikeToggle}
                    onReplyPosted={(reply, parentId) => addCommentToState(reply, parentId)}
                    paperId={paperId}
                />
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">還沒有評論，快來搶沙發！</p>
            )}
        </div>
    )
} 