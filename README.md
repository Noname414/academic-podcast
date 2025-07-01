# AI 論文播客平台

一個現代化的學術播客平台，使用 Next.js 15 和 TypeScript 構建，提供自動化的 AI 論文朗讀和播客服務。

## ✨ 功能特色

### 🎧 核心功能

- **智能播客播放器** - 支援播放控制、進度條、音量調節、播放速度調整
- **論文分類瀏覽** - 按領域分類（NLP、電腦視覺、強化學習、醫療 AI 等）
- **高級搜尋** - 支援標題、作者、關鍵字搜尋和多重篩選
- **響應式設計** - 完美適配桌面和行動設備
- **深色/淺色主題** - 自動跟隨系統設定或手動切換

### 📊 數據展示

- **統計面板** - 即時顯示論文數量、用戶數、觀看次數等
- **趨勢分析** - 熱門論文和最新發布內容推薦
- **個人化體驗** - 收藏功能和播放歷史追蹤

### 🛠 管理功能

- **管理員控制台** - 資料庫初始化和種子資料管理
- **內容管理** - 論文上傳和元數據編輯
- **使用者管理** - 註冊、登入和權限控制

## 🚀 快速開始

### 環境需求

- Node.js 18.0 或更高版本
- PostgreSQL 資料庫或 Supabase 帳號
- Windows 11 (PowerShell)

### 安裝步驟

1. **安裝依賴**

```bash
npm install
```

2. **環境變數設置**

在專案根目錄創建 `.env.local` 檔案：

```env
# Supabase Configuration (推薦)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# 或使用本地 PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/podcast_db

# 其他設定
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **啟動開發伺服器**

```bash
npm run dev
```

4. **初始化資料庫**
   - 訪問 http://localhost:3000/admin
   - 點擊「初始化資料庫」
   - 點擊「添加種子資料」

## 📱 頁面介紹

### 🏠 主頁面 (`/`)

- **Hero 區塊** - 精美的漸層背景和動畫效果
- **統計面板** - 平台使用數據概覽
- **最新播客** - 展示最新發布的論文播客
- **精選主題** - 按領域分類的論文合集
- **播客列表** - 支援搜尋和篩選的完整列表
- **訂閱區塊** - 電子報訂閱功能

### 🎙 播客詳情頁 (`/podcast/[id]`)

- **完整播放器** - 高級音頻播放控制
- **論文資訊** - 作者、摘要、發表資訊
- **內容標籤** - 多層級內容展示
- **互動功能** - 評論、點讚、分享
- **相關推薦** - 同領域論文推薦
- **統計資訊** - 觀看次數、收藏數等

### ⚙️ 管理控制台 (`/admin`)

- **資料庫管理** - 一鍵初始化和重置
- **種子資料** - 預設內容生成
- **系統狀態** - 操作結果即時反饋

## 🎨 UI/UX 特色

### 設計亮點

- **現代化界面** - 使用 Shadcn/ui 組件庫
- **流暢動畫** - CSS 動畫和過渡效果
- **可訪問性** - 完整的鍵盤導航和螢幕閱讀器支援
- **主題系統** - 深色/淺色模式切換

### 響應式設計

- **行動優先** - 手機端完美體驗
- **平板適配** - 中等螢幕尺寸優化
- **桌面增強** - 大螢幕多欄位佈局

## 🔧 技術架構

### 前端技術

- **Next.js 15** - React 框架
- **TypeScript** - 型別安全
- **Tailwind CSS** - 原子化 CSS
- **Radix UI** - 無障礙組件庫
- **Lucide Icons** - 現代圖標集

### 後端技術

- **Next.js API Routes** - 伺服器端 API
- **Supabase** - 雲端資料庫和認證
- **PostgreSQL** - 關聯式資料庫

### 開發工具

- **ESLint** - 程式碼檢查
- **Prettier** - 程式碼格式化
- **TypeScript** - 靜態型別檢查

## 📁 專案結構

```
academic-podcast/
├── app/                 # Next.js App Router
│   ├── api/            # API 路由
│   ├── admin/          # 管理頁面
│   ├── podcast/        # 播客詳情頁
│   └── globals.css     # 全域樣式
├── components/         # React 組件
│   ├── ui/            # 基礎 UI 組件
│   └── *.tsx          # 功能組件
├── hooks/             # 自定義 Hooks
├── lib/               # 工具函數和配置
├── public/            # 靜態資源
└── scripts/           # 資料庫腳本
```

## 🔌 API 端點

### 論文相關

- `GET /api/papers` - 獲取論文列表
- `GET /api/papers/[id]` - 獲取單篇論文
- `POST /api/papers` - 創建新論文

### 統計數據

- `GET /api/stats` - 獲取平台統計

### 管理功能

- `POST /api/admin/init-db` - 初始化資料庫
- `POST /api/admin/seed-db` - 添加種子資料

## 🎯 功能完整度

### ✅ 已完成功能

- [x] 響應式主頁設計
- [x] 播客播放器（完整功能）
- [x] 論文列表和搜尋
- [x] 分類篩選系統
- [x] 播客詳情頁面
- [x] 評論和互動系統
- [x] 統計數據展示
- [x] 主題切換功能
- [x] 管理員控制台
- [x] 資料庫完整架構
- [x] API 路由完整實現
- [x] 錯誤處理和載入狀態
- [x] 無障礙設計

### 🔄 可擴展功能

- [ ] 使用者註冊和登入
- [ ] 播放歷史同步
- [ ] 離線播放支援
- [ ] 推送通知
- [ ] 社群功能擴展
- [ ] 多語言支援

## 🚦 部署指南

### Vercel 部署（推薦）

1. 推送代碼到 GitHub
2. 連接 Vercel 帳號
3. 設置環境變數
4. 一鍵部署

### 本地建置

```bash
npm run build
npm start
```

## 🤝 貢獻指南

1. Fork 專案
2. 創建功能分支
3. 提交變更
4. 發起 Pull Request

## 📄 授權條款

MIT License - 詳見 [LICENSE](LICENSE) 檔案

## 🆘 故障排除

### 常見問題

**Q: 無法連接資料庫**
A: 檢查 `.env.local` 中的資料庫連接設定

**Q: 播放器無法播放**
A: 確保音頻檔案路徑正確，檢查瀏覽器音頻權限

**Q: 樣式顯示異常**
A: 清除瀏覽器快取，重新啟動開發伺服器

**Q: API 請求失敗**
A: 檢查控制台錯誤信息，確認資料庫連接正常

### 開發注意事項

- 使用 PowerShell 運行命令
- 確保 Node.js 版本 >= 18
- 開發時建議使用 TypeScript 嚴格模式

---

**聯絡方式**：如有問題或建議，請開啟 Issue 或 Pull Request

**更新日誌**：查看 [CHANGELOG.md](CHANGELOG.md) 了解版本更新

**技術支援**：[Discord 社群](https://discord.gg/example) | [Email](mailto:support@example.com)
