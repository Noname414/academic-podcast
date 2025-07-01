"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Brain, Eye, Cpu, Lightbulb, Stethoscope, Database, TrendingUp, ArrowRight, BookOpen, Microscope, Atom, Zap, Network, Bot, Palette } from "lucide-react"

type TopicData = {
  id: string
  name: string
  count: number
  views: number
  trending: number
  recentCount: number
}

const topicIcons: Record<string, React.ReactElement> = {
  // 英文分類
  "nlp": <Brain className="h-8 w-8" />,
  "cv": <Eye className="h-8 w-8" />,
  "rl": <Cpu className="h-8 w-8" />,
  "theory": <Lightbulb className="h-8 w-8" />,
  "medical": <Stethoscope className="h-8 w-8" />,
  "data": <Database className="h-8 w-8" />,
  "ml": <Brain className="h-8 w-8" />,
  "dl": <Cpu className="h-8 w-8" />,
  "ai": <Lightbulb className="h-8 w-8" />,
  "robotics": <Bot className="h-8 w-8" />,
  "graphics": <Palette className="h-8 w-8" />,
  "network": <Network className="h-8 w-8" />,
  "optimization": <Zap className="h-8 w-8" />,
  // 中文分類
  "自然語言處理": <Brain className="h-8 w-8" />,
  "電腦視覺": <Eye className="h-8 w-8" />,
  "強化學習": <Cpu className="h-8 w-8" />,
  "理論研究": <Lightbulb className="h-8 w-8" />,
  "醫療AI": <Stethoscope className="h-8 w-8" />,
  "數據科學": <Database className="h-8 w-8" />,
  "機器學習": <Brain className="h-8 w-8" />,
  "深度學習": <Cpu className="h-8 w-8" />,
  "人工智慧": <Lightbulb className="h-8 w-8" />,
  "生物資訊": <Microscope className="h-8 w-8" />,
  "物理學": <Atom className="h-8 w-8" />,
  "文字轉圖像生成 (Text-to-Image Generation)": <Eye className="h-8 w-8" />,
  "其他": <BookOpen className="h-8 w-8" />,
}

const topicColors: Record<string, { color: string; bgColor: string; textColor: string }> = {
  // 英文分類
  "nlp": {
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    textColor: "text-blue-700 dark:text-blue-300",
  },
  "cv": {
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    textColor: "text-purple-700 dark:text-purple-300",
  },
  "rl": {
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    textColor: "text-green-700 dark:text-green-300",
  },
  "theory": {
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    textColor: "text-amber-700 dark:text-amber-300",
  },
  "medical": {
    color: "from-red-500 to-rose-500",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    textColor: "text-red-700 dark:text-red-300",
  },
  "data": {
    color: "from-indigo-500 to-blue-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
    textColor: "text-indigo-700 dark:text-indigo-300",
  },
  "robotics": {
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    textColor: "text-orange-700 dark:text-orange-300",
  },
  "graphics": {
    color: "from-pink-500 to-purple-500",
    bgColor: "bg-pink-50 dark:bg-pink-950/20",
    textColor: "text-pink-700 dark:text-pink-300",
  },
  "network": {
    color: "from-cyan-500 to-teal-500",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/20",
    textColor: "text-cyan-700 dark:text-cyan-300",
  },
  "optimization": {
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    textColor: "text-yellow-700 dark:text-yellow-300",
  },
  // 中文分類
  "自然語言處理": {
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    textColor: "text-blue-700 dark:text-blue-300",
  },
  "電腦視覺": {
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    textColor: "text-purple-700 dark:text-purple-300",
  },
  "強化學習": {
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    textColor: "text-green-700 dark:text-green-300",
  },
  "理論研究": {
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    textColor: "text-amber-700 dark:text-amber-300",
  },
  "醫療AI": {
    color: "from-red-500 to-rose-500",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    textColor: "text-red-700 dark:text-red-300",
  },
  "數據科學": {
    color: "from-indigo-500 to-blue-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
    textColor: "text-indigo-700 dark:text-indigo-300",
  },
  "文字轉圖像生成 (Text-to-Image Generation)": {
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    textColor: "text-purple-700 dark:text-purple-300",
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
                  {topic.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-base leading-relaxed">
                  探索 {topic.name} 領域的最新研究和深度討論，包含 {topic.count} 集精彩內容。
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
