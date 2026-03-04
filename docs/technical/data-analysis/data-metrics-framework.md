# 数据分析指标体系设计文档

## 1. 概述

本文档定义了智能体市场的完整数据分析指标体系，涵盖业务指标、用户行为指标、技术指标和财务指标四个核心维度，为数据驱动的决策提供支撑。

## 2. 指标体系架构

### 2.1 指标层级结构

```
数据分析指标体系
├── 一级指标 (战略层) - 高管决策指标
│   ├── 核心业务指标 (KPI)
│   ├── 财务健康指标
│   └── 市场竞争力指标
├── 二级指标 (管理层) - 运营管理指标
│   ├── 用户增长指标
│   ├── 收入质量指标
│   ├── 产品表现指标
│   └── 运营效率指标
└── 三级指标 (执行层) - 日常运营指标
    ├── 用户行为指标
    ├── 技术性能指标
    ├── 转化漏斗指标
    └── 风险监控指标
```

### 2.2 指标分类维度

#### 按业务性质分类

- **增长指标**: 关注用户规模和业务扩张
- **质量指标**: 关注用户体验和产品品质
- **效率指标**: 关注运营效率和资源配置
- **财务指标**: 关注收入和盈利能力

#### 按时间维度分类

- **实时指标**: 秒级更新，用于监控告警
- **准实时指标**: 分钟级更新，用于日常运营
- **日报指标**: 日级聚合，用于趋势分析
- **月报指标**: 月级聚合，用于战略规划

## 3. 核心业务指标 (KPI)

### 3.1 用户规模指标

#### 用户增长指标

```yaml
# 用户总量指标
total_users:
  definition: 平台累计注册用户数
  calculation: COUNT(DISTINCT user_id)
  granularity: 实时
  target: 100,000+

# 活跃用户指标
dau: # 日活跃用户
  definition: 日度活跃用户数
  calculation: COUNT(DISTINCT user_id WHERE last_active_date = today)
  granularity: 日
  target: 15,000+

wau: # 周活跃用户
  definition: 周度活跃用户数
  calculation: COUNT(DISTINCT user_id WHERE last_active_date >= 7_days_ago)
  granularity: 周
  target: 45,000+

mau: # 月活跃用户
  definition: 月度活跃用户数
  calculation: COUNT(DISTINCT user_id WHERE last_active_date >= 30_days_ago)
  granularity: 月
  target: 120,000+

# 用户留存指标
day1_retention:
  definition: 次日留存率
  calculation: 新用户中第二天仍活跃的比例
  granularity: 日
  target: 65%+

day7_retention:
  definition: 7日留存率
  calculation: 新用户中第7天仍活跃的比例
  granularity: 周
  target: 32%+

day30_retention:
  definition: 30日留存率
  calculation: 新用户中第30天仍活跃的比例
  granularity: 月
  target: 18%+
```

#### 用户质量指标

```yaml
# 用户价值指标
arpu: # 平均每用户收入
  definition: 平均每用户产生的收入
  calculation: 总收入 / 活跃用户数
  granularity: 月
  target: ¥8.33+

ltv: # 用户生命周期价值
  definition: 单个用户在整个生命周期内的总价值
  calculation: ARPU × 用户生命周期(月)
  granularity: 月
  target: ¥250+

# 用户参与度指标
avg_session_duration:
  definition: 平均会话时长
  calculation: 总会话时长 / 会话次数
  granularity: 日
  target: 456秒

avg_pages_per_session:
  definition: 平均每次会话浏览页面数
  calculation: 总页面浏览量 / 会话次数
  granularity: 日
  target: 3.2页

feature_adoption_rate:
  definition: 核心功能采用率
  calculation: 使用特定功能的用户数 / 总用户数
  granularity: 月
  target: 75%+
```

### 3.2 交易与收入指标

#### 交易规模指标

```yaml
# 交易量指标
gmv: # 总交易额
  definition: 平台总交易金额
  calculation: SUM(订单金额)
  granularity: 实时
  target: ¥1,250,000+/月

order_volume: # 订单量
  definition: 平台总订单数量
  calculation: COUNT(订单)
  granularity: 实时
  target: 342+/日

# 转化效率指标
conversion_rate:
  definition: 访问到购买的转化率
  calculation: 订单数 / 访问用户数
  granularity: 日
  target: 3.5%+

cart_to_order_rate:
  definition: 购物车到订单转化率
  calculation: 完成订单数 / 加入购物车数
  granularity: 日
  target: 23%+

checkout_completion_rate:
  definition: 结账流程完成率
  calculation: 成功支付订单数 / 开始结账数
  granularity: 日
  target: 85%+
```

#### 收入质量指标

```yaml
# 收入结构指标
revenue_breakdown:
  subscription_revenue: 订阅收入占比
  transaction_fee: 交易手续费收入占比
  advertising_revenue: 广告收入占比
  premium_features: 高级功能收入占比

# 收入增长指标
revenue_growth_rate:
  definition: 收入同比增长率
  calculation: (本期收入 - 同期收入) / 同期收入
  granularity: 月
  target: 25%+

monthly_recurring_revenue:
  definition: 月经常性收入
  calculation: 当前月订阅收入 + 预期续订收入
  granularity: 月
  target: ¥98,000+
```

