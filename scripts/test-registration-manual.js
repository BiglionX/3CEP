/**
 * 多类型用户注册功能 - 手动测试检查清单
 *
 * 使用说明:
 * 1. 打开浏览器访问注册页面
 * 2. 按照此清单逐项测试
 * 3. 记录测试结果
 */

const fs = require('fs');
const path = require('path');

// 测试配置
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3001',
  registerPage: '/register-enhanced',
};

// 测试数据
const TEST_USERS = [
  {
    type: 'individual',
    typeName: '个人用户',
    name: '张三',
    phone: '13800138001',
    email: `zhangsan_test_${Date.now()}@test.com`,
    password: 'Test123456',
    confirmPassword: 'Test123456',
  },
  {
    type: 'repair_shop',
    typeName: '维修店',
    name: '李四',
    phone: '13800138002',
    shopName: '诚信手机维修店',
    email: `lishi_repair_${Date.now()}@test.com`,
    password: 'Test123456',
    confirmPassword: 'Test123456',
  },
  {
    type: 'enterprise',
    typeName: '企业用户',
    name: '王五',
    phone: '13800138003',
    companyName: '深圳电子科技公司',
    email: `wangwu_enterprise_${Date.now()}@test.com`,
    password: 'Test123456',
    confirmPassword: 'Test123456',
  },
  {
    type: 'foreign_trade_company',
    typeName: '外贸公司',
    name: '赵六',
    phone: '13800138004',
    companyName: '广州国际贸易公司',
    email: `zhaoliu_trade_${Date.now()}@test.com`,
    password: 'Test123456',
    confirmPassword: 'Test123456',
  },
];

/**
 * 生成测试报告模板
 */
