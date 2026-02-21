# n8n 工作流集成文档

## 概述

本文档介绍如何在 n8n 中配置和使用 B2B 采购智能体通信工作流。

## 工作流文件说明

### 1. 基础工作流 (b2b-procurement-agent-workflow.json)
- 简单的 Webhook 到 API 调用流程
- 包含基本的请求转发和响应处理
- 适用于快速测试和简单集成场景

### 2. 高级工作流 (b2b-procurement-advanced-workflow.json)
- 包含完整的错误处理机制
- 添加了请求元数据和日志记录
- 支持条件分支和复杂响应处理
- 适用于生产环境部署

## 导入工作流步骤

### 方法一：通过 n8n UI 导入

1. 登录到您的 n8n 实例
2. 点击左侧菜单的 "Workflows"（工作流）
3. 点击 "Import"（导入）按钮
4. 选择对应的 JSON 文件：
   - 基础版本：`b2b-procurement-agent-workflow.json`
   - 高级版本：`b2b-procurement-advanced-workflow.json`
5. 点击 "Import" 确认导入

### 方法二：通过命令行导入

```bash
# 使用 n8n CLI 工具
n8n import:workflow --input=./n8n-workflows/b2b-procurement-agent-workflow.json
```

## 配置工作流参数

### 1. 设置基础 URL

在工作流中，需要配置智能体 API 的基础 URL：

1. 打开导入的工作流
2. 找到 "Call B2B Parser API" 节点
3. 在参数设置中找到 URL 字段
4. 将 `={{ $parameter['baseUrl'] }}` 替换为实际的 API 地址，例如：
   ```
   http://localhost:3000
   ```

### 2. 配置 Webhook URL

导入后，工作流会自动生成 Webhook URL：

- 基础工作流：`http://your-n8n-host:5678/webhook/b2b-procurement-parse`
- 高级工作流：`http://your-n8n-host:5678/webhook/b2b-procurement-advanced`

## 启动工作流

1. 点击工作流右上角的 "Active" 开关，将其激活
2. 确保工作流显示为绿色的 "Active" 状态
3. 记录生成的 Webhook URL

## 使用示例

### 基础调用示例

```bash
curl -X POST http://your-n8n-host:5678/webhook/b2b-procurement-parse \
  -H "Content-Type: application/json" \
  -d '{
    "description": "我需要采购100个电子元件A和50个连接器B，预算5000元",
    "companyId": "company-001",
    "requesterId": "user-001"
  }'
```

### 高级调用示例

```bash
curl -X POST http://your-n8n-host:5678/webhook/b2b-procurement-advanced \
  -H "Content-Type: application/json" \
  -d '{
    "description": "紧急采购一批服务器配件，包括CPU、内存条、硬盘等，要求一周内到货",
    "companyId": "tech-company-ltd",
    "requesterId": "procurement-manager"
  }'
```

## 响应格式

### 成功响应示例

```json
{
  "success": true,
  "message": "解析完成",
  "itemsCount": 3,
  "confidence": 95,
  "processingTime": "156ms",
  "parsedItems": [
    {
      "productName": "电子元件A",
      "quantity": 100,
      "unit": "件"
    },
    {
      "productName": "连接器B", 
      "quantity": 50,
      "unit": "个"
    }
  ]
}
```

### 错误响应示例

```json
{
  "success": false,
  "message": "采购需求解析失败",
  "errorCode": "INVALID_INPUT",
  "timestamp": "2026-02-19T10:30:00.000Z"
}
```

## 故障排除

### 常见问题

1. **Webhook 无法访问**
   - 检查 n8n 服务是否正常运行
   - 确认防火墙设置允许对应端口访问
   - 验证域名解析是否正确

2. **API 调用失败**
   - 检查智能体 API 服务是否在线
   - 验证基础 URL 配置是否正确
   - 确认网络连通性

3. **响应格式异常**
   - 检查 Transform 节点的字段映射
   - 验证源 API 返回的数据结构
   - 查看 n8n 执行日志

### 调试技巧

1. 使用 n8n 的执行历史功能查看详细日志
2. 在关键节点添加调试输出
3. 利用 n8n 的测试执行功能逐步验证

## 安全考虑

### 认证配置

建议在生产环境中添加以下安全措施：

1. **API 密钥认证**
   ```json
   {
     "headers": {
       "Authorization": "Bearer YOUR_API_KEY"
     }
   }
   ```

2. **IP 白名单**
   - 在 n8n 配置中限制 Webhook 访问来源

3. **请求频率限制**
   - 使用 n8n 的限流节点控制访问频率

### 环境变量管理

敏感配置建议使用环境变量：

```bash
# 在 n8n 环境变量中设置
N8N_API_BASE_URL=http://your-api-host:3000
N8N_API_KEY=your-secret-api-key
```

然后在工作流中引用：
```
{{ $env.N8N_API_BASE_URL }}
{{ $env.N8N_API_KEY }}
```

## 性能优化

### 批量处理

对于大量请求，可以：

1. 添加队列管理节点
2. 实现批量 API 调用
3. 使用并行处理提高效率

### 缓存机制

考虑添加缓存层：

1. Redis 缓存常用查询结果
2. 本地缓存高频访问数据
3. 设置合理的缓存过期时间

## 监控和维护

### 日志监控

1. 启用 n8n 执行日志
2. 配置错误通知机制
3. 设置性能指标监控

### 定期维护

1. 清理过期的执行历史
2. 更新 API 端点配置
3. 验证工作流功能完整性

## 版本更新

当智能体 API 发生变化时：

1. 备份当前工作流
2. 更新 HTTP Request 节点的请求格式
3. 调整 Transform 节点的字段映射
4. 进行全面的功能测试
5. 分阶段部署到生产环境

---

**注意**：请根据实际部署环境调整配置参数，确保网络安全和数据隐私保护。