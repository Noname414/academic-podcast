"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Calendar } from "@/components/ui/calendar"
import { Filter, X, CalendarIcon, Clock, Tag } from "lucide-react"

interface FilterState {
  category?: string
  tags: string[]
  durationRange: [number, number]
  dateRange?: Date
}

interface SearchFiltersProps {
  onCategoryChange: (category: string) => void
  onFiltersChange: (filters: FilterState) => void
}

export function SearchFilters({ onCategoryChange, onFiltersChange }: SearchFiltersProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [durationRange, setDurationRange] = useState<[number, number]>([0, 60])
  const [dateRange, setDateRange] = useState<Date | undefined>()
  const [showFilters, setShowFilters] = useState(false)

  const availableTags = [
    "大型語言模型",
    "電腦視覺",
    "強化學習",
    "醫療AI",
    "自監督學習",
    "多模態",
    "圖神經網絡",
    "聯邦學習",
    "可解釋AI",
    "生物信息學",
  ]

  // 當篩選條件變化時，通知父組件
  useEffect(() => {
    const filters: FilterState = {
      tags: selectedTags,
      durationRange,
      dateRange,
    }
    onFiltersChange(filters)
  }, [selectedTags, durationRange, dateRange])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleDurationChange = (value: number[]) => {
    setDurationRange([value[0], value[1]])
  }

  const clearAllFilters = () => {
    setSelectedTags([])
    setDurationRange([0, 60])
    setDateRange(undefined)
    onCategoryChange("all")
  }

  const hasActiveFilters = selectedTags.length > 0 || durationRange[0] > 0 || durationRange[1] < 60 || dateRange

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Popover open={showFilters} onOpenChange={setShowFilters}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            篩選
            {hasActiveFilters && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {selectedTags.length + (durationRange[0] > 0 || durationRange[1] < 60 ? 1 : 0) + (dateRange ? 1 : 0)}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-6" align="start">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">篩選條件</h3>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  <X className="h-4 w-4 mr-1" />
                  清除全部
                </Button>
              )}
            </div>

            {/* Tags Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span className="font-medium">標籤</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {availableTags.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox id={tag} checked={selectedTags.includes(tag)} onCheckedChange={() => toggleTag(tag)} />
                    <label htmlFor={tag} className="text-sm cursor-pointer">
                      {tag}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Duration Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">播放時長 (分鐘)</span>
              </div>
              <div className="px-2">
                <Slider
                  value={durationRange}
                  onValueChange={handleDurationChange}
                  max={60}
                  min={0}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>{durationRange[0]} 分鐘</span>
                  <span>{durationRange[1]} 分鐘</span>
                </div>
              </div>
            </div>

            {/* Date Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span className="font-medium">發布日期</span>
              </div>
              <Calendar mode="single" selected={dateRange} onSelect={setDateRange} className="rounded-md border" />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filters Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <Button variant="ghost" size="sm" className="h-auto p-0 ml-1" onClick={() => toggleTag(tag)}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Duration Filter Display */}
      {(durationRange[0] > 0 || durationRange[1] < 60) && (
        <Badge variant="secondary" className="flex items-center gap-1">
          時長: {durationRange[0]}-{durationRange[1]}分鐘
          <Button variant="ghost" size="sm" className="h-auto p-0 ml-1" onClick={() => setDurationRange([0, 60])}>
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {/* Date Filter Display */}
      {dateRange && (
        <Badge variant="secondary" className="flex items-center gap-1">
          日期: {dateRange.toLocaleDateString()}
          <Button variant="ghost" size="sm" className="h-auto p-0 ml-1" onClick={() => setDateRange(undefined)}>
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}
    </div>
  )
}
