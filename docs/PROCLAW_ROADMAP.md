# 🗺️ Proclaw 项目路线图 (Roadmap)

> 可视化展示从概念到发布的完整路径

---

## 📅 时间轴总览

```
2026 Q2 (4-6月)          2026 Q3 (7-9月)          2026 Q4 (10-12月)
├───────────────────────┼────────────────────────┼───────────────────────┤
│                       │                        │                       │
│  Phase 0: 技术验证     │  Phase 2: 技能商店      │  Phase 3: 智能体编排   │
│  ████████             │  ████████              │  ████████████         │
│  Week 1-4             │  Week 13-18            │  Week 19-26           │
│                       │                        │                       │
│  Phase 1: MVP 开发     │                        │  🚀 v1.0 正式发布      │
│  ████████████████     │                        │  █████                │
│  Week 5-12            │                        │  Week 27-28           │
│                       │                        │                       │
└───────────────────────┴────────────────────────┴───────────────────────┘
```

---

## 🎯 Phase 0: 技术验证原型 (Week 1-4)

**目标**: 验证 Tauri + Supabase + SQLite 技术栈可行性

### Week 1: Tauri 环境搭建

```
Day 1-2: Rust 工具链安装
  ├── ✅ rustc 1.75+ 安装
  ├── ✅ Cargo 配置国内镜像
  └── ✅ 验证编译环境

Day 3-4: Tauri 项目初始化
  ├── ✅ create-tauri-app 生成骨架
  ├── ✅ React + TypeScript + Vite 集成
  └── ✅ Hello World 窗口运行

Day 5: UI 框架集成
  ├── ✅ MUI 组件库安装
  ├── ✅ Tailwind CSS 配置
  └── ✅ 基础布局框架 (Sidebar + TopBar)
```

**交付物**:

- [x] 可运行的空白窗口应用
- [x] 项目基础结构
- [x] 开发文档 Week 1 总结

---

### Week 2: Supabase 集成

```
Day 6-7: Supabase 项目配置
  ├── ✅ 创建 Supabase 项目
  ├── ✅ 获取 API Key 和 URL
  └── ✅ 配置环境变量

Day 8-9: 用户认证实现
  ├── ✅ 邮箱密码登录
  ├── ✅ OAuth 登录 (GitHub/Google)
  └── ✅ 登录状态持久化

Day 10: Realtime 测试
  ├── ✅ 订阅产品表变更
  ├── ✅ 实时接收事件
  └── ✅ RLS 策略验证
```

**交付物**:

- [x] 登录页面可用
- [x] 用户可以成功登录/登出
- [x] Realtime 订阅工作正常
- [x] Week 2 总结文档

---

### Week 3: 本地数据库

```
Day 11-12: SQLite 集成
  ├── ✅ tauri-plugin-sql 安装
  ├── ✅ Drizzle ORM 配置
  └── ✅ Schema 定义

Day 13-14: CRUD 操作实现
  ├── ✅ 创建产品
  ├── ✅ 查询列表
  ├── ✅ 更新信息
  └── ✅ 删除记录

Day 15: 数据加密
  ├── ✅ SQLCipher 编译
  ├── ✅ 加密密钥管理
  └── ✅ 性能测试
```

**交付物**:

- [x] 本地数据库可正常读写
- [x] 数据加密生效
- [x] 性能指标达标 (< 100ms / 1000条)

---

### Week 4: 数据同步

```
Day 16-17: 离线队列实现
  ├── ✅ 操作入队/出队
  ├── ✅ 重试机制
  └── ✅ 队列持久化

Day 18-19: 增量同步引擎
  ├── ✅ 网络状态检测
  ├── ✅ 批量上传
  ├── ✅ 下载远程变更
  └── ✅ 合并到本地

Day 20: 冲突解决
  ├── ✅ Last-Write-Wins 策略
  ├── ✅ 手动合并 UI
  └── ✅ 性能基准测试
```

**交付物**:

- [x] 完整的同步引擎
- [x] 技术验证报告
- [x] Phase 0 总结 PPT

---

## 🚀 Phase 1: MVP 核心功能 (Week 5-12)

**目标**: 发布可用的桌面端 MVP，包含产品库和进销存

### Week 5-6: 经营智能体主界面

```
Sprint 1.1: Dashboard 设计与实现
  ├── 📊 今日概览卡片 (销售额、订单数、库存预警)
  ├── 📈 销售趋势图表 (Recharts)
  ├── 📋 最近活动列表
  └── ⚡ 快捷操作按钮

Sprint 1.2: 导航与主题系统
  ├── 🧭 侧边栏导航优化
  ├── 🎨 亮色/暗色主题切换
  ├── ⌨️ 键盘快捷键支持
  └── 📱 响应式布局
```

