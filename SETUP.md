# 學術播客平台設置指南

## 環境變數配置

請在專案根目錄創建 `.env.local` 檔案，並設置以下環境變數：

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Database Configuration (可選，如果使用直接PostgreSQL連接)
DATABASE_URL=postgresql://username:password@localhost:5432/podcast_db

# Other Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 設置步驟

### 1. 安裝依賴

```bash
npm install
```

### 2. 配置資料庫

#### 使用 Supabase (推薦)

1. 前往 [Supabase](https://supabase.com) 創建新專案
2. 獲取專案 URL 和 API 金鑰
3. 在專案設置中找到 Service Role Key
4. 更新 `.env.local` 檔案

#### 使用本地 PostgreSQL

1. 安裝 PostgreSQL
2. 創建資料庫 `podcast_db`
3. 更新 `DATABASE_URL` 環境變數

### 3. 初始化資料庫

1. 啟動開發伺服器：

```bash
npm run dev
```

2. 前往管理員頁面：http://localhost:3000/admin

3. 點擊「初始化資料庫」按鈕

4. 點擊「添加種子資料」按鈕

### 4. 驗證設置

訪問 http://localhost:3000 確認應用程式正常運行。

## 功能說明

### 已實現功能

- ✅ 主頁面播客列表顯示
- ✅ 播客播放器（支援播放控制、進度條、音量控制）
- ✅ 分類篩選和搜尋
- ✅ 播客詳情頁面
- ✅ 統計數據顯示
- ✅ 響應式設計
- ✅ 深色/淺色主題切換
- ✅ 管理員控制台
- ✅ 資料庫初始化和種子資料

### 主要頁面

- `/` - 主頁面
- `/podcast/[id]` - 播客詳情頁面
- `/admin` - 管理員控制台

### API 路由

- `/api/papers` - 獲取論文列表
- `/api/papers/[id]` - 獲取單篇論文詳情
- `/api/stats` - 獲取統計數據
- `/api/admin/init-db` - 初始化資料庫
- `/api/admin/seed-db` - 添加種子資料

## 故障排除

### 常見問題

1. **無法連接資料庫**

   - 檢查環境變數是否正確設置
   - 確認 Supabase 專案狀態或 PostgreSQL 服務是否運行

2. **API 錯誤**

   - 檢查控制台錯誤信息
   - 確認資料庫已正確初始化

3. **播放器無法工作**
   - 確保音頻檔案路徑正確
   - 檢查瀏覽器音頻播放權限

### 開發注意事項

- 使用 `uv` 管理 Python 環境（如有 Python 需求）
- 確保在 PowerShell 中運行命令
- 所有回應都使用繁體中文

如有問題，請檢查控制台錯誤信息或查看開發工具網路標籤。
