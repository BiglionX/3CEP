# 数据质量监控系统使用指南

## 系统概述

数据质量监控系统是一个完整的企业级解决方案，用于自动检测、监控和报告数据质量问题。系统提供了丰富的检查类型、灵活的配置选项、智能的定时任务调度以及完善的告警通知机制。

## 核心功能

### 1. 数据质量检查类型

系统支持 10 种常见的数据质量问题检测：

- **空值检查** (`missing_value`) - 检测字段为空或 NULL 的情况
- **格式验证** (`invalid_format`) - 验证数据格式是否符合规范（如邮箱、电话等）
- **数值范围检查** (`out_of_range`) - 检查数值是否在合理范围内
- **重复记录检查** (`duplicate_record`) - 发现重复的数据记录
- **数据一致性检查** (`inconsistent_data`) - 检测数据间的逻辑一致性
- **数据新鲜度检查** (`stale_data`) - 检查数据是否及时更新
- **引用完整性检查** (`referential_integrity`) - 验证外键关系
- **业务规则检查** (`business_rule_violation`) - 检查业务逻辑规则
- **模式验证** (`schema_violation`) - 验证数据结构符合预期
- **唯一性检查** (`uniqueness_violation`) - 确保关键字段的唯一性

### 2. 预设检查规则

系统包含 5 个开箱即用的检查规则：

```javascript
// 配件信息完整性检查
{
  id: 'parts_completeness_check',
  name: '配件信息完整性检查',
  tableName: 'parts',
  columnName: 'part_name',
  checkType: 'missing_value',
  threshold: 1.0,
  severity: 'high'
}

// 价格范围合理性检查
{
  id: 'price_range_check',
  name: '价格范围合理性检查',
  tableName: 'parts',
  columnName: 'price',
  checkType: 'out_of_range',
  parameters: { min: 0, max: 100000 },
  threshold: 0.5,
  severity: 'medium'
}
```

## API 使用示例

### 1. 生成数据质量报告

```bash
# 获取整体质量报告
curl "http://localhost:3000/api/data-quality?action=report"

# 响应示例
{
  "summary": {
    "overallScore": 85,
    "totalTables": 4,
    "totalChecks": 5,
    "passedChecks": 4,
    "failedChecks": 1,
    "warningChecks": 0
  },
  "details": [...],
  "recommendations": [
    "存在 1 个严重数据质量问题，需要立即处理",
    "建议完善数据录入验证，减少空值产生"
  ]
}
```

### 2. 管理检查规则

```bash
# 获取所有检查规则
curl "http://localhost:3000/api/data-quality?action=rules"

# 添加新的检查规则
curl -X POST "http://localhost:3000/api/data-quality" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add-rule",
    "rule": {
      "id": "customer_phone_validation",
      "name": "客户电话号码验证",
      "tableName": "customers",
      "columnName": "phone",
      "checkType": "invalid_format",
      "parameters": {
        "pattern": "^1[3-9]\\d{9}$"
      },
      "threshold": 2.0,
      "severity": "medium"
    }
  }'

# 更新现有规则
curl -X POST "http://localhost:3000/api/data-quality" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "update-rule",
    "ruleId": "customer_phone_validation",
    "updates": {
      "threshold": 1.0,
      "severity": "high"
    }
  }'
```

### 3. 执行检查操作

```bash
# 执行特定检查
curl -X POST "http://localhost:3000/api/data-quality" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "run-check",
    "ruleId": "parts_completeness_check"
  }'

# 执行所有检查
curl -X POST "http://localhost:3000/api/data-quality" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "run-all-checks"
  }'

# 执行特定表的检查
curl -X POST "http://localhost:3000/api/data-quality" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "run-table-checks",
    "tableName": "orders"
  }'
```

### 4. 使用质量看板

```bash
# 获取概览看板
curl "http://localhost:3000/api/data-quality/dashboard?action=overview"

# 获取详细看板
curl "http://localhost:3000/api/data-quality/dashboard?action=details"

# 获取趋势分析
curl "http://localhost:3000/api/data-quality/dashboard?action=trends"

# 获取告警信息
curl "http://localhost:3000/api/data-quality/dashboard?action=alerts"

# 刷新看板数据
curl -X POST "http://localhost:3000/api/data-quality/dashboard" \
  -H "Content-Type: application/json" \
  -d '{"action": "refresh"}'
```

## 定时任务管理

### 1. 预设定时任务

系统包含 3 个默认的定时任务：

```javascript
// 每日全面检查 (每天凌晨2点)
{
  id: 'daily_quality_check',
  name: '每日数据质量全面检查',
  schedule: '0 2 * * *',
  description: '执行所有启用的数据质量检查规则'
}

// 小时关键检查 (每小时)
{
  id: 'hourly_critical_check',
  name: '关键数据质量小时检查',
  schedule: '0 * * * *',
  description: '检查关键业务数据的质量状况'
}

// 周详细报告 (每周一凌晨3点)
{
  id: 'weekly_detailed_report',
  name: '周数据质量详细报告',
  schedule: '0 3 * * 1',
  description: '生成详细的数据质量分析报告'
}
```

### 2. 管理定时任务

