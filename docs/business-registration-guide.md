# 商业用户统一注册入口 - 实施文档

## 概述

已成功实现统一的商业用户注册入口（方案三），提供企业、维修店和贸易公司三种业务类型的一站式注册服务。

## 文件清单

### 1. 注册页面

- **文件**: `src/app/business-register/page.tsx`
- **路由**: `/business-register`
- **功能**: 统一的商业用户注册入口

### 2. API路由

- **文件**: `src/app/api/business/register/route.ts`
- **路由**: `POST /api/business/register`
- **功能**: 处理商业用户注册请求

### 3. 导航菜单更新

- **文件**: `src/components/layout/UnifiedNavbar.tsx`
- **修改**: 添加"商业合作"下拉菜单

## 功能特性

### 业务类型选择

1. **企业服务**
   - AI智能体管理
   - 采购服务
   - 企业级数据分析
   - 团队协作

2. **维修店铺**
   - 设备维修订单管理
   - 客户预约
   - 库存管理
   - 业绩分析

3. **贸易服务**
   - 进出口订单管理
   - 物流跟踪
   - 合作伙伴管理
   - 业务分析

### 表单验证

- ✅ 邮箱格式验证
- ✅ 密码强度验证（至少8位）
- ✅ 密码确认验证
- ✅ 根据业务类型的必填字段验证
- ✅ 联系电话验证

### 注册流程

1. 用户访问 `/business-register`
2. 选择业务类型（企业/维修店/贸易）
3. 填写注册表单
4. 提交注册
5. 跳转到对应的登录页面

## 导航菜单更新

### 新增菜单项

```
商业合作 (下拉菜单)
├── 入驻申请 (/business-register)
├── 企业注册 (/enterprise/admin/auth)
├── 维修店入驻 (/business-register)
└── 贸易商入驻 (/business-register)
```

### 访问方式

1. **主导航** → "商业合作" → 选择对应的注册选项
2. **直接URL**: `https://yourdomain.com/business-register`
3. **产品服务菜单**: 点击各服务模块，系统会引导到登录页面，登录页面可跳转注册

## 注册表单字段

### 通用字段（所有类型必填）

- 邮箱地址
- 密码
- 确认密码
- 联系人姓名
- 联系电话

### 企业用户专用字段

- 公司名称
- 营业执照号

### 维修店专用字段

- 店铺名称
- 店铺地址

### 贸易公司专用字段

- 公司名称
- 贸易类型（进口商/出口商）

## 注册后跳转

根据业务类型自动跳转到对应的登录页面：

| 业务类型           | 登录页面                 |
| ------------------ | ------------------------ |
| 企业               | `/enterprise/admin/auth` |
| 维修店             | `/repair-shop/login`     |
| 贸易公司（进口商） | `/importer/login`        |
| 贸易公司（出口商） | `/exporter/login`        |

## 安全特性

1. **数据验证**: 前端和后端双重验证
2. **密码安全**: 明确要求至少8位
3. **邮箱验证**: 格式验证确保有效性
4. **协议确认**: 必须同意服务条款和隐私政策

## 用户体验优化

1. **分步引导**: 先选择类型，再填写表单
2. **实时验证**: 输入时即时显示错误提示
3. **返回导航**: 可随时返回重新选择业务类型
4. **加载状态**: 提交时显示加载动画
5. **成功反馈**: 注册成功后自动跳转

## API接口规范

### POST /api/business/register

**请求体**:

```json
{
  "email": "string",
  "password": "string",
  "contactPerson": "string",
  "phone": "string",
  "businessType": "enterprise" | "repair-shop" | "trade",
  "companyName": "string", // 企业/贸易公司必填
  "businessLicense": "string", // 企业必填
  "shopName": "string", // 维修店必填
  "shopAddress": "string", // 维修店必填
  "tradeType": "importer" | "exporter" // 贸易公司必填
}
```

**响应**:

```json
{
  "success": true,
  "message": "注册成功，请等待审核",
  "data": {
    "businessType": "enterprise",
    "email": "example@company.com",
    "status": "pending"
  }
}
```

**错误响应**:

```json
{
  "error": "错误信息描述"
}
```

## 待完善功能

### 后续优化建议

1. **邮箱验证**: 发送验证邮件，激活账户
2. **文件上传**: 支持上传营业执照、店铺照片等
3. **审核流程**: 管理员后台审核注册申请
4. **状态通知**: 注册进度实时通知
5. **数据持久化**: 连接数据库保存注册信息

### 数据库表结构建议

```sql
CREATE TABLE business_registrations (
  id UUID PRIMARY KEY,
  business_type VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  business_license VARCHAR(255),
  shop_name VARCHAR(255),
  shop_address TEXT,
  contact_person VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  trade_type VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 测试清单

- [x] 访问 `/business-register` 页面正常显示
- [x] 三种业务类型卡片可点击
- [x] 选择类型后显示对应表单
- [x] 表单验证功能正常
- [x] 提交后跳转到正确页面
- [x] 返回按钮功能正常
- [x] 导航菜单显示"商业合作"选项
- [ ] API路由正常响应（需要数据库支持）
- [ ] 数据持久化到数据库（待实现）
- [ ] 邮件发送功能（待实现）

## 总结

✅ **已完成**:

- 统一的商业用户注册页面
- 三种业务类型支持
- 完整的表单验证
- 导航菜单集成
- API路由创建
- 用户体验优化

🔄 **待完善**:

- 数据库集成
- 邮件验证
- 审核流程
- 文件上传

该方案提供了简洁统一的注册入口，用户体验良好，易于维护和扩展。