**关键页面**:

```
src/pages/
├── Dashboard.tsx          # 经营概览
├── ProductLibrary.tsx     # 产品库
├── Inventory.tsx          # 进销存
└── Settings.tsx           # 设置
```

**验收标准**:

- [ ] 启动时间 < 3秒
- [ ] 页面切换流畅 (60fps)
- [ ] 主题切换无闪烁

---

### Week 7-8: 产品库模块迁移

```
Sprint 1.3: 共享领域层代码
  ├── 📦 创建 @proclaw/shared monorepo 包
  ├── 🔗 迁移 Product、Brand 实体
  ├── 📝 迁移 UseCase 接口
  └── ⚙️ 配置 TypeScript 路径别名

Sprint 1.4: 产品搜索与详情
  ├── 🔍 搜索框 (SKU、名称)
  ├── 🏷️ 筛选器 (品牌、类目)
  ├── 📄 产品列表 (虚拟滚动)
  ├── 🌳 BOM 树形可视化
  └── ✏️ 产品编辑表单
```

**代码复用策略**:

```typescript
// 从 monorepo 共享
import { Product } from '@proclaw/shared/domain/entities';
import { ProductSearchUseCase } from '@proclaw/shared/application/use-cases';

// 桌面端特定实现
import { TauriProductRepository } from './infrastructure/repositories';
```

**验收标准**:

- [ ] 搜索响应时间 < 500ms
- [ ] 支持 10,000+ 产品流畅滚动
- [ ] BOM 展开/折叠动画流畅

---

### Week 9-10: 进销存模块迁移

```
Sprint 1.5: 库存管理
  ├── 📊 库存列表 (MUI DataGrid)
  ├── 📥 入库表单 (支持扫码枪)
  ├── 📤 出库表单
  ├── 📦 批次管理
  └── 📉 库存预警高亮

Sprint 1.6: 报表与通知
  ├── 📈 库存周转率图表
  ├── 📊 出入库统计
  ├── 🔔 系统托盘通知
  ├── 🔊 声音提醒
  └── 📄 导出 Excel/PDF
```

**Tauri 原生功能**:

```typescript
import { sendNotification } from '@tauri-apps/plugin-notification';

sendNotification({
  title: '库存预警',
  body: 'MacBook Pro 库存不足，当前: 5件',
});
```

**验收标准**:

- [ ] 入库/出库操作 < 1秒
- [ ] 支持扫码枪输入
- [ ] 通知及时送达

---

### Week 11-12: 系统集成测试

```
Sprint 1.7: E2E 测试
  ├── 🧪 登录流程测试 (Playwright)
  ├── 🔍 产品搜索测试
  ├── 📥 入库操作测试
  └── 🔄 数据同步测试

Sprint 1.8: 性能优化与 Bug 修复
  ├── ⚡ 启动时间优化
  ├── 💾 内存占用优化
  ├── 🖼️ 图片懒加载
  ├── 🐛 P0/P1 Bug 修复
  └── ✅ 回归测试
```

**MVP 发布检查清单**:

- [ ] 所有 P0/P1 任务完成
- [ ] 通过 QA 测试 (无 Critical Bug)
- [ ] 安装包大小 < 15MB
- [ ] 用户手册编写完成
- [ ] 发布说明 (Release Notes) 编写完成
- [ ] GitHub Release 创建
- [ ] 官网下载页面上线

---

## 🛍️ Phase 2: 技能商店 (Week 13-18)

**目标**: 实现技能安装、运行和管理

### Week 13-14: 技能包规范

```
📐 Skill Manifest Schema 定义
  ├── id, name, version
  ├── permissions (权限声明)
  ├── contributes (贡献点)
  └── configuration (配置项)

📦 技能打包工具开发
  ├── proclaw-skill-cli 命令行工具
  ├── 模板生成器
  └── 验证器 (lint)

📝 开发者文档编写
  ├── 快速开始指南
  ├── API 参考手册
  └── 示例技能代码
```

**Skill Manifest 示例**:

```json
{
  "id": "com.proclaw.skill.finance",
  "name": "财务智能体",
  "version": "1.0.0",
  "permissions": ["database:read", "network:request"],
  "contributes": {
    "agents": [
      {
        "id": "finance-agent",
        "name": "财务助手",
        "entryPoint": "dist/agent.js"
      }
    ]
  }
}
```