```bash
# 添加自定义定时任务
curl -X POST "http://localhost:3000/api/data-quality/cron" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add-job",
    "job": {
      "id": "monthly_compliance_check",
      "name": "月度合规性检查",
      "schedule": "0 1 1 * *",
      "enabled": true,
      "description": "每月初执行数据合规性全面检查",
      "parameters": {
        "checkCompliance": true,
        "generateReport": true
      }
    }
  }'

# 手动触发任务
curl -X POST "http://localhost:3000/api/data-quality/cron" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "trigger-job",
    "jobId": "daily_quality_check"
  }'
```

## 告警配置

### 1. 告警规则设置

```javascript
// 配置数据质量告警规则
const alertRule = {
  id: 'data_quality_threshold',
  name: '数据质量评分过低',
  metric: 'data_quality_overall_score',
  condition: 'below',
  threshold: 80,
  duration: 300, // 5分钟内持续低于阈值
  severity: 'warning',
  enabled: true,
  notifications: ['console', 'email', 'slack'],
  description: '当整体数据质量评分低于80%时触发告警'
};

// 通过API添加告警规则
curl -X POST "http://localhost:3000/api/data-center/monitoring" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add-alert-rule",
    "alert": {
      "id": "data_quality_threshold",
      "name": "数据质量评分过低",
      "metric": "data_quality_overall_score",
      "condition": "below",
      "threshold": 80,
      "duration": 300,
      "severity": "warning",
      "enabled": true,
      "notifications": ["console", "email"]
    }
  }'
```

### 2. 告警通知渠道

支持多种通知方式：

- 控制台输出 (`console`)
- 电子邮件 (`email`)
- Slack 通知 (`slack`)
- Webhook 回调 (`webhook`)
- 短信通知 (`sms`)
- PagerDuty 集成 (`pagerduty`)

## 配置最佳实践

### 1. 检查规则配置建议

```javascript
// 高优先级检查规则
const criticalRules = [
  {
    // 主键唯一性检查
    checkType: "uniqueness_violation",
    threshold: 0.0, // 不允许任何重复
    severity: "critical",
  },
  {
    // 必填字段完整性检查
    checkType: "missing_value",
    threshold: 0.1, // 空值率不超过0.1%
    severity: "high",
  },
];

// 中优先级检查规则
const mediumRules = [
  {
    // 业务规则检查
    checkType: "business_rule_violation",
    threshold: 1.0, // 违规率不超过1%
    severity: "medium",
  },
  {
    // 格式验证检查
    checkType: "invalid_format",
    threshold: 0.5, // 格式错误率不超过0.5%
    severity: "medium",
  },
];
```

### 2. 定时任务调度建议

```javascript
// 推荐的时间安排
const recommendedSchedule = {
  // 核心业务数据 - 高频检查
  criticalData: "*/15 * * * *", // 每15分钟

  // 重要业务数据 - 中频检查
  importantData: "0 * * * *", // 每小时

  // 一般业务数据 - 低频检查
  generalData: "0 2 * * *", // 每天凌晨2点

  // 详细报告生成
  detailedReports: "0 3 * * 1", // 每周一凌晨3点

  // 月度汇总报告
  monthlyReports: "0 4 1 * *", // 每月1日凌晨4点
};
```

## 监控和维护

### 1. 系统健康检查

```bash
# 检查数据质量服务状态
curl "http://localhost:3000/api/data-quality?action=health"

# 检查定时任务运行状态
curl "http://localhost:3000/api/data-quality/cron?action=status"

# 获取系统统计信息
curl "http://localhost:3000/api/data-center/monitoring?action=stats"
```

### 2. 性能优化建议

1. **合理设置采样率**：对于大数据表，可以设置采样率来平衡准确性与性能
2. **优化检查顺序**：将快速检查放在前面，耗时检查放在后面
3. **批量执行**：对相关的检查规则进行批量执行
4. **缓存策略**：对频繁访问但不常变化的数据进行缓存

### 3. 故障排除

常见问题及解决方案：

```javascript
// 1. 检查执行超时
// 解决方案：增加执行超时时间或优化SQL查询

// 2. 告警频繁触发
// 解决方案：调整阈值或增加持续时间要求

// 3. 内存使用过高
// 解决方案：减少历史数据保留时间或增加内存清理频率

// 4. 数据库连接问题
// 解决方案：检查数据库连接配置和网络连通性
```

## 集成示例

### 1. 与现有应用集成

```javascript
// 在应用程序中集成数据质量检查
import { dataQualityService } from "@/data-center/monitoring/data-quality-service";

class OrderService {
  async createOrder(orderData) {
    // 业务逻辑处理
    const order = await this.saveOrder(orderData);

    // 数据质量检查
    await dataQualityService.executeCheckRule("order_data_validation");

    return order;
  }
}
```

### 2. 与 CI/CD 流水线集成

```yaml
# GitHub Actions 示例
name: Data Quality Check
on:
  schedule:
    - cron: "0 2 * * *" # 每天凌晨2点执行
  workflow_dispatch: # 手动触发

jobs:
  data-quality-check:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Run data quality checks
        run: |
          curl -X POST "https://your-app.com/api/data-quality" \
            -H "Content-Type: application/json" \
            -d '{"action": "run-all-checks"}'

      - name: Send notification on failure
        if: failure()
        run: |
          curl -X POST "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK" \
            -H "Content-Type: application/json" \
            -d '{"text": "🚨 数据质量检查失败，请及时处理！"}'
```

这个数据质量监控系统提供了完整的企业级解决方案，能够有效保障数据质量和业务连续性。
