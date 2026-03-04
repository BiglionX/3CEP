# Agent Invoke Template 使用指南

## 🎯 模板概述

这是一个标准化的 n8n Agent 调用模板，实现了完整的调用、重试和错误处理流程。

## 📋 环境变量配置

在 n8n 中设置以下环境变量：

```bash
# 必需变量
AGENTS_ENDPOINT=http://your-agents-service.com/api
AGENTS_API_KEY=your-secret-api-key
AGENTS_CREDENTIAL_ID=n8n-credential-id

# 可选变量
AGENTS_MAX_RETRIES=3
NOTIFICATION_ENDPOINT=http://notification-service/api/notifications
```

## 🔧 凭证配置

1. 进入 n8n Credentials 页面
2. 创建新的 "HTTP Header Auth" 凭证
3. 配置如下：
   - Name: Agents API Credentials
   - Header Name: Authorization 或 X-API-Key
   - Header Value: Bearer YOUR_TOKEN 或你的 API 密钥
4. 记录生成的凭证 ID

## ▶️ 使用步骤

1. **导入模板**
   - n8n 界面 → Import workflow
   - 选择 `agent-invoke-template.json`

2. **配置变量**
   - 更新所有 `$env.VARIABLE_NAME` 引用
   - 确保凭证 ID 正确

3. **测试工作流**
   - 点击 Execute Workflow
   - 观察执行日志

## 🔄 重试机制

- 默认最大重试次数：3 次
- 采用指数退避策略：1s, 2s, 4s...
- 可通过 `AGENTS_MAX_RETRIES` 环境变量调整

## 📊 监控要点

- 成功率统计
- 平均响应时间
- 重试次数分布
- 错误类型分析

## 🛠 自定义建议

- 根据实际 API 调整请求参数
- 修改重试条件和策略
- 扩展错误处理逻辑
- 添加更多的监控指标
