# 🧪 多类型用户注册功能 - 完整测试指南

## 📋 测试目标

验证增强版注册页面的所有功能是否正常工作，包括前端 UI、表单验证、API 调用和数据入库。

---

## 🎯 测试环境准备

### 1. 确认数据库表已创建 ✅

在 Supabase Dashboard 执行以下 SQL 验证：

```sql
-- 检查 4 个核心表
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'user_accounts',
  'individual_users',
  'repair_shop_users_detail',
  'enterprise_users_detail'
);

-- 应该返回 4 行结果
```

### 2. 确认 API 已更新 ✅

检查文件：[`src/app/api/auth/register/route.ts`](file://d:\BigLionX\3cep\src\app\api\auth\register\route.ts)

确保包含：

- ✅ user_type 和 account_type 处理
- ✅ phone、companyName、shopName 字段
- ✅ user_accounts 表插入逻辑
- ✅ 详情表插入逻辑

### 3. 启动开发服务器

```bash
npm run dev
```

访问：`http://localhost:3001/register-enhanced`

---

## 🧪 测试场景

### 场景 1: 个人用户注册 ✅

**测试步骤**:

1. 访问 `http://localhost:3001/register-enhanced`
2. 选择"个人用户"（蓝色卡片）
3. 填写表单：
   ```
   姓名：张三
   手机号：13800138001
   邮箱：zhangsan@test.com
   密码：Test123456
   确认密码：Test123456
   ```
4. 勾选"我同意服务条款和隐私政策"
5. 点击"创建账户"

**预期结果**:

✅ **前端验证**:

- 表单提交成功
- 显示加载动画
- 3 秒后跳转到登录页面
- 显示成功提示

✅ **数据库验证**:

```sql
-- 检查 user_accounts 表
SELECT * FROM user_accounts WHERE email = 'zhangsan@test.com';
-- 应该有 1 条记录
-- user_type = 'individual'
-- account_type = 'individual'

-- 检查 individual_users 表
SELECT * FROM individual_users WHERE user_account_id = (
  SELECT id FROM user_accounts WHERE email = 'zhangsan@test.com'
);
-- 应该有 1 条记录
```

---

### 场景 2: 维修店注册 ✅

**测试步骤**:

1. 访问 `http://localhost:3001/register-enhanced`
2. 选择"维修店"（绿色卡片）
3. 填写表单：
   ```
   联系人姓名：李四
   手机号：13800138002
   店铺名称：诚信手机维修店
   邮箱：lixichengxin@test.com
   密码：Test123456
   确认密码：Test123456
   ```
4. 勾选同意条款
5. 点击"创建账户"

**预期结果**:

✅ **前端验证**:

- 表单提交成功
- 显示加载动画
- 跳转成功

✅ **数据库验证**:

```sql
-- 检查 user_accounts 表
SELECT * FROM user_accounts WHERE email = 'lixichengxin@test.com';
-- user_type = 'repair_shop'
-- account_type = 'repair_shop'
-- role = 'shop_manager'

-- 检查 repair_shop_users_detail 表
SELECT * FROM repair_shop_users_detail WHERE user_account_id = (
  SELECT id FROM user_accounts WHERE email = 'lixichengxin@test.com'
);
-- shop_name = '诚信手机维修店'
-- shop_type = 'independent'
```

---

### 场景 3: 企业用户（工厂）注册 ✅

**测试步骤**:

1. 访问 `http://localhost:3001/register-enhanced`
2. 选择"企业用户"（紫色卡片）
3. 填写表单：
   ```
   联系人姓名：王五
   手机号：13800138003
   公司名称：深圳电子科技公司
   邮箱：wangwu@shenzhen-dz.test.com
   密码：Test123456
   确认密码：Test123456
   ```
4. 勾选同意条款
5. 点击"创建账户"

**预期结果**:

✅ **数据库验证**:

```sql
-- 检查 user_accounts 表
SELECT * FROM user_accounts WHERE email = 'wangwu@shenzhen-dz.test.com';
-- user_type = 'enterprise'
-- account_type = 'factory'
-- role = 'manager'

-- 检查 enterprise_users_detail 表
SELECT * FROM enterprise_users_detail WHERE user_account_id = (
  SELECT id FROM user_accounts WHERE email = 'wangwu@shenzhen-dz.test.com'
);
-- company_name = '深圳电子科技公司'
-- business_type = 'manufacturer'
```

---

### 场景 4: 外贸公司注册 ✅

**测试步骤**:

1. 访问 `http://localhost:3001/register-enhanced`
2. 选择"外贸公司"（橙色卡片）
3. 填写表单：
   ```
   联系人姓名：赵六
   手机号：13800138004
   公司名称：广州国际贸易公司
   邮箱：zhaoliu@gz-guojimc.test.com
   密码：Test123456
   确认密码：Test123456
   ```
4. 勾选同意条款
5. 点击"创建账户"

**预期结果**:

✅ **数据库验证**:

```sql
-- 检查 user_accounts 表
SELECT * FROM user_accounts WHERE email = 'zhaoliu@gz-guojimc.test.com';
-- user_type = 'foreign_trade_company'
-- account_type = 'foreign_trade'
-- role = 'manager'

-- 检查 enterprise_users_detail 表
SELECT * FROM enterprise_users_detail WHERE user_account_id = (
  SELECT id FROM user_accounts WHERE email = 'zhaoliu@gz-guojimc.test.com'
);
-- company_name = '广州国际贸易公司'
-- business_type = 'foreign_trade'
```

---

## 🔍 表单验证测试

### 必填字段验证

| 测试项       | 操作                 | 预期错误提示           |
| ------------ | -------------------- | ---------------------- |
| 姓名为空     | 不填姓名直接提交     | "请输入姓名"           |
| 邮箱为空     | 不填邮箱直接提交     | "请输入邮箱"           |
| 邮箱格式错误 | 填写 `invalid@email` | "请输入有效的邮箱地址" |
| 手机号为空   | 不填手机号直接提交   | "请输入手机号"         |
| 密码为空     | 不填密码直接提交     | "请输入密码"           |
| 密码长度不足 | 填写 `12345`         | "密码长度至少 6 位"    |
| 密码不一致   | 两次密码不同         | "两次输入的密码不一致" |

### 类型特定验证

| 用户类型 | 测试项       | 操作         | 预期错误         |
| -------- | ------------ | ------------ | ---------------- |
| 企业用户 | 公司名称为空 | 不填公司名称 | "请输入公司名称" |
| 维修店   | 店铺名称为空 | 不填店铺名称 | "请输入店铺名称" |

---

## 🎨 UI/UX 测试

### 视觉设计

- [ ] 4 个用户类型卡片显示正常
- [ ] 每个卡片有对应的图标和颜色
- [ ] 选中状态有明显的视觉反馈（边框、背景色、对勾）
- [ ] 响应式布局正常（移动端单列，桌面端多列）

### 交互体验

- [ ] 点击卡片可以切换用户类型
- [ ] 切换类型时表单动态变化
- [ ] 输入框获得焦点时有高亮效果
- [ ] 错误信息即时显示和清除
- [ ] 提交时显示加载动画
- [ ] 按钮禁用状态正常

### 成功/失败提示

- [ ] 注册成功显示绿色成功页面
- [ ] 成功页面有倒计时自动跳转
- [ ] 注册失败显示红色错误提示
- [ ] 错误信息清晰可读

---

## 🔐 安全性测试

### 1. SQL 注入防护

```sql
-- 尝试使用 SQL 注入的邮箱注册
邮箱：test' OR '1'='1@test.com
预期：前端验证拦截或后端拒绝
```

### 2. XSS 攻击防护

```javascript
// 尝试在姓名字段注入脚本
姓名：<script>alert('XSS')</script>
预期：特殊字符被转义或不接受
```

### 3. 重复注册检测

```
使用相同的邮箱注册两次
预期：第二次提示"该邮箱已被注册"
```

### 4. 密码强度

```
弱密码：123456
中等：abc123456
强密码：Abc@123456
预期：都允许注册（符合最小长度要求即可）
```

---

## 📊 性能测试

### 1. 页面加载速度

```bash
# 使用 Chrome DevTools 测量
- First Contentful Paint (FCP): < 1.5s
- Time to Interactive (TTI): < 3s
```

### 2. API 响应时间

```
- 正常网络条件下：< 2s
- 慢速网络条件下：< 5s
```

### 3. 并发测试

```
同时打开 10 个浏览器标签页进行注册
预期：所有请求都能正确处理
```

---

## 🐛 边界条件测试

### 1. 字段长度边界

| 字段   | 最小值 | 最大值 | 测试                  |
| ------ | ------ | ------ | --------------------- |
| 密码   | 6 位   | 无限制 | 6 位✓, 5 位✗, 100 位✓ |
| 邮箱   | -      | -      | 最长 254 字符✓        |
| 手机号 | 11 位  | 11 位  | 11 位✓, 10 位✗        |
| 姓名   | 1 字符 | -      | 1 字符✓, 空✗          |
| 公司名 | 1 字符 | -      | 1 字符✓, 空✗          |

### 2. 特殊字符测试

```
姓名：测试用户™©®
邮箱：test+label@example.com
公司名：A&B 公司
店铺名：O'Malley 维修店
预期：都应该接受
```

### 3. Unicode 字符测试

```
中文：张三
英文：John Doe
日文：田中太郎
韩文：김철수
Emoji: 张三👤
预期：都应该接受
```

---

## ✅ 完整测试清单

### 功能测试

- [ ] 个人用户注册成功
- [ ] 维修店注册成功
- [ ] 企业用户注册成功
- [ ] 外贸公司注册成功
- [ ] 所有必填字段验证通过
- [ ] 类型特定字段验证通过
- [ ] 邮箱格式验证通过
- [ ] 密码一致性验证通过

### 数据完整性

- [ ] user_accounts 表正确插入
- [ ] individual_users 表正确插入
- [ ] repair_shop_users_detail 表正确插入
- [ ] enterprise_users_detail 表正确插入
- [ ] 外键关联正确
- [ ] 默认值设置正确

### UI/UX

- [ ] 4 种用户类型卡片正常显示
- [ ] 响应式布局正常
- [ ] 交互动画流畅
- [ ] 错误提示清晰
- [ ] 成功页面友好

### 安全性

- [ ] SQL 注入防护有效
- [ ] XSS 攻击防护有效
- [ ] 重复注册检测有效
- [ ] 敏感信息不泄露

### 性能

- [ ] 页面加载速度快
- [ ] API 响应及时
- [ ] 并发处理正常
- [ ] 无明显卡顿

---

## 🐞 已知问题和解决方案

### 问题 1: 邮件发送失败

**现象**: 注册成功但未收到确认邮件
**原因**: Supabase 邮件配额限制或配置问题
**解决**:

1. 检查 Supabase 邮件设置
2. 查看垃圾邮件箱
3. 使用自定义 SMTP 服务器

### 问题 2: 详情表创建失败

**现象**: 主账户创建成功但详情表为空
**原因**: 可能是字段不匹配或权限问题
**解决**:

1. 检查 Supabase RLS 策略
2. 查看详细错误日志
3. 手动补充详情信息

### 问题 3: 乱码问题

**现象**: 错误信息显示乱码
**原因**: 文件编码问题
**解决**: 确保所有文件保存为 UTF-8 编码

---

## 📈 测试结果记录模板

### 测试执行记录

```markdown
## 测试日期：2026-03-22

### 测试人员：[姓名]

### 测试结果：

#### 场景 1: 个人用户注册

- [ ] 通过
- [ ] 失败
- 备注：**\_\_\_**

#### 场景 2: 维修店注册

- [ ] 通过
- [ ] 失败
- 备注：**\_\_\_**

#### 场景 3: 企业用户注册

- [ ] 通过
- [ ] 失败
- 备注：**\_\_\_**

#### 场景 4: 外贸公司注册

- [ ] 通过
- [ ] 失败
- 备注：**\_\_\_**

### 发现的问题：

1. ***
2. ***

### 建议改进：

1. ***
2. ***
```

---

## 🎯 验收标准

### 必须满足（P0）

- ✅ 所有 4 种用户类型都能成功注册
- ✅ 数据库记录完整准确
- ✅ 无严重安全漏洞
- ✅ 关键业务流程畅通

### 应该满足（P1）

- ✅ 表单验证完整
- ✅ 错误提示清晰
- ✅ UI 响应式正常
- ✅ 性能指标达标

### 可以优化（P2）

- 🟡 动画效果更流畅
- 🟡 加载速度更快
- 🟡 支持更多特殊字符
- 🟡 更好的移动端体验

---

_文档版本：v1.0_
_更新时间：2026-03-22_
_适用范围：开发/测试/生产环境_
