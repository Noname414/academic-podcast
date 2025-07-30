# 管理員功能設置指南

本指南將幫助您設置和使用學術播客平台的管理員功能。

## 🔐 安全特性

### 權限控制

- **用戶角色系統**：每個用戶都有 `admin` 或 `user` 角色
- **前端保護**：admin 頁面會檢查用戶權限，非管理員無法訪問
- **API 保護**：所有 admin API 都使用 `withAdminAuth` 中間件保護
- **路由保護**：middleware 會檢查 admin 路由的訪問權限

### 默認行為

- 新註冊的用戶默認為 `user` 角色
- 需要手動將用戶設置為管理員
- 管理員可以訪問所有 admin 功能

## 🚀 初始設置

### 1. 更新數據庫

首先需要初始化數據庫以添加用戶角色功能：

```bash
# 啟動開發服務器
npm run dev

# 在瀏覽器中訪問以下URL（需要先登錄）
http://localhost:3000/api/admin/init-db
```

或者使用 curl：

```bash
curl -X POST http://localhost:3000/api/admin/init-db \
  -H "Cookie: sb-access-token=你的訪問令牌"
```

### 2. 設置第一個管理員

在有管理員之前，您需要手動設置第一個管理員用戶：

```bash
# 列出當前管理員
npm run set-admin --list

# 設置用戶為管理員（用戶必須先註冊）
npm run set-admin user@example.com
```

**重要提醒**：

- 確保用戶已經註冊並至少登錄過一次
- 需要在 `.env.local` 中設置 `SUPABASE_SERVICE_ROLE_KEY`

## 👨‍💼 管理員功能

### 可訪問的功能

1. **數據庫管理**

   - 初始化數據庫結構
   - 添加種子數據

2. **用戶管理**

   - 查看所有用戶列表
   - 刪除用戶帳戶

3. **PDF 上傳管理**

   - 查看所有用戶的 PDF 上傳
   - 更新上傳狀態
   - 刪除上傳文件

4. **論文管理**
   - 查看所有論文
   - 管理論文內容

### 訪問 admin 控制台

管理員用戶可以通過以下方式訪問：

- 直接訪問：`http://localhost:3000/admin`
- 或從導航菜單中選擇（僅管理員可見）

## 🛡️ 安全最佳實踐

### 環境變量安全

確保以下環境變量安全存儲：

```bash
# .env.local
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 管理員帳戶管理

1. **最小權限原則**：只給必要的用戶管理員權限
2. **定期審核**：定期檢查管理員列表
3. **安全密碼**：確保管理員帳戶使用強密碼
4. **雙因素認證**：建議在 Supabase 中啟用 2FA

## 🔧 故障排除

### 常見問題

#### 1. 無法訪問 admin 頁面

**症狀**：返回"訪問被拒絕"錯誤
**解決方案**：

```bash
# 檢查用戶角色
npm run set-admin --list

# 設置用戶為管理員
npm run set-admin your-email@example.com
```

#### 2. API 返回 403 錯誤

**症狀**：admin API 調用返回"需要管理員權限"
**原因**：用戶不是管理員或 session 過期
**解決方案**：

1. 確認用戶是管理員
2. 重新登錄應用
3. 檢查數據庫中的用戶角色

#### 3. 數據庫連接錯誤

**症狀**：無法初始化數據庫或設置管理員
**解決方案**：

1. 檢查 `POSTGRES_URL` 環境變量
2. 檢查 Supabase 連接
3. 確認 Service Role Key 正確

### 開發調試

#### 檢查用戶權限

```typescript
// 在前端組件中
const { user } = useAuth();
console.log(user); // 檢查用戶信息

// 在API中
const authResult = await checkAdminAuth(request);
console.log(authResult); // 檢查權限結果
```

#### 數據庫查詢

```sql
-- 在Supabase SQL Editor中檢查用戶角色
SELECT email, role, created_at FROM users ORDER BY created_at;

-- 檢查特定用戶
SELECT * FROM users WHERE email = 'user@example.com';
```

## 📝 API 文檔

### 管理員 API 端點

所有 admin API 都需要管理員權限：

```
GET  /api/admin/users              # 獲取用戶列表
DELETE /api/admin/users/[id]       # 刪除用戶
GET  /api/admin/pending-uploads    # 獲取待處理上傳
PATCH /api/admin/pending-uploads/[id] # 更新上傳狀態
DELETE /api/admin/pending-uploads/[id] # 刪除上傳
POST /api/admin/init-db            # 初始化數據庫
POST /api/admin/seed-db            # 添加種子數據
```

### 權限檢查 API

```typescript
import { checkAdminAuth } from "@/lib/admin-auth";

// 檢查管理員權限
const authResult = await checkAdminAuth(request);
if (!authResult.isAdmin) {
  // 處理未授權訪問
}
```

## 🎯 後續步驟

1. **測試權限系統**：確保非管理員無法訪問 admin 功能
2. **設置監控**：考慮添加 admin 操作的日誌記錄
3. **備份策略**：制定數據備份和恢復計劃
4. **文檔維護**：根據新功能更新此文檔

---

如有問題，請檢查控制台日誌或聯繫開發團隊。
