# PDF 上傳功能說明

## 功能概述

已為學術播客平台添加完整的 PDF 上傳功能，用戶可以上傳學術論文 PDF 檔案，系統會將其加入待處理清單，管理員可以管理處理進度。

## 主要功能

### 1. 用戶端功能

#### PDF 上傳組件 (`components/pdf-upload.tsx`)

- **拖拽上傳**: 支持拖拽 PDF 檔案到上傳區域
- **點擊選擇**: 點擊選擇檔案按鈕選擇 PDF
- **檔案驗證**: 只允許 PDF 格式，最大 50MB
- **批量上傳**: 支持同時上傳多個檔案
- **詳細設定**: 可選填論文標題、作者、摘要
- **優先級設定**: 可設定處理優先級(1-7)
- **上傳進度**: 顯示上傳狀態和進度
- **錯誤處理**: 友好的錯誤提示

#### 待處理列表組件 (`components/pending-uploads-list.tsx`)

- **個人列表**: 用戶只能看到自己的上傳
- **狀態顯示**: 等待處理、處理中、已完成、失敗
- **實時刷新**: 手動刷新功能
- **檔案管理**: 可刪除未處理的上傳
- **詳情顯示**: 顯示檔案大小、上傳時間、優先級

### 2. 管理員功能

#### 管理員上傳管理組件 (`components/admin/pending-uploads-admin.tsx`)

- **全局視圖**: 查看所有用戶的上傳
- **狀態管理**: 管理員可更改處理狀態
- **搜尋篩選**: 按檔案名、用戶名、狀態篩選
- **批量操作**: 批量更新狀態
- **用戶資訊**: 顯示上傳者資訊
- **分頁功能**: 支持分頁瀏覽

### 3. 資料庫結構

#### pending_uploads 表

```sql
CREATE TABLE pending_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_filename VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  extracted_title TEXT,
  extracted_authors TEXT[],
  extracted_abstract TEXT,
  priority INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 索引

- `idx_pending_uploads_user_id`: 用戶查詢優化
- `idx_pending_uploads_status`: 狀態篩選優化
- `idx_pending_uploads_priority`: 優先級排序優化

### 4. API 路由

#### 用戶 API

- `POST /api/upload/pdf`: 上傳 PDF 檔案
- `GET /api/upload/pdf`: 獲取用戶上傳列表
- `DELETE /api/upload/[id]`: 刪除用戶上傳

#### 管理員 API

- `GET /api/admin/pending-uploads`: 獲取所有上傳(支持篩選)
- `PATCH /api/admin/pending-uploads/[id]`: 更新上傳狀態
- `DELETE /api/admin/pending-uploads/[id]`: 管理員刪除上傳

### 5. 檔案存儲

- **存儲位置**: Supabase Storage "pdf" bucket (`pdf/pending/`)
- **檔案命名**: 使用 UUID 確保唯一性
- **安全性**: 使用 Supabase Storage 的 RLS 政策控制訪問
- **公開 URL**: 自動生成可直接訪問的公開連結
- **清理機制**: 刪除記錄時同時清理 Storage 中的檔案
- **CDN 支援**: 透過 Supabase CDN 加速檔案訪問

## 使用方式

### 用戶使用

1. 訪問主頁，滾動到「上傳論文」區域
2. 拖拽或點擊選擇 PDF 檔案
3. 可選填寫論文詳細資訊
4. 設定處理優先級
5. 確認上傳
6. 在右側列表中查看處理進度

### 管理員使用

1. 訪問 `/admin` 管理頁面
2. 在「待處理上傳管理」區域查看所有上傳
3. 可搜尋、篩選上傳項目
4. 更新處理狀態
5. 刪除不需要的上傳

## 技術特點

- **響應式設計**: 支持桌面和移動設備
- **實時更新**: 上傳狀態實時反映
- **錯誤處理**: 完善的錯誤處理和用戶提示
- **性能優化**: 分頁載入，減少初始載入時間
- **安全性**: 用戶只能管理自己的上傳
- **可擴展性**: 易於添加新的處理狀態和功能

## 下一步開發

1. **自動處理**: 實現 PDF 內容提取和播客生成
2. **通知系統**: 處理完成時通知用戶
3. **檔案預覽**: 支持 PDF 預覽功能
4. **批量操作**: 用戶端批量上傳管理
5. **統計分析**: 上傳和處理統計報表
6. **Storage 優化**: 實現檔案壓縮和格式轉換
7. **存取控制**: 更細緻的 Storage 權限管理

## 設置需求

### 必要設置

1. **Supabase Storage Bucket**: 創建名為"pdf"的 public bucket
2. **環境變數**: 確認 Supabase URL 和 API Key 正確設置
3. **RLS 政策**: 可選設置更細緻的訪問控制

詳細設置說明請參考 [`SUPABASE_STORAGE_SETUP.md`](./SUPABASE_STORAGE_SETUP.md)

## 文件結構

```
├── components/
│   ├── pdf-upload.tsx              # PDF上傳組件
│   ├── pending-uploads-list.tsx    # 用戶待處理列表
│   └── admin/
│       └── pending-uploads-admin.tsx  # 管理員上傳管理
├── app/
│   ├── api/
│   │   ├── upload/
│   │   │   ├── pdf/route.ts        # 用戶上傳API
│   │   │   └── [id]/route.ts       # 刪除上傳API
│   │   └── admin/
│   │       └── pending-uploads/
│   │           ├── route.ts        # 管理員查看API
│   │           └── [id]/route.ts   # 管理員管理API
│   ├── page.tsx                    # 主頁(包含上傳功能)
│   └── admin/page.tsx              # 管理頁面
├── lib/
│   ├── database.types.ts           # 資料庫類型定義
│   └── database-service.ts         # 資料庫服務層
├── SUPABASE_STORAGE_SETUP.md       # Supabase Storage 設置說明
└── PDF_UPLOAD_FEATURE.md           # 功能說明文檔
```