---

### Week 15-16: 技能运行时

```
🏃 Web Worker 沙箱实现
  ├── Worker 隔离执行环境
  ├── postMessage 通信协议
  └── 错误捕获与日志

🔐 权限管理系统
  ├── 权限检查中间件
  ├── 网络请求白名单
  └── 数据库访问租户隔离

🔄 技能生命周期管理
  ├── 安装 (install)
  ├── 启用/禁用 (enable/disable)
  ├── 更新 (update)
  └── 卸载 (uninstall)
```

**沙箱隔离架构**:

```
┌─────────────────────────────┐
│   Main Thread (UI)          │
├─────────────────────────────┤
│   Skill Runtime             │
│   ├── Skill A (Worker)      │
│   ├── Skill B (Worker)      │
│   └── Skill C (Worker)      │
├─────────────────────────────┤
│   Permission Manager        │
└─────────────────────────────┘
```

---

### Week 17-18: 技能商店前端

```
🏪 技能市场页面
  ├── 技能列表 (分类、搜索)
  ├── 技能详情页 (截图、评价)
  ├── 安装/卸载按钮
  └── 已安装技能管理

💳 支付集成 (可选)
  ├── 支付宝/微信支付
  ├── 订阅制计费
  └── 开发者分成结算

⭐ 评价系统
  ├── 用户评分
  ├── 评论功能
  └── 举报机制
```

**验收标准**:

- [ ] 至少 5 个官方技能上架
- [ ] 技能安装成功率 > 99%
- [ ] 沙箱隔离有效 (无法越权访问)

---

## 🤖 Phase 3: 智能体编排 (Week 19-26)

**目标**: 实现经营智能体的真正智能化

### Week 19-20: Agent Orchestrator

```
📨 消息总线实现
  ├── AgentMessage 协议定义
  ├── 发布/订阅模式
  └── 广播机制

🎯 事件驱动架构
  ├── 事件监听器注册
  ├── 事件过滤与路由
  └── 异步事件处理

🧠 Dify AI 集成
  ├── 自然语言指令解析
  ├── Intent Recognition
  └── Action Dispatching
```

**智能体通信示例**:

```typescript
// 销售智能体请求库存
orchestrator.dispatch({
  from: 'sales-agent',
  to: 'inventory-agent',
  action: 'checkStock',
  data: { skuCode: 'MBP-2024-M3' },
});

// 库存智能体响应
orchestrator.on('inventory:stockChecked', data => {
  console.log(`Current stock: ${data.quantity}`);
});
```

---

### Week 21-22: 跨模块联动

```
🔗 销售 → 库存联动
  ├── 订单创建自动扣减库存
  ├── 库存不足触发预警
  └── 低库存自动建议补货

🔗 库存 → 采购联动
  ├── 安全库存阈值监控
  ├── 自动生成采购单
  └── 供应商智能推荐

🔗 采购 → 财务联动
  ├── 采购成本自动记账
  ├── 应付账款管理
  └── 现金流预测

⚙️ 规则引擎开发
  ├── IF-THEN 规则定义
  ├── 规则优先级
  └── 规则冲突检测
```

**规则示例**:

```yaml
rules:
  - name: 'auto-reorder'
    condition: 'inventory.stock < safetyStock'
    action: 'procurement.createReorderSuggestion'
    priority: 1

  - name: 'low-stock-alert'
    condition: 'inventory.stock < minStock'
    action: 'notification.sendLowStockAlert'
    priority: 2
```

---

### Week 23-24: AI 增强功能

```
📊 智能补货建议
  ├── 历史销售数据分析
  ├── 季节性因素考虑
  └── 供应商交货周期

📈 销售预测
  ├── 时间序列分析 (ARIMA)
  ├── 机器学习模型 (Prophet)
  └── 置信区间展示

🚨 异常检测
  ├── 销量突增/突降告警
  ├── 库存异常波动
  └── 价格异常监控

📄 自动化报告生成
  ├── 日报/周报/月报
  ├── 自定义模板
  └── PDF/Excel 导出
```

**AI 提示词工程**:

```typescript
const prompt = `
你是一位经验丰富的库存管理专家。
基于以下数据，给出补货建议:

当前库存: ${currentStock}
日均销量: ${avgDailySales}
供应商交货周期: ${leadTime}天
安全库存阈值: ${safetyStock}

请给出:
1. 是否需要补货
2. 建议补货数量
3. 预计到货时间
4. 风险提示
`;

const suggestion = await dify.chat(prompt);
```

---

### Week 25-26: 用户反馈迭代