function generateTestReport() {
  const reportPath = path.join(
    process.cwd(),
    'reports',
    'registration-manual-test-report.md'
  );

  const report = `# 多类型用户注册功能 - 手动测试报告

## 📋 测试概览

**测试日期**: ${new Date().toLocaleString('zh-CN')}
**测试环境**: ${TEST_CONFIG.baseUrl}
**测试页面**: ${TEST_CONFIG.registerPage}

---

## 🎯 测试目标

验证增强版注册页面的所有功能是否正常工作，包括：
- [x] 前端 UI 显示和交互
- [x] 表单验证逻辑
- [x] API 调用和数据提交
- [x] 数据库记录创建
- [x] 错误处理和用户提示

---

## 📝 测试步骤

### 步骤 1: 访问注册页面

1. 打开浏览器
2. 访问：\`${TEST_CONFIG.baseUrl}${TEST_CONFIG.registerPage}\`
3. 确认页面正常加载

**预期结果**:
- ✅ 页面标题显示"加入 FixCycle 平台"
- ✅ 4 个用户类型卡片正常显示
- ✅ 每个卡片有对应的图标和颜色
- ✅ 默认选中"个人用户"

**实际结果**: _________________________________

---

### 步骤 2: 测试个人用户注册

#### 测试数据
\`\`\`
用户类型：个人用户
姓名：${TEST_USERS[0].name}
手机号：${TEST_USERS[0].phone}
邮箱：${TEST_USERS[0].email}
密码：${TEST_USERS[0].password}
确认密码：${TEST_USERS[0].confirmPassword}
\`\`\`

#### 操作步骤
1. 点击"个人用户"卡片（蓝色）
2. 填写所有必填字段
3. 勾选"我同意服务条款和隐私政策"
4. 点击"创建账户"

#### 验证点
- [ ] 表单提交成功
- [ ] 显示加载动画（旋转图标）
- [ ] 提交按钮变为禁用状态
- [ ] 无 JavaScript 错误（F12 Console）
- [ ] 网络请求成功（F12 Network）

#### 预期响应
- ✅ 显示绿色成功页面
- ✅ 提示"注册成功，请检查邮箱确认账户"
- ✅ 3 秒后自动跳转到登录页面

#### 实际结果
_________________________________________________

#### 数据库验证（可选）
执行以下 SQL 验证：
\`\`\`sql
SELECT * FROM user_accounts WHERE email = '${TEST_USERS[0].email}';
-- 应该有 1 条记录
-- user_type = 'individual'
-- account_type = 'individual'

SELECT * FROM individual_users WHERE user_account_id = (
  SELECT id FROM user_accounts WHERE email = '${TEST_USERS[0].email}'
);
-- 应该有 1 条记录
\`\`\`

结果：_____________________________________

---

### 步骤 3: 测试维修店注册

#### 测试数据
\`\`\`
用户类型：维修店
联系人姓名：${TEST_USERS[1].name}
手机号：${TEST_USERS[1].phone}
店铺名称：${TEST_USERS[1].shopName}
邮箱：${TEST_USERS[1].email}
密码：${TEST_USERS[1].password}
确认密码：${TEST_USERS[1].confirmPassword}
\`\`\`

#### 操作步骤
1. 点击"维修店"卡片（绿色）
2. 确认显示"店铺名称"输入框
3. 填写所有必填字段
4. 勾选同意条款
5. 点击"创建账户"

#### 验证点
- [ ] 切换类型时表单清空
- [ ] 显示"店铺名称"输入框
- [ ] 表单提交成功
- [ ] 加载动画显示正常

#### 预期响应
- ✅ 显示成功页面
- ✅ 提示信息正确

#### 实际结果
_________________________________________________

#### 数据库验证
\`\`\`sql
SELECT * FROM user_accounts WHERE email = '${TEST_USERS[1].email}';
-- user_type = 'repair_shop'
-- account_type = 'repair_shop'
-- role = 'shop_manager'

SELECT * FROM repair_shop_users_detail WHERE user_account_id = (
  SELECT id FROM user_accounts WHERE email = '${TEST_USERS[1].email}'
);
-- shop_name = '诚信手机维修店'
-- shop_type = 'independent'
\`\`\`

结果：_____________________________________

---

### 步骤 4: 测试企业用户注册

#### 测试数据
\`\`\`
用户类型：企业用户
联系人姓名：${TEST_USERS[2].name}
手机号：${TEST_USERS[2].phone}
公司名称：${TEST_USERS[2].companyName}
邮箱：${TEST_USERS[2].email}
密码：${TEST_USERS[2].password}
确认密码：${TEST_USERS[2].confirmPassword}
\`\`\`

#### 操作步骤
1. 点击"企业用户"卡片（紫色）
2. 确认显示"公司名称"输入框
3. 填写所有必填字段
4. 勾选同意条款
5. 点击"创建账户"

#### 验证点
- [ ] 切换类型时表单清空
- [ ] 显示"公司名称"输入框
- [ ] 表单提交成功

#### 预期响应
- ✅ 显示成功页面

#### 实际结果
_________________________________________________

#### 数据库验证
\`\`\`sql
SELECT * FROM user_accounts WHERE email = '${TEST_USERS[2].email}';
-- user_type = 'enterprise'
-- account_type = 'factory'
-- role = 'manager'

SELECT * FROM enterprise_users_detail WHERE user_account_id = (
  SELECT id FROM user_accounts WHERE email = '${TEST_USERS[2].email}'
);
-- company_name = '深圳电子科技公司'
-- business_type = 'manufacturer'
\`\`\`

结果：_____________________________________

---

### 步骤 5: 测试外贸公司注册

#### 测试数据
\`\`\`
用户类型：外贸公司
联系人姓名：${TEST_USERS[3].name}
手机号：${TEST_USERS[3].phone}
公司名称：${TEST_USERS[3].companyName}
邮箱：${TEST_USERS[3].email}
密码：${TEST_USERS[3].password}
确认密码：${TEST_USERS[3].confirmPassword}
\`\`\`

#### 操作步骤
1. 点击"外贸公司"卡片（橙色）
2. 确认显示"公司名称"输入框
3. 填写所有必填字段
4. 勾选同意条款
5. 点击"创建账户"

#### 验证点
- [ ] 切换类型时表单清空
- [ ] 显示"公司名称"输入框
- [ ] 表单提交成功

#### 预期响应
- ✅ 显示成功页面

#### 实际结果
_________________________________________________

#### 数据库验证
\`\`\`sql
SELECT * FROM user_accounts WHERE email = '${TEST_USERS[3].email}';
-- user_type = 'foreign_trade_company'
-- account_type = 'foreign_trade'
-- role = 'manager'

SELECT * FROM enterprise_users_detail WHERE user_account_id = (
  SELECT id FROM user_accounts WHERE email = '${TEST_USERS[3].email}'
);
-- company_name = '广州国际贸易公司'
-- business_type = 'foreign_trade'
\`\`\`

结果：_____________________________________

---

## 🔍 表单验证测试

### 必填字段验证

| 测试项 | 操作 | 预期错误 | 实际结果 |
|--------|------|---------|---------|
| 姓名为空 | 不填姓名直接提交 | "请输入姓名" | _______ |
| 邮箱为空 | 不填邮箱直接提交 | "请输入邮箱" | _______ |
| 邮箱格式错误 | 填写 \`invalid@email\` | "请输入有效的邮箱地址" | _______ |
| 手机号为空 | 不填手机号直接提交 | "请输入手机号" | _______ |
| 密码为空 | 不填密码直接提交 | "请输入密码" | _______ |
| 密码长度不足 | 填写 \`12345\` | "密码长度至少 6 位" | _______ |
| 密码不一致 | 两次密码不同 | "两次输入的密码不一致" | _______ |

### 类型特定验证

| 用户类型 | 测试项 | 操作 | 预期错误 | 实际结果 |
|----------|--------|------|---------|---------|
| 企业用户 | 公司名称为空 | 不填公司名称 | "请输入公司名称" | _______ |
| 维修店 | 店铺名称为空 | 不填店铺名称 | "请输入店铺名称" | _______ |

---

## 🎨 UI/UX 测试

### 视觉设计

- [ ] 4 个用户类型卡片显示正常
- [ ] 每个卡片有对应的图标和颜色
- [ ] 选中状态有明显的视觉反馈（边框、背景色、对勾）
- [ ] 响应式布局正常（移动端单列，桌面端多列）
- [ ] 渐变色背景正常显示
- [ ] 字体大小和间距合适

### 交互体验

- [ ] 点击卡片可以切换用户类型
- [ ] 切换类型时表单动态变化
- [ ] 输入框获得焦点时有高亮效果
- [ ] 错误信息即时显示和清除
- [ ] 提交时显示加载动画
- [ ] 按钮禁用状态正常
- [ ] Hover 效果正常

### 成功/失败提示

- [ ] 注册成功显示绿色成功页面
- [ ] 成功页面有倒计时自动跳转
- [ ] 注册失败显示红色错误提示
- [ ] 错误信息清晰可读
- [ ] 错误提示位置明显

---

## 🔐 安全性测试（可选）

### 1. SQL 注入防护

尝试使用特殊字符注册：
- 邮箱：\`test' OR '1'='1@test.com\`
- 姓名：\`'; DROP TABLE users; --\`

预期：应该被拒绝或特殊字符被转义

结果：_____________________________________

### 2. XSS 攻击防护

尝试在姓名字段注入脚本：
- 姓名：\`<script>alert('XSS')</script>\`

预期：应该被拒绝或不接受

结果：_____________________________________

### 3. 重复注册检测

使用相同的邮箱注册两次

预期：第二次提示"该邮箱已被注册"

结果：_____________________________________

---

## 📊 性能测试（可选）

### 页面加载速度

使用 Chrome DevTools 测量：
- First Contentful Paint (FCP): _____ ms （目标：< 1500ms）
- Time to Interactive (TTI): _____ ms （目标：< 3000ms）
- Total Blocking Time (TBT): _____ ms （目标：< 300ms）

### API 响应时间

从点击提交到收到响应的时间：
- 个人用户注册：_____ ms
- 维修店注册：_____ ms
- 企业用户注册：_____ ms
- 外贸公司注册：_____ ms

目标：< 2000ms

---

## 🐛 发现的问题

### 问题 1
**描述**: _____________________________________
**严重程度**: □ 严重 □ 一般 □ 轻微
**重现步骤**: _____________________________________
**截图**: _____________________________________

### 问题 2
**描述**: _____________________________________
**严重程度**: □ 严重 □ 一般 □ 轻微
**重现步骤**: _____________________________________
**截图**: _____________________________________

---

## 💡 改进建议

### 建议 1
_____________________________________

### 建议 2
_____________________________________

---

## ✅ 测试结论

### 总体评价
□ 通过 - 所有功能正常
□ 基本通过 - 主要功能正常，有小问题
□ 未通过 - 存在严重问题

### 是否可上线
□ 是 - 可以立即部署到生产环境
□ 否 - 需要先修复问题

### 测试人员签名
测试人员：_________________
测试日期：_________________
审核人员：_________________

---

*报告版本：v1.0*
*生成时间：${new Date().toLocaleString('zh-CN')}*
`;

  try {
    // 确保 reports 目录存在
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportFile = path.join(
      reportsDir,
      'registration-manual-test-report.md'
    );
    fs.writeFileSync(reportFile, report, 'utf-8');
    console.log('✅ 手动测试报告模板已生成');
    console.log(`📄 文件位置：${reportFile}`);
    console.log('\n💡 使用说明:');
    console.log('1. 打印此报告或在新窗口中打开');
    console.log('2. 按照步骤逐项测试');
    console.log('3. 填写实际结果');
    console.log('4. 保存测试报告');
  } catch (error) {
    console.error('❌ 生成测试报告失败:', error.message);
  }
}

// 主流程
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║   多类型用户注册功能 - 手动测试检查清单                  ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log(`\n🕐 生成时间：${new Date().toLocaleString('zh-CN')}`);

generateTestReport();

console.log('\n📋 测试数据预览:\n');
TEST_USERS.forEach((user, index) => {
  console.log(`${index + 1}. ${user.typeName} (${user.type})`);
  console.log(`   邮箱：${user.email}`);
  console.log(`   姓名：${user.name}`);
  console.log(`   手机：${user.phone}`);
  if (user.companyName) console.log(`   公司：${user.companyName}`);
  if (user.shopName) console.log(`   店铺：${user.shopName}`);
  console.log('');
});

console.log('🚀 开始测试...\n');
console.log('请按以下步骤操作:');
console.log('1. 打开浏览器访问：http://localhost:3001/register-enhanced');
console.log('2. 打开生成的测试报告文件');
console.log('3. 按照报告中的步骤逐项测试');
console.log('4. 记录测试结果\n');
