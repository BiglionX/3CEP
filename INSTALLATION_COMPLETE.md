# ✅ 依赖安装完成确认

## 📦 已安装的包

### 核心依赖

```bash
✅ @sendgrid/mail@8.1.6
✅ twilio@5.13.1
```

**安装命令**:
```bash
npm install @sendgrid/mail twilio --legacy-peer-deps
```

**安装时间**: 2026-03-24  
**Node.js 版本**: v20.11.0  
**npm 版本**: 10.2.4

---

## ⚠️ 注意事项

### 1. 使用 `--legacy-peer-deps` 参数

**原因**: 项目中存在以下依赖冲突：
- `@auth/core` 需要 `nodemailer@^7.0.7`
- 项目已安装 `nodemailer@6.10.1`
- `@eslint/js` 需要 `eslint@^10.0.0`
- 项目已安装 `eslint@8.57.0`

**解决方案**: 使用 `--legacy-peer-deps` 忽略这些非关键冲突

### 2. Node.js 版本警告

部分包期望更高版本的 Node.js：
- 期望：`^20.19.0 || ^22.12.0 || >=24.0.0`
- 当前：`v20.11.0`

**影响**: 目前不影响功能使用，但建议未来升级到 Node.js 20.19+ 或 22+

---

## 🎯 下一步操作

### 1. 配置环境变量

复制并编辑环境变量文件：

```bash
cp .env.example.services .env.local
```

编辑 `.env.local`，填入真实值：

```env
# SendGrid 邮件服务
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@fixcycle.com

# Twilio 短信服务
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+861234567890

# Cron 任务密钥（可选）
CRON_SECRET=your_secure_random_secret_here
```

### 2. 执行数据库迁移

按照以下步骤执行：

**方式 1: Supabase Dashboard（推荐）**

1. 访问 https://app.supabase.com
2. 进入 SQL Editor
3. 依次执行：
   - `20260324_add_subscription_pause_fields.sql`
   - `20260324_create_subscription_reminders.sql`

**方式 2: 命令行工具**

```bash
psql $DATABASE_URL -f supabase/migrations/20260324_add_subscription_pause_fields.sql
psql $DATABASE_URL -f supabase/migrations/20260324_create_subscription_reminders.sql
```

### 3. 测试服务

#### 测试 SendGrid

创建测试文件 `test-sendgrid.js`:

```javascript
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function testSendGrid() {
  try {
    await sgMail.send({
      to: 'test@example.com',
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: '测试邮件',
      text: '这是一封测试邮件',
      html: '<strong>这是一封测试邮件</strong>',
    });
    console.log('✅ 邮件发送成功！');
  } catch (error) {
    console.error('❌ 邮件发送失败:', error.message);
  }
}

testSendGrid();
```

运行测试：
```bash
node test-sendgrid.js
```

#### 测试 Twilio

创建测试文件 `test-twilio.js`:

```javascript
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function testTwilio() {
  try {
    const message = await client.messages.create({
      body: '测试短信',
      from: process.env.TWILIO_PHONE_NUMBER,
      to: '+8613800138000',
    });
    console.log('✅ 短信发送成功！SID:', message.sid);
  } catch (error) {
    console.error('❌ 短信发送失败:', error.message);
  }
}

testTwilio();
```

运行测试：
```bash
node test-twilio.js
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问测试端点：
- 邮件服务：`src/lib/email/sendgrid.service.ts`
- 短信服务：`src/lib/sms/twilio.service.ts`
- 调度器：`src/lib/scheduler/subscription-reminder.scheduler.ts`
- API 端点：`/api/cron/subscription-reminders`

---

## 📊 验证清单

- [ ] ✅ `@sendgrid/mail` 已安装
- [ ] ✅ `twilio` 已安装
- [ ] ⬜ 环境变量已配置
- [ ] ⬜ 数据库迁移已执行
- [ ] ⬜ SendGrid 测试通过
- [ ] ⬜ Twilio 测试通过
- [ ] ⬜ 开发服务器正常运行

---

## 🔍 故障排查

### 问题 1: 找不到模块

**错误**: `Cannot find module '@sendgrid/mail'`

**解决方案**:
```bash
# 重新安装
rm -rf node_modules package-lock.json
npm install @sendgrid/mail twilio --legacy-peer-deps
```

### 问题 2: 类型错误

**错误**: TypeScript 类型定义缺失

**解决方案**:
```bash
# 安装类型定义（如果需要）
npm install --save-dev @types/node
```

### 问题 3: 环境变量未生效

**检查**:
```bash
# 确认 .env.local 文件存在
ls -la .env.local

# 确认变量名正确
cat .env.local | grep SENDGRID
cat .env.local | grep TWILIO
```

---

## 📞 需要帮助？

参考文档：
- [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md) - 快速启动指南
- [IMPLEMENTATION_REPORT_20260324.md](./IMPLEMENTATION_REPORT_20260324.md) - 实施报告
- [supabase/migrations/EXECUTION_GUIDE.md](./supabase/migrations/EXECUTION_GUIDE.md) - 数据库迁移指南

官方文档：
- [SendGrid Docs](https://sendgrid.com/docs/)
- [Twilio Docs](https://www.twilio.com/docs)

---

**安装完成时间**: 2026-03-24  
**状态**: ✅ 成功  
**下一步**: 配置环境变量并执行数据库迁移
