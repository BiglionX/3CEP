# 批量二维码生成功能部署指南

## 📋 功能概述

批量二维码生成功能允许用户按产品型号批量创建专属二维码，每批锁定唯一产品型号，确保批次内所有二维码都指向同一产品。

## 🚀 主要特性

- **型号锁定**: 每批二维码锁定唯一产品型号
- **序列号生成**: 自动生成连续的6位序列号（000001-999999）
- **批量处理**: 支持CSV模板批量导入
- **进度跟踪**: 实时显示生成进度和状态
- **多种格式**: 支持PNG/SVG格式，可调节尺寸
- **统计分析**: 提供批次统计和二维码使用数据

## 📁 文件结构

```
src/
├── app/
│   ├── admin/
│   │   └── batch-qrcodes/
│   │       └── page.tsx              # 批量二维码管理页面
│   └── api/
│       └── qrcode/
│           ├── batch/
│           │   ├── route.ts          # 批次管理API
│           │   └── upload/
│           │       └── route.ts      # CSV上传API
│           └── init-db/
│               └── route.ts          # 数据库初始化API
supabase/
├── migrations/
│   └── 019_create_batch_qrcode_system.sql  # 数据库迁移文件
scripts/
├── test-batch-qrcode.js              # 功能测试脚本
docs/
└── BATCH_QRCODE_DEPLOYMENT.md        # 本部署文档
```

## 🔧 部署步骤

### 1. 数据库准备

首先需要创建数据库表结构：

```bash
# 方法1: 通过Supabase控制台执行SQL
1. 登录Supabase控制台
2. 进入SQL编辑器
3. 复制并执行 supabase/migrations/019_create_batch_qrcode_system.sql

# 方法2: 使用初始化API获取SQL脚本
curl -X POST http://localhost:3001/api/qrcode/init-db
```

### 2. 环境变量确认

确保以下环境变量已在 `.env.local` 中配置：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. 启动应用

```bash
npm run dev
```

## 🖥️ 访问页面

- **批量二维码管理**: http://localhost:3001/admin/batch-qrcodes
- **单个二维码管理**: http://localhost:3001/admin/qrcodes
- **企业售后管理**: http://localhost:3001/enterprise/after-sales

## 📊 数据库表结构

### qr_batches (批次表)
```sql
- id: UUID主键
- batch_id: 批次唯一标识符
- product_model: 产品型号（每批锁定唯一）
- product_category: 产品类别
- brand_id: 品牌ID
- product_name: 产品名称
- quantity: 计划生成数量
- generated_count: 已生成数量
- status: 批次状态 (pending/processing/completed/failed)
- config: JSON配置信息
- created_at: 创建时间
- completed_at: 完成时间
```

### qr_codes (二维码明细表)
```sql
- id: UUID主键
- batch_id: 所属批次ID
- product_id: 完整产品ID（型号+序列号）
- qr_content: 二维码内容
- qr_image_base64: 二维码图片数据
- serial_number: 序列号
- format: 图片格式
- size: 尺寸
- scanned_count: 扫描次数
- created_at: 创建时间
```

## 🎯 使用指南

### 1. 创建单个批次

在批量二维码管理页面点击"新建批次"按钮：

1. 填写产品信息（型号、类别、品牌、名称）
2. 设置生成数量（1-10000）
3. 配置二维码参数（格式、尺寸、纠错等级）
4. 可选设置生产日期范围
5. 点击"创建批次"

### 2. CSV批量导入

1. 点击"下载模板"获取CSV格式模板
2. 按模板格式填写批量数据
3. 点击"上传CSV"选择文件
4. 系统自动解析并创建多个批次

### 3. 模板格式示例

```csv
产品型号*,产品类别*,品牌ID*,产品名称*,数量*,格式,尺寸,纠错等级
IPH15P-A2842,smartphone,brand_apple_001,iPhone 15 Pro,50,png,300,M
SM-S9280,smartphone,brand_samsung_001,Galaxy S24 Ultra,30,png,300,M
```

## 🔍 API接口说明

### 获取批次列表
```http
GET /api/qrcode/batch
```

### 创建新批次
```http
POST /api/qrcode/batch
Content-Type: application/json

{
  "productModel": "IPH15P-A2842",
  "productCategory": "smartphone", 
  "brandId": "brand_apple_001",
  "productName": "iPhone 15 Pro",
  "quantity": 50,
  "config": {
    "format": "png",
    "size": 300,
    "errorCorrection": "M"
  }
}
```

### CSV批量上传
```http
POST /api/qrcode/batch/upload
Content-Type: multipart/form-data

file: your_csv_file.csv
```

## 📈 生成逻辑

1. **ID生成**: `产品型号_序列号` (如: IPH15P-A2842_000001)
2. **二维码内容**: `https://fx.cn/p/{product_id}`
3. **序列号规则**: 6位数字，从000001开始递增
4. **并发处理**: 支持同时处理多个批次
5. **错误处理**: 单个二维码生成失败不影响整个批次

## 🔒 安全特性

- RLS (Row Level Security) 行级安全控制
- 管理员可查看所有批次
- 品牌用户只能查看自己品牌的批次
- 数据验证和输入过滤
- SQL注入防护

## 🛠️ 故障排除

### 常见问题

1. **API返回500错误**
   - 检查数据库表是否已创建
   - 确认环境变量配置正确
   - 查看服务端日志获取详细错误信息

2. **页面无法访问**
   - 确认Next.js服务正常运行
   - 检查路由配置是否正确
   - 验证权限设置

3. **CSV上传失败**
   - 检查文件格式是否为CSV
   - 验证必需字段是否完整
   - 确认数值字段格式正确

### 调试命令

```bash
# 测试数据库连接
curl http://localhost:3001/api/qrcode/init-db

# 运行功能测试
node scripts/test-batch-qrcode.js

# 查看服务日志
npm run dev
```

## 📞 技术支持

如有问题请联系技术支持团队或查看相关文档。

---
*最后更新: 2026-02-26*