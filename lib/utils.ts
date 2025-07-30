import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "0:00"

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

// 分類中文映射
export const categoryDisplayNames: Record<string, string> = {
  // 標準 arXiv 分類（實際存在於資料庫中）
  "cs.CV": "電腦視覺",
  "cs.CL": "自然語言處理",
  "cs.AI": "人工智慧",
  "cs.LG": "機器學習",
  "cs.RO": "機器人學",
  "cs.IR": "資訊檢索",
  "cs.LO": "邏輯學",
  "cs.SD": "軟體工程",
  "cs.SE": "軟體工程",

  // 轉換後的 ID 格式（從 getCategoryStats 方法生成）
  "cs_cv": "電腦視覺",
  "cs_cl": "自然語言處理",
  "cs_ai": "人工智慧",
  "cs_lg": "機器學習",
  "cs_ro": "機器人學",
  "cs_ir": "資訊檢索",
  "cs_lo": "邏輯學",
  "cs_sd": "軟體工程",
  "cs_se": "軟體工程",
}

// 獲取分類的中文顯示名稱
export function getCategoryDisplayName(category: string): string {
  return categoryDisplayNames[category] || category
}
