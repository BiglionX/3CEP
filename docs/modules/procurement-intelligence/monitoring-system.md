# 采购智能体监控体系配置

## 项目概述

为采购智能体系统搭建完整的监控告警体系，包括系统指标监控、业务指标监控、告警通知等功能。

## 监控架构

### 1. 数据采集层

- **应用指标**: 通过API暴露Prometheus格式指标
- **系统指标**: CPU、内存、磁盘、网络等系统资源
- **业务指标**: 供应商匹配成功率、价格优化效果、决策准确性等
- **第三方服务**: 数据库连接、外部API调用等

### 2. 存储层

- **时序数据库**: Prometheus用于存储监控指标
- **日志存储**: Elasticsearch用于存储应用日志
- **告警存储**: Alertmanager用于告警事件管理

### 3. 展示层

- **监控仪表板**: Grafana提供可视化界面
- **自定义仪表板**: 采购智能体专用监控面板
- **移动端监控**: 关键指标推送通知

## 配置文件

### prometheus-procurement.yml

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - 'procurement-alert-rules.yml'

scrape_configs:
  # 采购智能体应用监控
  - job_name: 'procurement-intelligence'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/procurement-intelligence/metrics'
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
      - source_labels: [job]
        target_label: service
        replacement: 'procurement-intelligence'

  # 供应商画像服务
  - job_name: 'supplier-profiling'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/procurement-intelligence/suppliers/metrics'
    relabel_configs:
      - target_label: service
        replacement: 'supplier-profiling'

  # 市场情报服务
  - job_name: 'market-intelligence'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/procurement-intelligence/market/metrics'
    relabel_configs:
      - target_label: service
        replacement: 'market-intelligence'

  # 风险分析服务
  - job_name: 'risk-analysis'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/procurement-intelligence/risk/metrics'
    relabel_configs:
      - target_label: service
        replacement: 'risk-analysis'

  # 决策引擎服务
  - job_name: 'decision-engine'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/procurement-intelligence/decisions/metrics'
    relabel_configs:
      - target_label: service
        replacement: 'decision-engine'

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - localhost:9093
      scheme: http
      timeout: 10s
```

### procurement-alert-rules.yml

```yaml
groups:
  - name: procurement-intelligence.rules
    rules:
      # 系统健康度告警
      - alert: ProcurementServiceDown
        expr: up{job=~"procurement.*"} == 0
        for: 1m
        labels:
          severity: critical
          service: procurement-intelligence
        annotations:
          summary: '采购智能体服务不可用'
          description: '{{ $labels.instance }} 上的 {{ $labels.job }} 服务已停止响应'

      - alert: HighCPUUsage
        expr: rate(procurement_cpu_usage_percent[5m]) > 85
        for: 2m
        labels:
          severity: warning
          service: procurement-intelligence
        annotations:
          summary: 'CPU使用率过高'
          description: '{{ $labels.instance }} CPU使用率超过85% (当前: {{ $value }}%)'

      - alert: HighMemoryUsage
        expr: procurement_memory_usage_percent > 85
        for: 2m
        labels:
          severity: warning
          service: procurement-intelligence
        annotations:
          summary: '内存使用率过高'
          description: '{{ $labels.instance }} 内存使用率超过85% (当前: {{ $value }}%)'

      # 业务指标告警
      - alert: LowSupplierMatchingAccuracy
        expr: procurement_supplier_matching_accuracy < 0.8
        for: 5m
        labels:
          severity: warning
          service: procurement-intelligence
          category: business
        annotations:
          summary: '供应商匹配准确率偏低'
          description: '供应商智能匹配准确率低于80% (当前: {{ $value }}%)'

      - alert: PriceOptimizationFailure
        expr: procurement_price_optimization_success_rate < 0.9
        for: 5m
        labels:
          severity: warning
          service: procurement-intelligence
          category: business
        annotations:
          summary: '价格优化成功率偏低'
          description: '采购价格优化成功率低于90% (当前: {{ $value }}%)'

      - alert: DecisionEngineSlow
        expr: procurement_decision_engine_response_time_seconds > 2
        for: 2m
        labels:
          severity: warning
          service: procurement-intelligence
          category: performance
        annotations:
          summary: '决策引擎响应缓慢'
          description: '采购决策引擎平均响应时间超过2秒 (当前: {{ $value }}s)'

      - alert: RiskAssessmentErrorRate
        expr: procurement_risk_assessment_error_rate > 0.05
        for: 3m
        labels:
          severity: critical
          service: procurement-intelligence
          category: business
        annotations:
          summary: '风险评估错误率过高'
          description: '供应商风险评估错误率超过5% (当前: {{ $value }}%)'

      # 数据质量告警
      - alert: SupplierDataQualityLow
        expr: procurement_supplier_data_quality_score < 0.7
        for: 10m
        labels:
          severity: warning
          service: procurement-intelligence
          category: data-quality
        annotations:
          summary: '供应商数据质量偏低'
          description: '供应商画像数据质量评分低于0.7 (当前: {{ $value }})'

      - alert: MarketDataStale
        expr: time() - procurement_market_data_last_updated_timestamp > 3600
        for: 5m
        labels:
          severity: warning
          service: procurement-intelligence
          category: data-quality
        annotations:
          summary: '市场数据过期'
          description: '国际市场价格数据超过1小时未更新'

      # 集成服务告警
      - alert: ExternalAPIUnavailable
        expr: procurement_external_api_availability < 0.95
        for: 3m
        labels:
          severity: critical
          service: procurement-intelligence
          category: integration
        annotations:
          summary: '外部API不可用'
          description: '外部数据源API可用性低于95% (当前: {{ $value }}%)'

      # 容量规划告警
      - alert: HighDatabaseConnectionUsage
        expr: procurement_database_connection_pool_usage > 0.8
        for: 3m
        labels:
          severity: warning
          service: procurement-intelligence
          category: capacity
        annotations:
          summary: '数据库连接池使用率过高'
          description: '数据库连接池使用率超过80% (当前: {{ $value }}%)'

      - alert: CacheHitRateLow
        expr: procurement_cache_hit_rate < 0.7
        for: 5m
        labels:
          severity: warning
          service: procurement-intelligence
          category: performance
        annotations:
          summary: '缓存命中率偏低'
          description: '系统缓存命中率低于70% (当前: {{ $value }}%)'
