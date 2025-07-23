#!/usr/bin/env node

/**
 * 性能優化檢查腳本
 * 使用方法: node scripts/performance-check.js
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 正在執行性能檢查...\n')

// 檢查配置文件
function checkConfigFiles() {
  const configs = [
    'next.config.mjs',
    'tailwind.config.ts',
    'tsconfig.json'
  ]
  
  console.log('📁 配置文件檢查:')
  configs.forEach(config => {
    const exists = fs.existsSync(path.join(process.cwd(), config))
    console.log(`  ${exists ? '✅' : '❌'} ${config}`)
  })
  console.log()
}

// 檢查性能優化組件
function checkPerformanceComponents() {
  const components = [
    'components/optimized-image.tsx',
    'components/web-vitals-monitor.tsx',
    'components/dynamic-components.tsx',
    'hooks/use-performance.ts'
  ]
  
  console.log('🔧 性能組件檢查:')
  components.forEach(component => {
    const exists = fs.existsSync(path.join(process.cwd(), component))
    console.log(`  ${exists ? '✅' : '❌'} ${component}`)
  })
  console.log()
}

// 檢查 package.json 依賴
function checkDependencies() {
  const packagePath = path.join(process.cwd(), 'package.json')
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }
    
    console.log('📦 關鍵依賴檢查:')
    
    const criticalDeps = [
      'next',
      'react',
      'web-vitals'
    ]
    
    criticalDeps.forEach(dep => {
      const version = deps[dep]
      console.log(`  ${version ? '✅' : '❌'} ${dep}: ${version || '未安裝'}`)
    })
    console.log()
  }
}

// 檢查 .next 建置結果
function checkBuildOutput() {
  const buildPath = path.join(process.cwd(), '.next')
  
  console.log('🏗️ 建置結果檢查:')
  
  if (fs.existsSync(buildPath)) {
    console.log('  ✅ .next 目錄存在')
    
    const chunksPath = path.join(buildPath, 'static', 'chunks')
    if (fs.existsSync(chunksPath)) {
      const chunks = fs.readdirSync(chunksPath).filter(file => file.endsWith('.js'))
      const totalSize = chunks.reduce((total, chunk) => {
        const stat = fs.statSync(path.join(chunksPath, chunk))
        return total + stat.size
      }, 0)
      
      console.log(`  ✅ JavaScript chunks: ${chunks.length} 個`)
      console.log(`  📊 總大小: ${(totalSize / 1024).toFixed(2)} KB`)
      
      // 檢查大型 chunks
      const largeChunks = chunks.filter(chunk => {
        const stat = fs.statSync(path.join(chunksPath, chunk))
        return stat.size > 150 * 1024 // 150KB
      })
      
      if (largeChunks.length > 0) {
        console.log(`  ⚠️  大型 chunks (>150KB): ${largeChunks.length} 個`)
        largeChunks.forEach(chunk => {
          const stat = fs.statSync(path.join(chunksPath, chunk))
          console.log(`    - ${chunk}: ${(stat.size / 1024).toFixed(2)} KB`)
        })
      }
    }
  } else {
    console.log('  ❌ .next 目錄不存在，請先執行 npm run build')
  }
  console.log()
}

// 性能建議
function showRecommendations() {
  console.log('💡 性能優化建議:')
  console.log('  1. 使用 OptimizedImage 組件替代傳統 img 標籤')
  console.log('  2. 實施動態導入以減少初始 bundle 大小')
  console.log('  3. 使用 React.memo 避免不必要的重渲染')
  console.log('  4. 啟用 Web Vitals 監控')
  console.log('  5. 考慮使用 CDN 分發靜態資源')
  console.log()
}

// 主函數
function main() {
  console.log('🚀 學術播客專案性能檢查工具\n')
  
  checkConfigFiles()
  checkPerformanceComponents()
  checkDependencies()
  checkBuildOutput()
  showRecommendations()
  
  console.log('✨ 檢查完成！請參考 PERFORMANCE_ANALYSIS.md 獲取詳細分析報告。')
}

main()
