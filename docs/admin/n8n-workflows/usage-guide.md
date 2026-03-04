# n8n工作流管理使用指南

## 概述

本文档详细介绍n8n自动化工作流系统的使用方法、触发方式和日常管理操作，帮助管理员高效运维四个核心业务工作流。

## 工作流概览

### 四个核心工作流

1. **扫码智能服务工作流** (`scan-flow`)
   - 功能：设备扫码识别 → AI诊断 → 教程推荐 → 新机推荐
   - 触发方式：用户扫描设备二维码
   - Webhook端点：`POST /webhook/scan-service`

2. **教程浏览引导工作流** (`tutorial-flow`)
   - 功能：用户行为分析 → 配件推荐 → 店铺查询 → 实时推送
   - 触发方式：用户浏览教程页面
   - Webhook端点：`POST /webhook/tutorial-guide`

3. **支付成功后续处理工作流** (`payment-success`)
   - 功能：支付验证 → 订单确认 → 积分更新 → 物流启动
   - 触发方式：第三方支付平台回调
   - Webhook端点：`POST /webhook/payment-success`

4. **AI诊断转人工工作流** (`ai-escalation`)
   - 功能：置信度监测 → 工单创建 → 工程师分配 → 多渠道通知
   - 触发方式：AI诊断置信度低于阈值
   - Webhook端点：`POST /webhook/ai-escalation`

## 工作流触发方式详解

### 1. 扫码服务工作流触发

#### 触发条件

- 用户通过移动端或网页端扫描设备二维码
- 系统识别到有效的设备标识信息

#### 请求示例

```bash
curl -X POST https://your-n8n-domain.com/webhook/scan-service \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "DEV20260220001",
    "qrCode": "QR123456789",
    "brand": "Apple",
    "model": "iPhone 14 Pro",
    "serialNumber": "SN123456789"
  }'
```

#### 响应格式

```json
{
  "success": true,
  "deviceId": "DEV20260220001",
  "diagnosis": {
    "summary": "电池老化严重，建议更换",
    "severity": "high",
    "recommendation": "replace"
  },
  "tutorials": [
    {
      "id": "tutorial-001",
      "title": "iPhone电池更换完整教程",
      "difficulty": "medium",
      "estimatedTime": "45分钟",
      "url": "/tutorials/battery-replacement"
    }
  ],
  "newDevices": [
    {
      "id": "device-001",
      "name": "iPhone 15 Pro",
      "price": 7999,
      "specScore": 92,
      "url": "/products/iphone-15-pro"
    }
  ]
}
```

### 2. 教程引导工作流触发

#### 触发条件

- 用户在教程页面停留超过30秒
- 用户滚动页面超过50%
- 用户点击教程中的关键步骤

#### 请求示例

```bash
curl -X POST https://your-n8n-domain.com/webhook/tutorial-guide \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER001",
    "tutorialId": "TUT001",
    "deviceType": "smartphone",
    "eventType": "page_view",
    "duration": 120,
    "scrollDepth": 0.75,
    "latitude": 39.9042,
    "longitude": 116.4074
  }'
```

### 3. 支付成功工作流触发

#### 触发条件

- 收到第三方支付平台的成功回调
- 签名验证通过
- 订单金额与系统记录一致

#### 请求示例

```bash
curl -X POST https://your-n8n-domain.com/webhook/payment-success \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer payment_webhook_token" \
  -d '{
    "order_id": "ORDER20260220001",
    "payment_id": "PAY20260220001",
    "amount": 2999.00,
    "currency": "CNY",
    "payment_method": "alipay",
    "timestamp": "2026-02-20T14:30:00Z",
    "signature": "encrypted_signature_hash"
  }'
```

### 4. AI转人工工作流触发

#### 触发条件

- AI诊断置信度低于70%阈值
- 问题复杂度评估为高级别
- 用户明确要求人工协助

#### 请求示例

```bash
curl -X POST https://your-n8n-domain.com/webhook/ai-escalation \
  -H "Content-Type: application/json" \
  -d '{
    "diagnosisId": "DIAG20260220001",
    "confidenceScore": 65,
    "userId": "USER001",
    "deviceModel": "iPhone 14 Pro",
    "issueDescription": "电池异常耗电",
    "urgency": "high",
    "detectedIssues": ["电池健康度低", "后台应用耗电异常"]
  }'
```

## 日常监控管理

### 监控指标

#### 核心性能指标

| 指标名称     | 目标值 | 告警阈值 | 监控频率 |
| ------------ | ------ | -------- | -------- |
| 平均响应时间 | < 2秒  | > 5秒    | 实时     |
| 成功率       | > 95%  | < 90%    | 每分钟   |
| 并发处理能力 | > 100  | < 50     | 每5分钟  |
| 错误率       | < 1%   | > 3%     | 实时     |

#### 业务指标

