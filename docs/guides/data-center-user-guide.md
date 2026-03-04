# 数据中心系统使用手册

## 📋 系统概述

数据中心系统是一个完整的企业级数据处理和监控平台，提供实时数据处理、智能监控告警、数据质量检测等核心功能。

## 🏗️ 系统架构

### 核心组件

```
数据中心系统
├── 实时处理层 (Streaming Layer)
│   ├── Redis Streams消息队列
│   ├── 事件处理器
│   └── 消费者组管理
├── 监控告警层 (Monitoring Layer)
│   ├── 指标收集
│   ├── 告警引擎
│   └── 通知系统
├── 数据质量层 (Quality Layer)
│   ├── 质量检查规则
│   ├── 问题检测
│   └── 质量报告
└── 机器学习层 (ML Layer)
    ├── 推荐算法
    └── 智能分析
```

## 🚀 快速开始

### 环境准备

1. **安装依赖**

```bash
npm install
```

2. **配置环境变量**

```bash
# 复制环境变量模板
cp .env.datacenter.example .env.datacenter

# 编辑配置文件
vim .env.datacenter
```

3. **启动服务**

```bash
# 启动开发服务器
npm run dev

# 启动数据中心服务
npm run data-center:start
```

### 基本使用

#### 1. 实时数据处理

```javascript
// 发布实时事件
const event = {
  id: 'evt_001',
  type: 'price_update',
  payload: {
    partId: 'PART001',
    oldPrice: 100,
    newPrice: 95,
  },
  timestamp: new Date().toISOString(),
  source: 'pricing_service',
  priority: 'medium',
};

await realTimeDataService.publishEvent(event);
```

#### 2. 监控指标记录

```javascript
// 记录监控指标
monitoringService.recordMetric('query_response_time', 150, {
  endpoint: '/api/parts',
  method: 'GET',
});

// 添加告警规则
monitoringService.addAlertRule({
  id: 'slow_query_alert',
  name: '查询响应过慢',
  metric: 'query_response_time',
  condition: 'above',
  threshold: 2000,
  severity: 'warning',
  notifications: ['console', 'email'],
});
```

#### 3. 数据质量检测

```javascript
// 执行数据质量检查
const results = await dataQualityService.runAllChecks();

// 查看质量报告
const report = await dataQualityService.generateQualityReport();
console.log(`整体质量评分: ${report.summary.overallScore}%`);
```

## 📊 API接口文档

### 实时处理API

**发布事件**

```
POST /api/data-center/streaming
{
  "action": "publish",
  "event": {
    "type": "price_update",
    "payload": { ... }
  }
}
```

**获取服务状态**

```
GET /api/data-center/streaming?action=status
```

### 监控API

**获取监控仪表板**

```
GET /api/monitoring?action=dashboard
```

**记录指标**

```
POST /api/monitoring
{
  "action": "record-metric",
  "metric": {
    "name": "cpu_usage",
    "value": 75.5
  }
}
```

### 数据质量API

**生成质量报告**

```
GET /api/data-quality?action=report
```

**执行特定检查**

```
POST /api/data-quality
{
  "action": "run-check",
  "ruleId": "parts_completeness_check"
}
```

## ⚙️ 配置说明

### 环境变量配置

```env
# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# 数据库连接
SUPABASE_DB_HOST=your-host
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=your-db

# 监控配置
MONITORING_ENABLED=true
ALERT_EMAIL_USER=your-email@gmail.com
ALERT_SLACK_WEBHOOK_URL=your-webhook-url
```

### 服务配置

```javascript
// 实时处理配置
const realtimeConfig = {
  batchSize: 10,
  blockTime: 2000,
  maxRetries: 3,
};

// 监控配置
const monitoringConfig = {
  retentionPeriod: 24 * 60 * 60 * 1000, // 24小时
  alertCooldown: 5 * 60 * 1000, // 5分钟
};

// 数据质量配置
const qualityConfig = {
  defaultThreshold: 5,
  samplingRate: 1.0,
  enableAutoFix: false,
};
```

