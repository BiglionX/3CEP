# n8n Templates 目录

此目录包含可重复使用的 n8n 工作流模板。

## 模板列表

### agent-invoke-template.json

标准化的 Agent 调用模板，适用于各种智能体调用场景。

#### 功能特性

- ✅ 标准化输入处理
- ✅ HTTP 请求调用
- ✅ 状态检查和错误处理
- ✅ 指数退避重试机制
- ✅ 失败通知
- ✅ 环境变量配置

#### 使用方法

1. **导入模板**

   - 在 n8n 界面中选择 "Import workflow"
   - 上传 `agent-invoke-template.json` 文件

2. **配置环境变量**
   在 n8n 设置中添加以下环境变量：

   ```bash
   AGENTS_ENDPOINT=http://your-agents-service.com/api
   AGENTS_API_KEY=your-api-key-here
   AGENTS_CREDENTIAL_ID=your-credential-id
   AGENTS_MAX_RETRIES=3
   NOTIFICATION_ENDPOINT=http://your-notification-service.com/api/notifications
   ```

3. **创建凭证**

   - 进入 n8n 的 Credentials 页面
   - 创建新的 HTTP Header Auth 凭证
   - 配置 Authorization header
   - 记录凭证 ID 用于环境变量

4. **自定义工作流**
   - 修改 Set Input 节点以适应具体的输入格式
   - 调整 HTTP Request 节点的 URL 和参数
   - 根据需要修改重试策略

#### 节点说明

1. **Start** - 手动触发节点
2. **Set Input** - 格式化输入数据
3. **HTTP Request** - 调用 Agent API
4. **IF Status Check** - 检查响应状态
5. **Success Output** - 成功结果输出
6. **Retry Counter** - 重试计数器
7. **IF Can Retry** - 判断是否可以重试
8. **Prepare Retry** - 准备重试参数
9. **Delay Before Retry** - 重试延迟
10. **HTTP Request Retry** - 重试请求
11. **Error Output** - 错误信息输出
12. **Send Notification** - 发送失败通知

#### 最佳实践

- ⚠️ 不要在代码中硬编码敏感信息
- 🔧 使用环境变量管理配置
- 📊 监控重试次数和失败率
- 🔄 定期更新凭证和密钥
- 📝 记录重要的环境变量说明

#### 故障排除

常见问题：

1. **凭证错误** - 检查 AGENTS_CREDENTIAL_ID 是否正确
2. **API 超时** - 调整 timeout 参数
3. **重试过多** - 检查 AGENTS_MAX_RETRIES 设置
4. **通知失败** - 验证 NOTIFICATION_ENDPOINT 可访问性

## 贡献指南

欢迎提交新的模板！请确保：

- 遵循现有模板结构
- 提供完整的文档说明
- 使用环境变量而非硬编码
- 包含错误处理机制