### 3.3 产品表现指标

#### 智能体市场指标

```yaml
# 智能体生态指标
total_agents:
  definition: 平台智能体总数
  calculation: COUNT(智能体)
  granularity: 实时
  target: 2,000+

active_agents:
  definition: 活跃智能体数(30天内有使用)
  calculation: COUNT(智能体 WHERE last_used >= 30_days_ago)
  granularity: 日
  target: 1,250+

agent_installations:
  definition: 智能体安装总量
  calculation: SUM(安装次数)
  granularity: 实时
  target: 89,500+

# 智能体质量指标
avg_agent_rating:
  definition: 智能体平均评分
  calculation: AVG(用户评分)
  granularity: 日
  target: 4.3+

agent_utilization_rate:
  definition: 智能体使用率
  calculation: 活跃智能体数 / 总智能体数
  granularity: 日
  target: 62.5%+

developer_satisfaction:
  definition: 开发者满意度
  calculation: 开发者调研平均分
  granularity: 季度
  target: 4.5+/5.0
```

#### Token经济指标

```yaml
# Token消耗指标
total_token_consumption:
  definition: 平台Token总消耗量
  calculation: SUM(Token使用量)
  granularity: 实时
  target: 1,250,000+

daily_token_consumption:
  definition: 日Token消耗量
  calculation: SUM(当日Token使用量)
  granularity: 日
  target: 45,000+

# Token经济健康度
token_velocity:
  definition: Token流通速度
  calculation: 总消耗量 / 平均Token持有量
  granularity: 月
  target: 2.5+

token_holders_distribution:
  definition: Token持有者分布
  calculation: 不同持有量区间用户占比
  granularity: 月
  target: 健康分布
```

## 4. 用户行为分析指标

### 4.1 用户旅程指标

#### 获客与激活

```yaml
# 流量获取指标
traffic_sources:
  organic_search: 自然搜索流量占比
  direct_traffic: 直接访问流量占比
  referral: 引荐流量占比
  social_media: 社交媒体流量占比
  paid_ads: 付费广告流量占比

# 新用户激活指标
new_user_activation_rate:
  definition: 新用户完成核心行为的比例
  calculation: 完成激活行为的新用户数 / 新用户总数
  granularity: 日
  target: 70%+

activation_events:
  - 完成个人资料设置
  - 首次浏览智能体市场
  - 安装第一个智能体
  - 完成首次购买
```

#### 用户参与指标

```yaml
# 核心行为指标
core_actions:
  search_usage: 搜索功能使用率
  agent_installation: 智能体安装率
  purchase_frequency: 购买频次
  review_participation: 评价参与率

# 功能使用深度
feature_engagement:
  marketplace_browsing: 市场浏览时长
  agent_customization: 智能体定制使用率
  team_collaboration: 团队协作功能使用率
  analytics_usage: 数据分析功能使用率
```

### 4.2 用户细分指标

#### 用户画像指标

```yaml
demographics:
  age_distribution: 年龄分布
  gender_ratio: 性别比例
  geographic_distribution: 地域分布
  device_preferences: 设备偏好

behavioral_segments:
  power_users: 高价值用户(>5次/周使用)
  casual_users: 普通用户(1-2次/周使用)
  dormant_users: 沉睡用户(>30天未使用)
  churn_risk: 流失风险用户
```

## 5. 技术性能指标

### 5.1 系统稳定性指标

#### 可用性指标

```yaml
system_availability:
  definition: 系统正常运行时间占比
  calculation: (总时间 - 停机时间) / 总时间
  granularity: 月
  target: 99.9%+

uptime_sla:
  definition: SLA达标率
  calculation: 达标时间 / 总时间
  granularity: 月
  target: 99.5%+

mttr: # 平均修复时间
  definition: 故障平均修复时间
  calculation: SUM(修复时间) / 故障次数
  granularity: 月
  target: <30分钟
```

#### 性能指标

```yaml
response_time:
  api_response_time: API平均响应时间
  page_load_time: 页面加载时间
  database_query_time: 数据库查询时间

throughput:
  qps: 每秒查询数
  tps: 每秒事务数
  concurrent_users: 并发用户数

resource_utilization:
  cpu_utilization: CPU使用率
  memory_utilization: 内存使用率
  disk_io_utilization: 磁盘IO使用率
  network_utilization: 网络带宽使用率
```

### 5.2 质量保证指标

#### 错误与缺陷指标

```yaml
error_rates:
  overall_error_rate: 总体错误率
  server_error_rate: 服务器错误率(5xx)
  client_error_rate: 客户端错误率(4xx)
  js_error_rate: 前端JavaScript错误率

quality_metrics:
  bug_density: 缺陷密度(每千行代码缺陷数)
  test_coverage: 测试覆盖率
  deployment_frequency: 部署频率
  change_failure_rate: 变更失败率
```

## 6. 财务分析指标

### 6.1 收入分析指标

#### 收入构成分析

```yaml
revenue_streams:
  agent_sales: 智能体销售收入
  subscription_fees: 订阅费用收入
  token_sales: Token销售收
```
