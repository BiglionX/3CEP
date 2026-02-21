# n8n Webhook集成配置指南

## 📋 配置概览

需要在n8n中创建以下webhook节点：

### 1. 线索收集Webhook (lead_capture)
- **URL**: `/webhook/lead-capture`
- **Method**: POST
- **用途**: 接收来自营销页面的线索数据

### 2. 演示预约Webhook (demo_request)
- **URL**: `/webhook/demo-request`
- **Method**: POST
- **用途**: 处理产品演示预约请求

### 3. 联系表单Webhook (contact_form)
- **URL**: `/webhook/contact-form`
- **Method**: POST
- **用途**: 处理通用联系表单提交

## 🔧 详细配置步骤

### 步骤1: 创建新工作流
1. 登录n8n控制台
2. 点击"新建工作流"
3. 命名为"营销线索处理"

### 步骤2: 添加Webhook触发器
```
节点类型: Webhook
节点名称: Lead Capture Webhook
HTTP方法: POST
路径: /webhook/lead-capture
响应模式: 等待执行完成
```

### 步骤3: 配置数据处理逻辑
```
节点类型: Function
节点名称: Process Lead Data
代码:
```
```javascript
// 处理接收到的线索数据
const leadData = items[0].json;

// 数据验证和清洗
if (!leadData.email || !leadData.name) {
  throw new Error('缺少必要字段');
}

// 标准化数据格式
const processedData = {
  ...leadData,
  timestamp: new Date().toISOString(),
  source: leadData.source || 'marketing_site',
  status: 'new',
  assigned_to: null
};

return [{ json: processedData }];
```

### 步骤4: 添加CRM集成
```
节点类型: HTTP Request (或其他CRM节点)
节点名称: Send to CRM
配置:
- URL: your_crm_api_endpoint
- Method: POST
- Authentication: Bearer Token
- Body: {{$json}}
```

### 步骤5: 发送确认邮件
```
节点类型: EmailSend
节点名称: Send Confirmation
配置:
- To: {{$json.email}}
- Subject: 感谢您的关注 - FixCycle
- Body: HTML格式的确认邮件
```

## 🛠️ 环境变量配置

在n8n中设置以下环境变量：

```
WEBHOOK_SECRET=your_webhook_secret_key
CRM_API_URL=your_crm_endpoint
CRM_API_TOKEN=your_crm_token
EMAIL_FROM=noreply@fixcycle.com
SMTP_HOST=smtp.your-email-provider.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

## 🔍 测试验证

### 测试线索收集
```bash
curl -X POST http://localhost:5678/webhook/lead-capture \
  -H "Content-Type: application/json" \
  -d '{
    "role": "ops",
    "name": "测试用户",
    "email": "test@example.com",
    "company": "测试公司",
    "phone": "13800138000",
    "use_case": "测试自动化功能"
  }'
```

### 预期响应
```json
{
  "success": true,
  "message": "线索处理成功",
  "lead_id": "generated_uuid"
}
```

## 📊 监控和日志

### 添加日志记录节点
```
节点类型: Logger
节点名称: Log Processing Result
配置:
- Level: info
- Message: {{$json.message}}
- Metadata: {{$json}}
```

### 错误处理
```
节点类型: Catch Error
节点名称: Handle Processing Errors
配置:
- Retry attempts: 3
- Delay between retries: 5 minutes
- Error notification: email to admin
```

## 🔄 回滚方案

如果需要回滚：
1. 在n8n中停用相关webhook节点
2. 删除已创建的工作流
3. 恢复之前的配置版本

## 💡 最佳实践

1. **安全性**: 使用webhook密钥验证请求来源
2. **监控**: 设置执行成功/失败的监控告警
3. **日志**: 记录所有重要操作的日志
4. **备份**: 定期备份n8n工作流配置
5. **测试**: 上线前充分测试所有场景