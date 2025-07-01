# Supabase Auth 設置指南

## 環境變量配置

在專案根目錄創建 `.env.local` 文件，並添加以下變量：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

## Supabase 專案設置

1. 前往 [Supabase](https://supabase.com) 創建新專案
2. 在專案設置中獲取以下資訊：
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - API Keys > anon public (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - API Keys > service_role (SUPABASE_SERVICE_ROLE_KEY)

## 身份驗證設置

### 1. 啟用身份驗證提供者

在 Supabase Dashboard 中：

1. 前往 Authentication > Providers
2. 啟用 Email 提供者
3. 如需要 Google 登錄，啟用 Google 提供者：
   - 獲取 Google OAuth 客戶端 ID 和密鑰
   - 在 Google 提供者設置中填入

### 2. 設置重定向 URL

在 Authentication > URL Configuration 中添加：

- Site URL: `http://localhost:3000` (開發環境)
- Redirect URLs: `http://localhost:3000/api/auth/callback`

### 3. 數據庫架構

確保您的 Supabase 數據庫包含以下表格（已在 database.types.ts 中定義）：

```sql
-- users 表格
CREATE TABLE users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 啟用 RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 用戶只能訪問自己的資料
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

## 功能特性

### 已實現的功能：

- ✅ 郵箱/密碼註冊和登錄
- ✅ Google OAuth 登錄
- ✅ 自動同步用戶資料到數據庫
- ✅ 用戶會話管理
- ✅ 路由保護中間件
- ✅ 用戶菜單和個人資料顯示
- ✅ 登出功能

### 使用方法：

1. **登錄/註冊**：點擊 Header 中的登錄或註冊按鈕
2. **用戶菜單**：登錄後，點擊用戶頭像查看菜單選項
3. **保護路由**：訪問 `/admin`、`/profile`、`/favorites` 等路由需要登錄

### 重要組件：

- `hooks/use-auth.ts` - 身份驗證 Hook 和 Context
- `components/auth-dialog.tsx` - 登錄/註冊對話框
- `components/user-menu.tsx` - 用戶菜單
- `app/api/auth/callback/route.ts` - OAuth 回調處理
- `middleware.ts` - 路由保護中間件

## 自訂化

您可以根據需要自訂：

- 修改 `middleware.ts` 中的 `protectedPaths` 數組來改變哪些路由需要登錄
- 在 `components/user-menu.tsx` 中添加更多菜單選項
- 在 `hooks/use-auth.ts` 中添加更多身份驗證方法