| 指标名称       | 说明                   | 监控方式     |
| -------------- | ---------------------- | ------------ |
| 工作流执行次数 | 各工作流每日执行量     | n8n执行历史  |
| 用户转化率     | 从推荐到实际购买的比例 | 数据分析     |
| 工单创建量     | AI转人工的频率         | 工单系统统计 |
| 积分发放准确性 | 积分计算正确率         | 财务审计     |

### 监控工具配置

#### 1. n8n内置监控

```javascript
// 在n8n中设置执行监控
监控配置 = {
  执行历史保留: '30天',
  失败执行告警: '邮件+短信',
  性能阈值监控: '启用',
  执行时间分析: '每日报告',
};
```

#### 2. 外部监控集成

```yaml
# Prometheus监控配置示例
scrape_configs:
  - job_name: 'n8n-workflows'
    static_configs:
      - targets: ['n8n.yourdomain.com:5678']
    metrics_path: '/metrics'
    scrape_interval: 30s
```

#### 3. 告警规则设置

```json
{
  "告警规则": {
    "高响应时间": {
      "条件": "平均响应时间 > 5秒持续2分钟",
      "通知方式": ["邮件", "钉钉", "电话"]
    },
    "低成功率": {
      "条件": "成功率 < 90%持续5分钟",
      "通知方式": ["邮件", "钉钉"]
    },
    "系统错误": {
      "条件": "出现未处理异常",
      "通知方式": ["邮件", "钉钉", "电话"]
    }
  }
}
```

## 常见问题处理

### 问题1：工作流执行失败

#### 现象

- Webhook返回500错误
- 执行历史显示红色失败标记
- 用户反馈服务不可用

#### 排查步骤

1. **检查n8n服务状态**

   ```bash
   # 检查n8n进程
   ps aux | grep n8n

   # 检查端口占用
   netstat -tlnp | grep 5678
   ```

2. **查看执行日志**

   ```bash
   # 查看最近的执行日志
   curl -X GET "https://n8n.yourdomain.com/executions/current" \
     -H "Authorization: Bearer $N8N_API_TOKEN"
   ```

3. **验证API连接**

   ```bash
   # 测试依赖的API服务
   curl -X GET "https://api.yourdomain.com/health"
   ```

4. **检查环境变量**
   ```bash
   # 验证必需的环境变量
   echo $AI_DIAGNOSIS_API_URL
   echo $PAYMENT_WEBHOOK_SECRET
   ```

#### 解决方案

- 重启n8n服务
- 更新失效的API端点
- 修正环境变量配置
- 检查网络连接状态

### 问题2：数据处理异常

#### 现象

- 返回数据格式错误
- 缺少关键字段
- 数据类型不匹配

#### 处理方法

1. **验证输入数据格式**

   ```json
   // 正确的输入格式示例
   {
     "deviceId": "string",
     "amount": "number",
     "timestamp": "ISO 8601格式"
   }
   ```

2. **检查数据转换节点**
   - 确认Transform节点的字段映射正确
   - 验证数据类型转换规则
   - 检查必填字段验证逻辑

3. **启用调试模式**
   - 在n8n中开启节点调试输出
   - 查看中间数据处理结果
   - 验证数据流向正确性

### 问题3：性能下降

#### 现象

- 响应时间明显延长
- 并发处理能力下降
- 系统资源占用过高

#### 优化措施

1. **性能调优**

   ```bash
   # 调整n8n配置
   N8N_CONCURRENCY=10
   N8N_EXECUTION_TIMEOUT=300
   N8N_LOG_LEVEL=warn
   ```

2. **缓存优化**
   - 启用Redis缓存热点数据
   - 优化数据库查询语句
   - 减少不必要的API调用

3. **负载均衡**
   ```yaml
   # nginx负载均衡配置
   upstream n8n_backend {
   server n8n-node1:5678 weight=3;
   server n8n-node2:5678 weight=3;
   server n8n-node3:5678 backup;
   }
   ```

## 安全管理

### 访问控制

- API密钥定期轮换（建议每月）
- Webhook端点启用签名验证
- 敏感操作需要二次确认

### 数据保护

- 用户隐私信息脱敏处理
- 敏感配置使用环境变量
- 执行日志定期清理

### 审计日志

- 记录所有工作流修改操作
- 监控异常访问行为
- 定期审查权限分配

## 版本管理和更新

### 更新流程

1. 在测试环境验证新版本
2. 备份当前生产配置
3. 执行灰度发布
4. 监控更新后系统表现
5. 准备回滚方案

### 回滚操作

```bash
# 使用部署脚本回滚
./scripts/deploy-n8n-workflows.sh --rollback --backup-id BACKUP_20260220_143022
```

## 联系支持

### 技术支持

- **紧急问题**: 电话支持热线 400-XXX-XXXX
- **一般问题**: support@yourdomain.com
- **文档更新**: docs-team@yourdomain.com

### 社区资源

- 官方文档: https://docs.n8n.io
- 社区论坛: https://community.n8n.io
- GitHub仓库: https://github.com/your-org/n8n-workflows

---

**文档版本**: v1.0.0  
**最后更新**: 2026年2月20日  
**维护团队**: 技术运维部
