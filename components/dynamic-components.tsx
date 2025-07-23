import React from 'react'
import dynamic from 'next/dynamic'

// 動態導入較大的組件以減少初始 bundle 大小
export const DynamicPodcastPlayer = dynamic(
  () => import('./podcast-player').then(mod => ({ default: mod.PodcastPlayer })),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-20 rounded-lg" />
    ),
    ssr: false, // 音頻播放器不需要 SSR
  }
)

export const DynamicCommentSection = dynamic(
  () => import('./comment-section').then(mod => ({ default: mod.CommentSection })),
  {
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
    ),
  }
)

export const DynamicStatsSection = dynamic(
  () => import('./stats-section').then(mod => ({ default: mod.StatsSection })),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-lg" />
    ),
  }
)

// 為特定的 recharts 組件創建動態導入
export const DynamicLineChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.LineChart })),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-lg" />
    ),
    ssr: false,
  }
)

export const DynamicBarChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.BarChart })),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-lg" />
    ),
    ssr: false,
  }
)

export const DynamicPieChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.PieChart })),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-lg" />
    ),
    ssr: false,
  }
)
