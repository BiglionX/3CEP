# 采购智能体升级模块 (Procurement Intelligence Upgrade Module)

## 概述

这是FixCycle 4.0项目中的采购智能体升级模块，旨在将现有的B2B采购功能升级为具备国际化的智能采购决策系统。

## 模块结构

```
src/modules/procurement-intelligence/
├── core/                           # 核心引擎
│   ├── decision-engine/           # 智能决策引擎
│   ├── risk-analyzer/             # 风险分析器
│   └── optimization-engine/       # 优化引擎
├── integrations/                  # 集成适配器
│   ├── foreign-trade-adapter/     # 外贸模块适配器
│   ├── market-data-adapter/       # 市场数据适配器
│   └── supplier-adapter/          # 供应商数据适配器
├── services/                      # 扩展服务
│   ├── supplier-profiling/        # 供应商画像服务
│   ├── market-intelligence/       # 市场情报服务
│   ├── contract-advisor/          # 合同顾问服务
│   └── procurement-analytics/     # 采购分析服务
├── ui-components/                 # 前端组件
│   ├── intelligence-dashboard/    # 智能仪表板
│   ├── supplier-insights/         # 供应商洞察
│   ├── market-analytics/          # 市场分析
│   └── risk-monitoring/           # 风险监控
├── models/                        # 数据模型
├── types/                         # TypeScript类型定义
├── constants/                     # 常量定义
├── utils/                         # 工具函数
├── index.ts                       # 模块入口文件
├── package.json                   # 包配置文件
└── tsconfig.json                  # TypeScript配置
```

## 核心功能

### 1. 智能供应商画像系统

- 多维度供应商能力评估
- 风险等级智能识别
- 合规状态实时监控

### 2. 国际市场价格情报

- 实时价格指数跟踪
- 价格趋势分析预测
- 多币种汇率转换

### 3. 智能采购决策引擎

- 自动化供应商匹配
- 价格优化建议
- 风险预警机制

### 4. 合同智能顾问

- 条款自动推荐
- 风险条款识别
- 谈判策略生成

## 开发指南

### 安装依赖

```bash
npm install
```

### 编译构建

```bash
npm run build
```

### 运行测试

```bash
npm test
```

### 代码检查

```bash
npm run lint
npm run lint:fix
```

## API端点

主要API端点包括：

- `/api/procurement-intelligence/supplier-profiling` - 供应商画像
- `/api/procurement-intelligence/market-intelligence` - 市场情报
- `/api/procurement-intelligence/risk-analysis` - 风险分析
- `/api/procurement-intelligence/decision-engine` - 决策引擎
- `/api/procurement-intelligence/price-optimization` - 价格优化

## 数据库表结构

模块涉及的主要数据表：

- `supplier_intelligence_profiles` - 供应商智能画像
- `international_price_indices` - 国际价格指数
- `procurement_decision_records` - 采购决策记录
- `smart_procurement_requests` - 智能采购请求

## 配置要求

确保环境变量已正确配置：

- `DATABASE_URL` - 数据库连接字符串
- `SUPABASE_URL` - Supabase项目URL
- `SUPABASE_SERVICE_KEY` - Supabase服务密钥

## 版本信息

- 当前版本: 1.0.0
- 适用项目: FixCycle 4.0
- 开发团队: FixCycle Team
