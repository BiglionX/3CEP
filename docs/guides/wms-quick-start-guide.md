# 海外仓智能管理系统快速启动指南

## 🚀 快速开始

### 1. 环境准备

确保已安装以下软件：

- Node.js 18+
- npm 或 yarn
- Supabase CLI

### 2. 环境变量配置

在项目根目录创建 `.env.local` 文件：

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. 一键部署

**Windows 用户:**

```cmd
deploy-wms-system.bat
```

**Linux/Mac 用户:**

```bash
chmod +x deploy-wms-system.sh
./deploy-wms-system.sh
```

### 4. 系统验证

```bash
# 运行集成测试
node scripts/test-wms-integration.js

# 检查API状态
curl http://localhost:3001/api/wms/inventory?action=status
```

## 📋 核心功能使用

### 添加 WMS 连接

```bash
curl -X POST http://localhost:3001/api/wms/connections \
  -H "Content-Type: application/json" \
  -d '{
    "name": "美国洛杉矶仓",
    "provider": "goodcang",
    "warehouseId": "US-LAX",
    "baseUrl": "https://api.goodcang.com",
    "clientId": "your_client_id",
    "clientSecret": "your_client_secret"
  }'
```

### 执行库存同步

```bash
# 手动同步单个仓库
curl -X POST http://localhost:3001/api/wms/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "connectionId": "your_connection_id",
    "action": "sync"
  }'

# 批量同步所有仓库
curl -X POST http://localhost:3001/api/wms/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "action": "bulk-sync"
  }'
```

### 查看库存数据

```bash
# 获取所有库存
curl http://localhost:3001/api/wms/inventory

# 获取特定仓库库存
curl "http://localhost:3001/api/wms/inventory?connectionId=your_connection_id"

# 获取库存统计
curl "http://localhost:3001/api/wms/inventory?action=statistics"
```

### 监控系统状态

```bash
# 查看同步任务状态
curl "http://localhost:3001/api/wms/inventory?action=status"

# 获取库存预警
curl "http://localhost:3001/api/wms/inventory?action=alerts&threshold=10"

# 查看准确性报告
curl "http://localhost:3001/api/wms/inventory?action=accuracy"
```

## ⚙️ 系统配置

### 修改同步频率

```bash
curl -X PUT http://localhost:3001/api/wms/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "syncFrequency": 10
  }'
```

### 调整预警阈值

```bash
curl -X PUT http://localhost:3001/api/wms/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "alertThreshold": 5
  }'
```

## 🛠️ 管理命令

### 启动/停止定时任务

```bash
# 启动定时同步
curl -X POST http://localhost:3001/api/wms/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "action": "start-scheduler"
  }'

# 停止定时同步
curl -X POST http://localhost:3001/api/wms/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "action": "stop-scheduler"
  }'
```

### 系统维护

```bash
# 清理历史记录（保留90天）
node -e "
const { inventoryMapper } = require('./src/lib/warehouse/inventory-mapper');
inventoryMapper.cleanupHistoryRecords(90).then(count => {
  console.log(\`清理了 \${count} 条历史记录\`);
});
"

# 手动触发准确性检查
node -e "
const { accuracyMonitor } = require('./src/lib/warehouse/accuracy-monitor');
accuracyMonitor.triggerManualCheck().then(report => {
  console.log(\`准确性检查完成，准确率: \${report.accuracyRate}%\`);
});
"
```

## 📊 监控面板

### 实时监控指标

- **同步状态**: 成功/失败次数统计
- **库存准确率**: 实时准确率监控
- **低库存预警**: 自动预警通知
- **系统健康度**: 连接状态和响应时间

### 告警机制

系统会在以下情况下自动发送告警：

- 库存同步失败
- 库存准确率低于阈值
- 发现高差异商品
- 系统连接异常

## 🔧 故障排除

### 常见问题

1. **连接失败**
   - 检查网络连接
   - 验证 API 凭证
   - 确认 WMS 服务状态

2. **同步超时**
   - 检查网络延迟
   - 调整超时设置
   - 减少批量处理大小

3. **数据不一致**
   - 执行手动同步
   - 检查 SKU 映射关系
   - 运行准确性检查

### 日志查看

```bash
# 查看系统日志
tail -f logs/system.log

# 查看错误日志
tail -f logs/error.log

# 查看同步日志
tail -f logs/sync.log
```

## 📞 技术支持

如遇到问题，请提供以下信息：

- 完整的错误日志
- 系统环境信息
- 操作步骤复现
- 相关配置截图

---

_文档版本: 1.0_  
_最后更新: 2026 年 2 月 19 日_
