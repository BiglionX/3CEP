# 配件管理模块部署指南

## 功能概述
已完成配件管理模块的核心功能开发，包括：
- 配件信息管理（增删改查）
- 设备和故障关联
- 库存管理
- 搜索筛选功能
- Excel批量导入导出
- 图片管理

## 数据库部署步骤

### 1. 执行表结构迁移
在Supabase控制台执行以下SQL文件：
- `supabase/migrations/006_create_parts_management_tables.sql`
- `supabase/migrations/007_seed_parts_data.sql`

或者按顺序执行：
1. 登录 [Supabase控制台](https://app.supabase.com/project/hrjqzbhqueleszkvnsen/sql)
2. 打开SQL Editor
3. 依次粘贴并执行两个SQL文件的内容

### 2. 验证表结构
执行以下查询验证表是否创建成功：
```sql
-- 检查主要表是否存在
SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
AND tablename IN ('parts', 'part_devices', 'part_faults', 'part_images', 'part_inventory');

-- 检查视图是否存在
SELECT viewname FROM pg_views WHERE schemaname = 'public' 
AND viewname = 'parts_complete_view';

-- 检查示例数据
SELECT COUNT(*) FROM parts;
SELECT COUNT(*) FROM devices;
SELECT COUNT(*) FROM fault_types;
```

## 前端功能验证

### 1. 访问管理页面
访问地址：`http://localhost:3001/admin/parts`

### 2. 主要功能点
- ✅ 配件列表展示
- ✅ 搜索和筛选功能
- ✅ 分页功能
- ✅ 新增配件表单
- ✅ 编辑配件信息
- ✅ 删除配件（软删除）
- ✅ 配件详情查看
- ✅ 库存调整功能
- ✅ 设备和故障关联选择
- ✅ Excel模板下载和批量导入

### 3. API接口测试
可以使用以下curl命令测试API：

```bash
# 获取配件列表
curl "http://localhost:3001/api/admin/parts"

# 搜索配件
curl "http://localhost:3001/api/admin/parts?search=iPhone"

# 按分类筛选
curl "http://localhost:3001/api/admin/parts?category=屏幕"

# 获取设备选项
curl "http://localhost:3001/api/admin/parts/options?type=devices"

# 获取故障选项
curl "http://localhost:3001/api/admin/parts/options?type=faults"
```

## 文件结构

```
src/
├── app/
│   ├── admin/
│   │   └── parts/
│   │       ├── page.tsx          # 配件管理主页面
│   │       ├── PartForm.tsx      # 配件表单组件
│   │       └── PartDetail.tsx    # 配件详情组件
│   └── api/
│       └── admin/
│           └── parts/
│               ├── route.ts              # 配件列表API
│               ├── [id]/route.ts         # 配件详情API
│               ├── import/route.ts       # 批量导入API
│               └── options/route.ts      # 选项数据API
├── lib/
│   └── database.types.ts         # 数据库类型定义
supabase/
├── migrations/
│   ├── 006_create_parts_management_tables.sql
│   └── 007_seed_parts_data.sql
scripts/
└── test-parts-management.js      # API测试脚本
```

## 注意事项

1. **依赖安装**：确保已安装xlsx依赖包
   ```bash
   npm install xlsx
   ```

2. **权限配置**：确保Supabase中已配置正确的RLS策略

3. **图片存储**：目前使用URL存储，建议后续集成Supabase Storage

4. **批量导入**：Excel模板可通过 `/api/admin/parts/import` GET请求下载

## 已知限制

1. 当前使用示例图片URL，实际使用时需要替换为真实图片
2. Excel导入功能需要xlsx包支持
3. 需要手动执行数据库迁移脚本

## 下一步建议

1. 集成真实的图片上传功能
2. 添加更完善的权限控制
3. 实现库存预警通知功能
4. 添加配件统计报表功能