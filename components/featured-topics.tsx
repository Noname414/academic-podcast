"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Brain, Eye, Cpu, Lightbulb, Stethoscope, Database, TrendingUp, ArrowRight, BookOpen, Microscope, Atom, Zap, Network, Bot, Palette } from "lucide-react"
import { getCategoryDisplayName } from "@/lib/utils"

type TopicData = {
  id: string
  name: string
  count: number
  views: number
  trending: number
  recentCount: number
}

const topicIcons: Record<string, React.ReactElement> = {
  // 標準 arXiv 分類格式（實際存在於資料庫中）
  "cs.CV": <Eye className="h-8 w-8" />,
  "cs.CL": <Brain className="h-8 w-8" />,
  "cs.AI": <Lightbulb className="h-8 w-8" />,
  "cs.LG": <Brain className="h-8 w-8" />,
  "cs.RO": <Bot className="h-8 w-8" />,
  "cs.IR": <Database className="h-8 w-8" />,
  "cs.LO": <Lightbulb className="h-8 w-8" />,
  "cs.SD": <Zap className="h-8 w-8" />,
  "cs.SE": <Cpu className="h-8 w-8" />,

  // 轉換後的 ID 格式（從 getCategoryStats 方法生成）
  "cs_cv": <Eye className="h-8 w-8" />,
  "cs_cl": <Brain className="h-8 w-8" />,
  "cs_ai": <Lightbulb className="h-8 w-8" />,
  "cs_lg": <Brain className="h-8 w-8" />,
  "cs_ro": <Bot className="h-8 w-8" />,
  "cs_ir": <Database className="h-8 w-8" />,
  "cs_lo": <Lightbulb className="h-8 w-8" />,
  "cs_sd": <Zap className="h-8 w-8" />,
  "cs_se": <Cpu className="h-8 w-8" />,

  // 默認選項
  "其他": <BookOpen className="h-8 w-8" />,
}

const topicColors: Record<string, { color: string; bgColor: string; textColor: string }> = {
  // 標準 arXiv 分類格式（實際存在於資料庫中）
  "cs.CV": {
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    textColor: "text-purple-700 dark:text-purple-300",
  },
  "cs.CL": {
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    textColor: "text-blue-700 dark:text-blue-300",
  },
  "cs.AI": {
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    textColor: "text-amber-700 dark:text-amber-300",
  },
  "cs.LG": {
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    textColor: "text-emerald-700 dark:text-emerald-300",
  },
  "cs.RO": {
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    textColor: "text-orange-700 dark:text-orange-300",
  },
  "cs.IR": {
    color: "from-indigo-500 to-blue-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
    textColor: "text-indigo-700 dark:text-indigo-300",
  },
  "cs.LO": {
    color: "from-slate-500 to-gray-500",
    bgColor: "bg-slate-50 dark:bg-slate-950/20",
    textColor: "text-slate-700 dark:text-slate-300",
  },
  "cs.SD": {
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-50 dark:bg-violet-950/20",
    textColor: "text-violet-700 dark:text-violet-300",
  },
  "cs.SE": {
    color: "from-teal-500 to-cyan-500",
    bgColor: "bg-teal-50 dark:bg-teal-950/20",
    textColor: "text-teal-700 dark:text-teal-300",
  },

  // 轉換後的 ID 格式（從 getCategoryStats 方法生成）
  "cs_cv": {
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    textColor: "text-purple-700 dark:text-purple-300",
  },
  "cs_cl": {
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    textColor: "text-blue-700 dark:text-blue-300",
  },
  "cs_ai": {
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    textColor: "text-amber-700 dark:text-amber-300",
  },
  "cs_lg": {
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    textColor: "text-emerald-700 dark:text-emerald-300",
  },
  "cs_ro": {
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    textColor: "text-orange-700 dark:text-orange-300",
  },
  "cs_ir": {
    color: "from-indigo-500 to-blue-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
    textColor: "text-indigo-700 dark:text-indigo-300",
  },
  "cs_lo": {
    color: "from-slate-500 to-gray-500",
    bgColor: "bg-slate-50 dark:bg-slate-950/20",
    textColor: "text-slate-700 dark:text-slate-300",
  },
  "cs_sd": {
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-50 dark:bg-violet-950/20",
    textColor: "text-violet-700 dark:text-violet-300",
  },
  "cs_se": {
    color: "from-teal-500 to-cyan-500",
    bgColor: "bg-teal-50 dark:bg-teal-950/20",
    textColor: "text-teal-700 dark:text-teal-300",
  },
}

const defaultStyle = {
  color: "from-gray-500 to-slate-500",
  bgColor: "bg-gray-50 dark:bg-gray-950/20",
  textColor: "text-gray-700 dark:text-gray-300",
}

export function FeaturedTopics() {
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null)
  const [topics, setTopics] = useState<TopicData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTopics() {
      try {
        const response = await fetch("/api/topics")
        const data = await response.json()
        setTopics(data.slice(0, 6)) // 只顯示前6個主題
      } catch (error) {
        console.error("Error fetching topics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopics()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="h-64 animate-pulse">
            <CardContent className="p-6">
              <div className="h-full bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {topics.map((topic) => {
        // 嘗試匹配分類名稱或ID，也檢查英文縮寫
        const style = topicColors[topic.name] || topicColors[topic.id] || defaultStyle
        const icon = topicIcons[topic.name] || topicIcons[topic.id] || topicIcons["其他"]

        return (
          <Link href={`/topics/${encodeURIComponent(topic.name)}`} key={topic.id} className="block group">
            <Card
              className={`h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 hover:border-primary/20 ${style.bgColor}`}
              onMouseEnter={() => setHoveredTopic(topic.id)}
              onMouseLeave={() => setHoveredTopic(null)}
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${style.color} text-white shadow-lg`}>
                    {icon}
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge variant="outline" className="font-medium">
                      {topic.count} 集
                    </Badge>
                    {topic.trending > 0 && (
                      <Badge variant="secondary" className="text-xs flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />+{topic.trending}
                      </Badge>
                    )}
                    {topic.recentCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        本月 +{topic.recentCount}
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className={`text-xl group-hover:${style.textColor} transition-colors`}>
                  {getCategoryDisplayName(topic.name)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-base leading-relaxed">
                  探索 {getCategoryDisplayName(topic.name)} 領域的最新研究和深度討論，包含 {topic.count} 集精彩內容。
                </CardDescription>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {topic.views.toLocaleString()} 次觀看
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`group-hover:${style.textColor} transition-all duration-200 ${hoveredTopic === topic.id ? "translate-x-1" : ""
                      }`}
                  >
                    探索更多
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
