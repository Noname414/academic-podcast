export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950">
      <div className="text-center space-y-6 p-8">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse h-4 w-4 bg-primary rounded-full"></div>
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            載入中
          </h2>
          <p className="text-muted-foreground animate-pulse">正在為您準備精彩內容...</p>
        </div>
        <div className="flex justify-center space-x-1">
          <div className="animate-bounce h-2 w-2 bg-primary rounded-full" style={{ animationDelay: "0ms" }}></div>
          <div className="animate-bounce h-2 w-2 bg-primary rounded-full" style={{ animationDelay: "150ms" }}></div>
          <div className="animate-bounce h-2 w-2 bg-primary rounded-full" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    </div>
  )
}
