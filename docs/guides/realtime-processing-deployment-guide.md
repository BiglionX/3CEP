# 数据中心实时数据处理系统部署文档

## 📋 系统概述

本系统实现了基于消息队列的实时数据处理能力，支持多种消息队列后端（Redis Streams、Kafka、RabbitMQ），具备高性能、低延迟的特点。

## 🏗️ 架构设计

### 核心组件

```
实时数据处理系统
├── 消息队列管理层 (message-queue-manager.ts)
│   ├── Redis Streams适配器
│   ├── Kafka适配器
│   └── RabbitMQ适配器
├── 增强实时服务层 (enhanced-realtime-service.ts)
│   ├── 批处理支持
│   ├── 事务处理
│   └── 优先级队列
├── 业务事件触发器 (business-event-trigger.ts)
│   ├── 价格更新触发
│   ├── 库存变更触发
│   └── 订单状态触发
├── 通知告警系统 (notification-alert-system.ts)
│   ├── 多渠道通知
│   ├── 告警规则引擎
│   └── 事件处理管道
└── 监控告警系统 (monitoring-alert-system.ts)
    ├── 性能监控
    ├── 堆积检测
    └── 延迟监控
```

## 🚀 部署指南

### 1. 环境准备

#### 系统要求

- Node.js 16+
- Redis 6+ (必需)
- Kafka 或 RabbitMQ (可选)

#### 依赖安装

```bash
npm install
npm install kafkajs amqplib @types/amqplib
```

### 2. 配置文件

创建 `.env.datacenter` 文件：

```env
# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Kafka配置（可选）
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=data-center-client

# RabbitMQ配置（可选）
RABBITMQ_URL=amqp://localhost
RABBITMQ_EXCHANGE=data_center_exchange

# 通知配置
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
DEFAULT_WEBHOOK_URL=http://your-webhook-endpoint
```

### 3. 启动服务

```bash
# 启动开发环境
npm run dev

# 启动实时处理服务
npm run data-center:start
```

## 🔧 核心功能配置

### 消息队列配置

```javascript
// 选择消息队列类型
const messageQueueManager = new MessageQueueManager([
  {
    type: 'redis', // 支持: redis, kafka, rabbitmq
    redis: {
      host: 'localhost',
      port: 6379,
    },
  },
]);

await messageQueueManager.connect('redis');
```

### 批处理配置

```javascript
// 配置批处理参数
enhancedRealTimeService.configureBatch({
  maxSize: 50, // 批处理最大大小
  maxWaitTime: 1000, // 最大等待时间(ms)
  flushOnClose: true, // 关闭时刷新缓冲区
});
```

### 事务配置

```javascript
// 配置事务参数
enhancedRealTimeService.configureTransaction({
  timeout: 30000, // 事务超时时间
  retryAttempts: 3, // 重试次数
  isolationLevel: 'read_committed', // 隔离级别
});
```

## 📊 性能指标

### 延迟要求

- **P95延迟**: < 100ms
- **平均延迟**: < 50ms
- **最大延迟**: < 200ms

### 吞吐量要求

- **处理能力**: > 1000 events/sec
- **并发处理**: 支持 100+ 并发连接

### 资源使用

- **内存占用**: < 1GB
- **CPU使用**: < 50%

## 🔔 告警配置

### 堆积告警

```javascript
monitoringAlertSystem.addBacklogAlert({
  topic: 'price_update',
  threshold: 1000, // 消息堆积阈值
  checkInterval: 30000, // 检查间隔(ms)
  alertChannels: ['email', 'slack'],
});
```

### 延迟告警

```javascript
monitoringAlertSystem.addLatencyAlert({
  topic: 'inventory_change',
  thresholdMs: 100, // 延迟阈值(ms)
  windowSize: 60000, // 统计窗口(ms)
  alertChannels: ['email'],
});
```

## 🛠️ 故障排除

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

2. **消息处理延迟过高**

   ```bash
   # 检查系统资源
   top -p $(pgrep node)

   # 查看处理统计
   const stats = enhancedRealTimeService.getProcessingStats();
   console.log('处理统计:', stats);
   ```

3. **消息堆积**
   ```bash
   # 查看队列状态
   const queueStats = await messageQueueManager.getQueueStats('price_update');
   console.log('队列状态:', queueStats);
   ```

### 监控命令

```bash
# 查看活跃告警
curl http://localhost:3001/api/data-center/monitoring/alerts

# 获取系统健康状态
curl http://localhost:3001/api/data-center/monitoring/health

# 查看性能指标
curl http://localhost:3001/api/data-center/monitoring/metrics
```

## 📈 性能优化建议

### 1. 批处理优化

- 调整批处理大小以平衡延迟和吞吐量
- 根据业务特点设置合适的等待时间

### 2. 资源调优

- 增加Redis连接池大小
- 调整Node.js内存限制
- 优化垃圾回收策略

### 3. 网络优化

- 使用本地Redis实例减少网络延迟
- 启用连接复用
- 配置合理的超时时间

## 🔄 系统维护

### 日常检查清单

- [ ] 检查消息队列连接状态
- [ ] 监控处理延迟指标
- [ ] 查看活跃告警列表
- [ ] 验证通知渠道工作正常
- [ ] 检查系统资源使用情况

### 定期维护任务

```bash
# 每日 - 检查系统健康
npm run monitor:database

# 每周 - 清理历史数据
node scripts/cleanup-old-events.js

# 每月 - 性能基准测试
node scripts/test-realtime-performance.js
```

## 📞 技术支持

如遇到问题，请提供以下信息：

- 系统版本和配置
- 错误日志和堆栈跟踪
- 性能指标截图
- 重现步骤

---

_文档版本: 1.0_
_最后更新: 2026-02-19_