```

### grafana-procurement-dashboard.json

```json
{
  "dashboard": {
    "id": null,
    "title": "采购智能体监控仪表板",
    "timezone": "browser",
    "schemaVersion": 36,
    "version": 1,
    "refresh": "30s",
    "panels": [
      {
        "id": 1,
        "type": "stat",
        "title": "系统健康度",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "procurement_system_health_score",
            "legendFormat": "健康度"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "percent",
            "thresholds": {
              "mode": "absolute",
              "steps": [
                { "color": "red", "value": null },
                { "color": "orange", "value": 70 },
                { "color": "green", "value": 90 }
              ]
            }
          }
        }
      },
      {
        "id": 2,
        "type": "graph",
        "title": "核心业务指标",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "procurement_supplier_matching_accuracy",
            "legendFormat": "供应商匹配准确率"
          },
          {
            "expr": "procurement_price_optimization_success_rate",
            "legendFormat": "价格优化成功率"
          },
          {
            "expr": "procurement_decision_accuracy",
            "legendFormat": "决策准确率"
          }
        ]
      },
      {
        "id": 3,
        "type": "graph",
        "title": "系统性能",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "procurement_cpu_usage_percent",
            "legendFormat": "CPU使用率"
          },
          {
            "expr": "procurement_memory_usage_percent",
            "legendFormat": "内存使用率"
          },
          {
            "expr": "procurement_disk_usage_percent",
            "legendFormat": "磁盘使用率"
          }
        ]
      },
      {
        "id": 4,
        "type": "table",
        "title": "活跃告警",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "ALERTS{alertstate=\"firing\",service=\"procurement-intelligence\"}",
            "format": "table"
          }
        ]
      }
    ]
  }
}
```

## 部署脚本

### deploy-monitoring.sh

```bash
#!/bin/bash

echo "🚀 部署采购智能体监控体系..."

# 创建监控配置目录
mkdir -p config/monitoring/procurement

# 复制配置文件
cp config/monitoring/prometheus-procurement.yml /etc/prometheus/
cp config/monitoring/procurement-alert-rules.yml /etc/prometheus/rules/
cp config/monitoring/grafana-procurement-dashboard.json /var/lib/grafana/dashboards/

# 重启监控服务
systemctl restart prometheus
systemctl restart grafana-server

# 验证部署
echo "🔍 验证监控部署..."
curl -s http://localhost:9090/api/v1/targets | grep procurement
curl -s http://localhost:3000/api/procurement-intelligence/metrics

echo "✅ 监控体系部署完成！"
```

## 关键监控指标

### 系统指标

- CPU使用率
- 内存使用率
- 磁盘IO
- 网络流量
- 数据库连接数
- 缓存命中率

### 业务指标

- 供应商匹配准确率
- 价格优化成功率
- 决策引擎响应时间
- 风险评估准确率
- 市场数据更新频率
- 合同条款推荐相关性

### 质量指标

- 数据完整性
- 算法准确率
- 服务可用性
- 错误率统计
- 用户满意度

## 告警通道配置

### 通知方式

- 邮件通知
- Slack机器人
- 钉钉机器人
- 短信通知
- 电话告警（紧急情况）

### 告警分级

- **Info**: 一般信息提醒
- **Warning**: 需要关注的问题
- **Critical**: 需要立即处理的故障
- **Emergency**: 系统瘫痪级别的紧急情况

## 维护计划

### 日常维护

- 每日检查告警状态
- 每周审查监控指标趋势
- 每月优化告警规则

### 定期优化

- 根据业务变化调整监控指标
- 优化告警阈值设置
- 更新仪表板布局和显示内容

### 故障演练

- 定期模拟系统故障
- 验证告警通知有效性
- 测试应急响应流程