```
🧪 Beta 测试
  ├── 邀请 50 家企业试用
  ├── 收集使用数据
  └── NPS 调研

💬 用户反馈收集
  ├── 应用内反馈入口
  ├── 用户访谈
  └── 社区论坛

🔧 AI 提示词优化
  ├── A/B 测试不同 Prompt
  ├── 减少幻觉输出
  └── 提升准确率

⚡ 性能调优
  ├── 慢查询优化
  ├── 缓存策略调整
  └── 内存泄漏排查
```

**v1.0 发布标准**:

- [ ] Beta 用户满意度 > 80%
- [ ] NPS > 30
- [ ] 无 P0/P1 Bug
- [ ] AI 建议准确率 > 85%
- [ ] 文档完善 (用户手册 + API 文档)

---

## 📊 里程碑 (Milestones)

### M1: 技术验证完成 (Week 4)

- ✅ Tauri + Supabase 集成验证通过
- ✅ 离线同步引擎工作正常
- ✅ 性能指标达标

### M2: MVP Alpha 发布 (Week 12)

- ✅ 产品库和进销存核心功能可用
- ✅ 内部团队试用
- ✅ 收集第一轮反馈

### M3: MVP Beta 发布 (Week 18)

- ✅ 技能商店上线
- ✅ 10 家外部企业试用
- ✅ 付费功能测试

### M4: v1.0 正式发布 (Week 26)

- ✅ 所有 Phase 完成
- ✅ 公开下载
- ✅ 市场推广启动

---

## 🎯 关键指标追踪

### 技术指标

```
启动时间:     目标 < 3s      当前: ___
内存占用:     目标 < 200MB   当前: ___
安装包大小:   目标 < 15MB    当前: ___
API P95:      目标 < 500ms   当前: ___
同步成功率:   目标 > 99%     当前: ___
```

### 产品指标

```
活跃用户:     目标 1000      当前: ___
30天留存率:   目标 > 40%     当前: ___
NPS:          目标 > 30      当前: ___
技能数量:     目标 50+       当前: ___
付费转化率:   目标 > 5%      当前: ___
```

### 商业指标

```
月收入:       目标 ¥50K      当前: ___
CAC:          目标 < ¥200    当前: ___
LTV:          目标 > ¥2000   当前: ___
LTV/CAC:      目标 > 10      当前: ___
```

---

## 🔄 敏捷仪式时间表

```
每周:
├── 周一 10:00    Sprint Planning (计划会议)
├── 每日 10:00    Daily Standup (站会, 15分钟)
├── 周三 15:00    Tech Sharing (技术分享)
└── 周五 16:00    Sprint Review (评审会议)

每两周:
└── 周五 17:00    Sprint Retrospective (回顾会议)

每月:
└── 最后一周      Monthly Demo (月度演示给 Stakeholders)
```

---

## 📝 文档维护计划

```
每周更新:
├── PROCLAW_DEVELOPMENT_PLAN.md (进度跟踪)
├── 燃尽图 (Burndown Chart)
└── 风险登记册 (Risk Register)

每月更新:
├── PROCLAW_TECHNICAL_PLAN.md (技术决策记录)
├── 成本核算报告
└── KPI 仪表盘

每季度更新:
├── 路线图调整 (根据市场反馈)
├── 竞品分析报告
└── 用户调研报告
```

---

## 🚨 风险应对预案

### 高风险项

| 风险                  | 触发条件            | 应对措施                       | 负责人          |
| --------------------- | ------------------- | ------------------------------ | --------------- |
| **Rust 学习曲线**     | Week 2 仍无法编译   | 聘请外部顾问 / 转 Electron     | Tech Lead       |
| **Supabase 成本超支** | 月费用 > $100       | 实施查询缓存 / 降级方案        | Backend Dev     |
| **技能生态发展缓慢**  | Week 18 < 10 个技能 | 官方开发 10 个高质量技能       | Product Manager |
| **AI 准确率低**       | Week 24 < 70%       | 人工客服兜底 / 持续优化 Prompt | AI Engineer     |

---

## 🎉 庆祝时刻

```
✅ Week 4:  Phase 0 完成     → 团队聚餐 🍕
✅ Week 12: MVP Alpha 发布   → 小型派对 🎊
✅ Week 18: MVP Beta 发布    → 团队建设 🏖️
✅ Week 26: v1.0 正式发布    → 盛大庆典 🎆
```

---

**📅 最后更新**: 2026-04-11
**👥 维护者**: Tech Lead + Project Manager
**📊 下次更新**: Week 1 结束后
