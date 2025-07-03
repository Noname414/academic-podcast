'use client'

import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'

interface Notification {
    id: string;
    type: string;
    is_read: boolean;
    created_at: string;
    related_paper_id: string;
    related_comment_id: string;
    triggering_user: {
        name: string;
    } | null;
    paper: {
        title: string;
    } | null;
}

const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) {
        throw new Error('Failed to fetch notifications')
    }
    return res.json()
})

export function useNotifications() {
    const { data, error, mutate } = useSWR<Notification[]>('/api/notifications', fetcher, {
        refreshInterval: 60000, // Refresh every 60 seconds
    })

    // Ensure data is an array before using array methods
    const notificationsData = Array.isArray(data) ? data : []

    const unreadCount = notificationsData.filter(n => !n.is_read).length

    const markAllAsRead = useCallback(async () => {
        if (!notificationsData || unreadCount === 0) return

        const unreadIds = notificationsData.filter(n => !n.is_read).map(n => n.id)

        // Optimistic update
        const optimisticData = notificationsData.map(n => ({ ...n, is_read: true }))
        mutate(optimisticData, false)

        try {
            await fetch('/api/notifications/mark-as-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationIds: unreadIds }),
            })
            // Revalidate to get the latest state from the server
            mutate()
        } catch (e) {
            // Revert on error
            mutate(notificationsData)
            console.error("Failed to mark notifications as read", e)
        }
    }, [notificationsData, unreadCount, mutate])

    return {
        notifications: notificationsData,
        isLoading: !error && !data,
        isError: error,
        unreadCount,
        markAllAsRead,
    }
} 