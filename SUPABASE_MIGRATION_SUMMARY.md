# Supabase Storage 遷移總結

## 變更概述

已將 PDF 上傳功能從本地檔案系統遷移到 Supabase Storage，提供更可靠和可擴展的雲端存儲解決方案。

## 主要變更

### 🔄 API 變更

#### 1. 上傳 API (`/api/upload/pdf/route.ts`)

**變更前:**

- 檔案儲存到本地 `uploads/pending/` 目錄
- 使用 Node.js `fs` 模組
- 返回本地檔案路徑

**變更後:**

- 檔案上傳到 Supabase Storage "pdf" bucket
- 使用 Supabase Storage API
- 返回公開 URL

#### 2. 刪除 API

**變更前:**

- 使用 `fs.unlink()` 刪除本地檔案

**變更後:**

- 使用 `supabase.storage.remove()` 刪除 Storage 檔案
- 支援從公開 URL 解析 bucket 路徑

### 📁 檔案結構變更

**移除:**

```
uploads/
└── pending/
```

**新增:**

```
├── SUPABASE_STORAGE_SETUP.md
├── scripts/test-storage.js
└── SUPABASE_MIGRATION_SUMMARY.md
```

### 🛠️ 依賴變更

**移除的 Node.js 模組:**

- `fs/promises` (writeFile, unlink)
- `path` (join)

**使用的 Supabase 功能:**

- `supabase.storage.from().upload()`
- `supabase.storage.from().remove()`
- `supabase.storage.from().getPublicUrl()`

## 優勢

### ✅ 改進的功能

1. **可擴展性**: 雲端存儲不受伺服器磁碟空間限制
2. **可靠性**: Supabase 提供備份和高可用性
3. **效能**: CDN 加速檔案訪問
4. **安全性**: RLS 政策精確控制權限
5. **管理簡化**: 統一的 Supabase 控制台管理
6. **成本效益**: 按使用量付費

### 🔧 技術優勢

- **公開 URL**: 直接可訪問的檔案連結
- **內容類型**: 自動檢測和設置 MIME 類型
- **快取控制**: 可配置的快取策略
- **元數據**: 豐富的檔案元數據支援

## 設置需求

### 必要步驟

1. **創建 Storage Bucket**

   ```bash
   # 在Supabase控制台創建名為"pdf"的public bucket
   ```

2. **設置 RLS 政策** (可選)

   ```sql
   -- 允許認證用戶上傳
   CREATE POLICY "Allow authenticated uploads" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'pdf' AND auth.role() = 'authenticated');

   -- 允許公開讀取
   CREATE POLICY "Allow public read" ON storage.objects
   FOR SELECT USING (bucket_id = 'pdf');
   ```

3. **驗證設置**
   ```bash
   npm run test:storage
   ```

### 環境變數

確認以下環境變數已正確設置：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 測試指南

### 自動測試

```bash
npm run test:storage
```

### 手動測試

1. 訪問主頁上傳區域
2. 選擇 PDF 檔案上傳
3. 檢查 Supabase Storage 控制台
4. 驗證檔案在 `pdf/pending/` 路徑下
5. 測試刪除功能

## 故障排除

### 常見問題

#### 1. 上傳失敗

**錯誤**: "檔案上傳失敗"
**解決方案**:

- 檢查"pdf" bucket 是否存在
- 確認 bucket 設為 public
- 驗證網路連接

#### 2. 權限錯誤

**錯誤**: "Permission denied"
**解決方案**:

- 檢查 RLS 政策設置
- 確認用戶已認證
- 驗證 API 金鑰權限

#### 3. URL 無法訪問

**錯誤**: 檔案 URL 返回 404
**解決方案**:

- 確認 bucket 為 public
- 檢查檔案路徑正確性
- 驗證 Supabase 專案狀態

## 效能影響

### 正面影響

- ✅ 減少伺服器磁碟使用
- ✅ CDN 加速檔案載入
- ✅ 並行上傳支援
- ✅ 自動壓縮和優化

### 注意事項

- ⚠️ 網路延遲可能影響上傳速度
- ⚠️ 需要穩定的網路連接
- ⚠️ Storage 使用量計費

## 後續優化建議

1. **檔案壓縮**: 在上傳前壓縮 PDF 檔案
2. **批量上傳**: 支援多檔案並行上傳
3. **進度追蹤**: 實時顯示上傳進度
4. **斷點續傳**: 支援大檔案分片上傳
5. **自動清理**: 定期清理過期檔案
6. **使用分析**: 追蹤 Storage 使用統計

## 遷移檢查清單

- [x] 修改上傳 API 使用 Supabase Storage
- [x] 修改刪除 API 支援 Storage 操作
- [x] 移除本地檔案系統依賴
- [x] 創建 Storage 設置文檔
- [x] 添加測試腳本
- [x] 更新.gitignore 移除 uploads 目錄
- [x] 清理本地 uploads 目錄
- [ ] 在 Supabase 控制台創建"pdf" bucket
- [ ] 測試上傳和刪除功能
- [ ] 部署到生產環境

遷移完成後，PDF 上傳功能將更加穩定、可擴展，並提供更好的用戶體驗。
