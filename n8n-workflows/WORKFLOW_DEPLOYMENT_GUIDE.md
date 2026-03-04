# n8n工作流配置说明

## 已创建的工作流

### 1. device-activation-welcome.json (N8N-206)

**功能**: 监听设备激活事件并发送个性化欢迎消息

**触发条件**:

- 监听 `device_profiles` 表
- 当 `current_status` 变为 `activated` 时触发
- 过滤最近5分钟内的激活事件

**执行流程**:

1. 监听设备激活事件
2. 过滤首次激活的设备
3. 准备欢迎消息数据
4. 发送企业微信欢迎消息
5. 发送欢迎邮件
6. 记录通知日志

**配置参数**:

- `wechatWebhookUrl`: 企业微信机器人Webhook地址
- `emailApiUrl`: 邮件服务API地址

### 2. ticket-completion-archive.json (N8N-205)

**功能**: 监听工单完成事件，自动记录设备档案并发送通知

**触发条件**:

- 监听 `tickets` 表
- 当 `status` 变为 `completed` 时触发
- 过滤最近10分钟内的完成事件

**执行流程**:

1. 监听工单完成事件
2. 提取工单相关数据
3. 调用LIFE-201 API记录生命周期事件
4. 检查记录是否成功
5. 发送完成通知（成功/失败）
6. 记录完成日志

**配置参数**:

- `lifecycleApiUrl`: 生命周期API基础URL
- `lifecycleApiKey`: API密钥
- `wechatWebhookUrl`: 通知Webhook地址
- `errorWebhookUrl`: 错误通知Webhook地址

## 部署步骤

1. **环境配置**:

   ```bash
   # 设置必要的环境变量
   export WECHAT_WEBHOOK_URL="your_wechat_webhook_url"
   export LIFECYCLE_API_KEY="your_lifecycle_api_key"
   ```

2. **导入工作流**:
   - 登录n8n管理界面
   - 选择"导入工作流"
   - 上传对应的JSON文件

3. **配置凭证**:
   - 配置Supabase数据库连接
   - 设置HTTP请求认证信息
   - 配置Webhook地址

4. **测试运行**:
   - 手动触发测试
   - 验证各节点执行情况
   - 检查通知是否正常发送

## 注意事项

- 确保Supabase Realtime功能已启用
- Webhook地址需要预先在对应平台配置
- 建议先在测试环境验证后再部署到生产环境
- 定期检查工作流执行日志和错误记录