## 🔧 管理操作

### 检查规则管理

```javascript
// 添加检查规则
dataQualityService.addCheckRule({
  id: 'custom_check_001',
  name: '自定义检查规则',
  tableName: 'custom_table',
  checkType: 'missing_value',
  threshold: 2.0,
  enabled: true,
});

// 更新检查规则
dataQualityService.updateCheckRule('custom_check_001', {
  threshold: 1.0,
  enabled: false,
});

// 删除检查规则
dataQualityService.removeCheckRule('custom_check_001');
```

### 告警规则管理

```javascript
// 配置通知渠道
monitoringService.configureNotifications({
  email: {
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    username: 'your-email@gmail.com',
    password: 'your-app-password',
    toAddresses: ['admin@company.com'],
  },
  slack: {
    webhookUrl: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
  },
});
```

## 📈 性能优化

### 监控最佳实践

1. **合理的指标采样率**

```javascript
// 高频指标适当采样
monitoringService.recordMetric('request_count', requestCount, {
  samplingRate: 0.1, // 10%采样
});
```

2. **告警去抖动**

```javascript
// 设置告警冷却时间
const alertRule = {
  ...ruleConfig,
  duration: 300, // 持续5分钟才触发
  cooldown: 300, // 告警间隔5分钟
};
```

### 数据质量优化

1. **增量检查**

```javascript
// 只检查最近更新的数据
const incrementalRule = {
  ...baseRule,
  parameters: {
    timeWindow: '1 hour',
    modifiedOnly: true,
  },
};
```

2. **并行处理**

```javascript
// 并行执行多个检查
const results = await Promise.all([
  dataQualityService.executeCheckRule('rule_1'),
  dataQualityService.executeCheckRule('rule_2'),
  dataQualityService.executeCheckRule('rule_3'),
]);
```

## 🛡️ 安最佳实践

### 访问控制

```javascript
// API访问验证
function validateAPIAccess(req) {
  const apiKey = req.headers['x-api-key'];
  if (!isValidAPIKey(apiKey)) {
    throw new Error('Unauthorized access');
  }
}
```

### 数据保护

```javascript
// 敏感数据脱敏
function maskSensitiveData(data) {
  return {
    ...data,
    email: maskEmail(data.email),
    phone: maskPhone(data.phone),
  };
}
```

## 🚨 故障排除

### 常见问题

1. **Redis连接失败**

```bash
# 检查Redis服务状态
redis-cli ping

# 查看连接配置
console.log('Redis配置:', {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});
```

2. **告警不触发**

```javascript
// 检查告警规则状态
const rules = monitoringService.getAllAlertRules();
console.log(
  '启用的告警规则:',
  rules.filter(r => r.enabled)
);
```

3. **数据质量检查异常**

```javascript
// 查看检查历史
const history = dataQualityService.getCheckHistory(10);
console.log('最近检查记录:', history);
```

### 日志分析

```javascript
// 启用详细日志
process.env.LOG_LEVEL = 'debug';

// 查看错误日志
const errorLogs = getLogsByLevel('error');
errorLogs.forEach(log => {
  console.error('错误详情:', log.message, log.stack);
});
```

## 📞 技术支持

### 联系方式

- **技术支持邮箱**: support@fixcycle.com
- **紧急联系电话**: 400-XXX-XXXX
- **在线文档**: https://docs.fixcycle.com
- **社区论坛**: https://community.fixcycle.com

### 问题反馈模板

```
问题描述: [详细描述遇到的问题]
重现步骤: [如何重现该问题]
期望结果: [应该得到什么结果]
实际结果: [实际得到什么结果]
环境信息: [操作系统、浏览器、版本等]
日志信息: [相关错误日志]
```

---

**文档版本**: v1.0  
**最后更新**: 2026年2月15日  
**适用系统**: 数据中心系统 3.0
