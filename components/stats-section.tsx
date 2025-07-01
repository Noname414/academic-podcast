"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Clock, BookOpen } from "lucide-react"
import { useStats } from "@/hooks/use-stats"

export function StatsSection() {
  const { stats, loading } = useStats()

  if (loading) {
    return (
      <section className="mb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  const statsData = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      label: "總播客數",
      value: `${stats?.papersCount || 0}+`,
      change: "+12",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      icon: <Users className="h-6 w-6" />,
      label: "註冊用戶",
      value: `${((stats?.usersCount || 0) / 1000).toFixed(1)}K`,
      change: "+2.1K",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      label: "總收聽時長",
      value: `${((stats?.totalListeningHours || 0) / 1000).toFixed(1)}K`,
      change: "+5.2K",
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      unit: "小時",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      label: "總觀看次數",
      value: `${((stats?.totalViews || 0) / 1000).toFixed(1)}K`,
      change: "+8",
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
  ]

  return (
    <section className="mb-16">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <div className={stat.color}>{stat.icon}</div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {stat.change}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {stat.value}
                  {stat.unit && <span className="text-sm font-normal text-muted-foreground ml-1">{stat.unit}</span>}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
