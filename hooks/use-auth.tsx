'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { createClientComponentClient } from '@/lib/supabase'

interface AuthContextType {
    user: User | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<{ error?: string }>
    signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>
    signOut: () => Promise<void>
    signInWithGoogle: () => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 將 supabase 實例移到組件外部避免重複創建
const supabase = createClientComponentClient()

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    const syncUserToDatabase = useCallback(async (user: User) => {
        try {
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('id', user.id)
                .single()

            if (!existingUser) {
                await supabase.from('users').insert({
                    id: user.id,
                    email: user.email!,
                    name: user.user_metadata?.full_name || user.email!.split('@')[0],
                    avatar_url: user.user_metadata?.avatar_url
                })
            }
        } catch (error) {
            console.error('同步用戶數據失敗:', error)
        }
    }, [])

    useEffect(() => {
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user ?? null)
            setLoading(false)
        }

        getInitialSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null)
                setLoading(false)

                if (event === 'SIGNED_IN' && session?.user) {
                    await syncUserToDatabase(session.user)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [syncUserToDatabase])

    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) {
                return { error: error.message }
            }

            return {}
        } catch (error) {
            return { error: '登錄失敗，請稍後再試' }
        }
    }

    const signUp = async (email: string, password: string, name: string) => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name
                    }
                }
            })

            if (error) {
                return { error: error.message }
            }

            return {}
        } catch (error) {
            return { error: '註冊失敗，請稍後再試' }
        }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
    }

    const signInWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/api/auth/callback`
                }
            })

            if (error) {
                return { error: error.message }
            }

            return {}
        } catch (error) {
            return { error: 'Google 登錄失敗，請稍後再試' }
        }
    }

    const value = {
        user,
        loading,
        signIn,
        signUp,
        signOut,
        signInWithGoogle
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth 必須在 AuthProvider 內使用')
    }
    return context
} 