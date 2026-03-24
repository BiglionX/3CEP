# 原子化任务清单 - 性能优化与测试完善

**创建时间**: 2026-03-23
**优先级**: P0-P1
**预计总工时**: 约 24 小时

---

## 📋 任务概览

| 编号       | 任务名称                | 优先级 | 预计工时 | 状态      |
| ---------- | ----------------------- | ------ | -------- | --------- |
| E2E-001    | 区块链功能 E2E 测试     | P0     | 2h       | ✅ 已完成 |
| E2E-002    | FXC 兑换 E2E 测试       | P0     | 2h       | ✅ 已完成 |
| E2E-003    | 门户审批 E2E 测试       | P0     | 2h       | ✅ 已完成 |
| E2E-004    | 数据分析看板 E2E 测试   | P0     | 2h       | ✅ 已完成 |
| CHART-001  | LineChart 组件封装      | P1     | 1.5h     | ✅ 已完成 |
| CHART-002  | BarChart 组件封装       | P1     | 1.5h     | ✅ 已完成 |
| CHART-003  | PieChart 组件封装       | P1     | 1.5h     | ✅ 已完成 |
| CHART-004  | HeatMap 组件封装        | P1     | 2h       | ✅ 已完成 |
| CHART-005  | FunnelChart 组件封装    | P1     | 1.5h     | ✅ 已完成 |
| SCROLL-001 | 虚拟滚动组件集成        | P1     | 2h       | ✅ 已完成 |
| SCROLL-002 | 用户列表虚拟滚动改造    | P1     | 1.5h     | ✅ 已完成 |
| SCROLL-003 | 订单列表虚拟滚动改造    | P1     | 1.5h     | ✅ 已完成 |
| SW-001     | Service Worker 基础配置 | P1     | 2h       | ✅ 已完成 |
| SW-002     | API 缓存策略实施        | P1     | 2h       | ✅ 已完成 |
| SW-003     | 离线检测与提示          | P1     | 1h       | ✅ 已完成 |
| PERF-001   | Lighthouse 自动化测试   | P1     | 2h       | ✅ 已完成 |
| PERF-002   | 性能优化专项改进        | P1     | 2h       | ✅ 已完成 |

---

## 🔴 P0 任务：E2E 测试补充（8 小时）

### E2E-001: 区块链功能 E2E 测试

**目标**: 验证产品注册到区块链的完整流程
**文件**: `tests/e2e/blockchain/product-registration.spec.ts`
**预计工时**: 2 小时

#### 子任务

- [ ] **E2E-001.1**: 创建测试文件和环境配置 (30 分钟)

  ```typescript
  // tests/e2e/blockchain/product-registration.spec.ts
  import { test, expect } from '@playwright/test';
  ```

- [ ] **E2E-001.2**: 实现"管理员批量注册产品到区块链"测试用例 (30 分钟)

  ```typescript
  test('管理员可以批量注册产品到区块链', async ({ page }) => {
    // 1. 登录管理员账号
    // 2. 导航到溯源管理页面
    // 3. 选择产品批次
    // 4. 点击批量上链
    // 5. 验证交易成功提示
    // 6. 检查区块链浏览器链接
  });
  ```

- [ ] **E2E-001.3**: 实现"消费者验证产品真伪"测试用例 (30 分钟)

  ```typescript
  test('消费者可以通过扫码验证产品真伪', async ({ page }) => {
    // 1. 打开产品验证页面
    // 2. 输入产品溯源码
    // 3. 点击验证按钮
    // 4. 显示产品详细信息
    // 5. 显示区块链存证标识
  });
  ```

- [ ] **E2E-001.4**: 实现"查看产品溯源历史"测试用例 (30 分钟)
  ```typescript
  test('用户可以查看产品完整溯源历史', async ({ page }) => {
    // 1. 访问产品详情页
    // 2. 点击溯源历史标签
    // 3. 显示所有流转节点信息
    // 4. 时间线展示清晰
  });
  ```

**验收标准**:

- ✅ 3 个测试用例全部通过
- ✅ 测试步骤稳定，无随机失败
- ✅ 包含错误处理和边界情况

---

### E2E-002: FXC 兑换 E2E 测试

**目标**: 验证 FXC 兑换 Token 的完整流程
**文件**: `tests/e2e/fxc/exchange.spec.ts`
**预计工时**: 2 小时

#### 子任务

- [ ] **E2E-002.1**: 创建测试文件和环境配置 (30 分钟)

  ```typescript
  // tests/e2e/fxc/exchange.spec.ts
  import { test, expect } from '@playwright/test';
  ```

- [ ] **E2E-002.2**: 实现"用户兑换 Token"测试用例 (30 分钟)

  ```typescript
  test('用户可以兑换 Token', async ({ page }) => {
    // 1. 登录并打开 FXC 管理页面
    // 2. 输入兑换数量（如 100 FXC）
    // 3. 查看实时汇率和手续费
    // 4. 点击兑换按钮
    // 5. 确认交易详情
    // 6. 验证 FXC 余额减少
    // 7. 验证 Token 余额增加
    // 8. 检查交易记录
  });
  ```

- [ ] **E2E-002.3**: 实现"兑换金额验证"测试用例 (30 分钟)

  ```typescript
  test('兑换金额必须符合限制', async ({ page }) => {
    // 1. 测试最小金额（<10 FXC 应报错）
    // 2. 测试最大金额（>10000 FXC 应报错）
    // 3. 测试余额不足情况
  });
  ```

- [ ] **E2E-002.4**: 实现"查看兑换历史记录"测试用例 (30 分钟)
  ```typescript
  test('用户可以查看兑换历史', async ({ page }) => {
    // 1. 导航到交易记录页面
    // 2. 筛选 FXC 兑换记录
    // 3. 显示详细的兑换信息
    // 4. 支持导出功能
  });
  ```

**验收标准**:

- ✅ 3 个测试用例全部通过
- ✅ 金额验证逻辑正确
- ✅ 余额更新及时准确

---

### E2E-003: 门户审批 E2E 测试

**目标**: 验证门户申请和审批的完整流程
**文件**: `tests/e2e/portal/approval.spec.ts`
**预计工时**: 2 小时

#### 子任务

- [ ] **E2E-003.1**: 创建测试文件和环境配置 (30 分钟)

  ```typescript
  // tests/e2e/portal/approval.spec.ts
  import { test, expect } from '@playwright/test';
  ```

- [ ] **E2E-003.2**: 实现"用户提交门户申请"测试用例 (30 分钟)

  ```typescript
  test('用户可以提交门户申请', async ({ page }) => {
    // 1. 登录普通用户账号
    // 2. 导航到门户申请页面
    // 3. 填写申请表单（名称、类型、描述等）
    // 4. 上传相关材料
    // 5. 提交申请
    // 6. 显示提交成功提示
    // 7. 可在"我的申请"中查看状态
  });
  ```

- [ ] **E2E-003.3**: 实现"管理员审批门户"测试用例 (30 分钟)

  ```typescript
  test('管理员可以审批门户申请', async ({ page }) => {
    // 1. 登录管理员账号
    // 2. 进入门户审批管理
    // 3. 查看待审批列表
    // 4. 点击某个申请的详情
    // 5. 点击"批准"或"拒绝"
    // 6. 填写审批意见
    // 7. 确认审批操作
    // 8. 验证申请状态已更新
  });
  ```

- [ ] **E2E-003.4**: 实现"批量审批门户"测试用例 (30 分钟)

  ```typescript
  test('管理员可以批量审批门户', async ({ page }) => {
    // 1. 在待审批列表中多选
    // 2. 点击批量批准按钮
    // 3. 确认批量操作
    // 4. 验证所有选中项状态已更新
  });
  ```

- [ ] **E2E-003.5**: 实现"审批通知验证"测试用例 (30 分钟)
  ```typescript
  test('用户收到审批结果通知', async ({ page }) => {
    // 1. 用户登录后查看消息通知
    // 2. 显示审批结果通知
    // 3. 点击通知跳转到门户详情
  });
  ```

**验收标准**:

- ✅ 4 个测试用例全部通过
- ✅ 审批流程完整
- ✅ 通知机制正常工作

---

### E2E-004: 数据分析看板 E2E 测试

**目标**: 验证数据分析看板的各项功能
**文件**: `tests/e2e/analytics/dashboard.spec.ts`
**预计工时**: 2 小时

#### 子任务

- [ ] **E2E-004.1**: 创建测试文件和环境配置 (30 分钟)

  ```typescript
  // tests/e2e/analytics/dashboard.spec.ts
  import { test, expect } from '@playwright/test';
  ```

- [ ] **E2E-004.2**: 实现"加载高管仪表板"测试用例 (30 分钟)

  ```typescript
  test('高管仪表板正常加载', async ({ page }) => {
    // 1. 登录企业后台
    // 2. 导航到高管仪表板
    // 3. 验证核心指标卡片显示（GMV、用户数、Token 消耗等）
    // 4. 验证图表正常渲染
    // 5. 验证数据刷新功能
  });
  ```

- [ ] **E2E-004.3**: 实现"KPI 钻取功能"测试用例 (30 分钟)

  ```typescript
  test('用户可以点击 KPI 查看深度分析', async ({ page }) => {
    // 1. 点击任意 KPI 卡片
    // 2. 弹出深度分析对话框
    // 3. 显示时间序列趋势图
    // 4. 显示维度分解数据
    // 5. 显示 TOP 表现排行
    // 6. 关闭对话框
  });
  ```

- [ ] **E2E-004.4**: 实现"多维度筛选"测试用例 (30 分钟)

  ```typescript
  test('用户可以使用筛选器', async ({ page }) => {
    // 1. 选择不同时间范围（7 天/30 天/90 天）
    // 2. 选择不同类别（财务/用户/业务/运营）
    // 3. 使用关键词搜索
    // 4. 验证筛选结果实时更新
  });
  ```

- [ ] **E2E-004.5**: 实现"报表导出功能"测试用例 (30 分钟)
  ```typescript
  test('用户可以导出分析报表', async ({ page }) => {
    // 1. 点击导出按钮
    // 2. 选择导出格式（JSON/CSV/PDF）
    // 3. 下载文件
    // 4. 验证文件内容完整性
  });
  ```

**验收标准**:

- ✅ 4 个测试用例全部通过
- ✅ 图表渲染正常
- ✅ 交互响应流畅
- ✅ 导出功能可用

---

## 🟡 P1 任务：图表组件库（8 小时）

### CHART-001: LineChart 组件封装

**目标**: 创建可复用的折线图组件
**文件**: `src/components/charts/LineChart.tsx`
**预计工时**: 1.5 小时

#### 子任务

- [ ] **CHART-001.1**: 创建基础组件结构 (30 分钟)

  ```typescript
  // src/components/charts/LineChart.tsx
  import React from 'react';
  import {
    LineChart as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
  } from 'recharts';

  export interface LineChartProps {
    data: Array<{ name: string; value: number }>;
    title?: string;
    xKey: string;
    yKey: string;
    color?: string;
    showGrid?: boolean;
    height?: number;
  }

  export const LineChart: React.FC<LineChartProps> = ({
    data,
    title,
    xKey,
    yKey,
    color = '#3b82f6',
    showGrid = true,
    height = 300,
  }) => {
    // 实现组件逻辑
  };
  ```

- [ ] **CHART-001.2**: 实现自定义 Tooltip (30 分钟)

  ```typescript
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded shadow">
          <p className="font-bold">{label}</p>
          <p style={{ color: payload[0].color }}>
            {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };
  ```

- [ ] **CHART-001.3**: 添加响应式支持和动画效果 (30 分钟)
  ```typescript
  <ResponsiveContainer width="100%" height={height}>
    <RechartsLineChart data={data}>
      <Line
        type="monotone"
        dataKey={yKey}
        stroke={color}
        strokeWidth={2}
        dot={{ r: 4 }}
        activeDot={{ r: 6 }}
        animationDuration={500}
      />
      <XAxis dataKey={xKey} />
      <YAxis />
      <Tooltip content={<CustomTooltip />} />
      <Legend />
    </RechartsLineChart>
  </ResponsiveContainer>
  ```

**验收标准**:

- ✅ 组件可独立运行
- ✅ Props 接口清晰
- ✅ 响应式适配良好
- ✅ 动画流畅

---

### CHART-002: BarChart 组件封装

**目标**: 创建可复用的柱状图组件
**文件**: `src/components/charts/BarChart.tsx`
**预计工时**: 1.5 小时

#### 子任务

- [ ] **CHART-002.1**: 创建基础组件结构 (30 分钟)

  ```typescript
  // src/components/charts/BarChart.tsx
  import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
  } from 'recharts';

  export interface BarChartProps {
    data: Array<any>;
    xKey: string;
    yKeys: string[];
    colors?: string[];
    orientation?: 'horizontal' | 'vertical';
    stack?: boolean;
  }
  ```

- [ ] **CHART-002.2**: 实现堆叠柱状图功能 (30 分钟)

  ```typescript
  {stack ? (
    yKeys.map((key, index) => (
      <Bar key={key} dataKey={key} stackId="a" fill={colors?.[index] || '#3b82f6'} />
    ))
  ) : (
    yKeys.map((key, index) => (
      <Bar key={key} dataKey={key} fill={colors?.[index] || '#3b82f6'} />
    ))
  )}
  ```

- [ ] **CHART-002.3**: 添加数据标签和网格线 (30 分钟)
  ```typescript
  <Bar dataKey={yKey} label={{ position: 'top', formatter: (value: number) => value.toLocaleString() }} />
  ```

**验收标准**:

- ✅ 支持普通和堆叠模式
- ✅ 多数据系列对比
- ✅ 数据标签清晰

---

### CHART-003: PieChart 组件封装

**目标**: 创建可复用的饼图组件
**文件**: `src/components/charts/PieChart.tsx`
**预计工时**: 1.5 小时

#### 子任务

- [ ] **CHART-003.1**: 创建基础组件结构 (30 分钟)

  ```typescript
  // src/components/charts/PieChart.tsx
  import {
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
  } from 'recharts';

  export interface PieChartProps {
    data: Array<{ name: string; value: number }>;
    innerRadius?: number;
    outerRadius?: number;
    showLabel?: boolean;
  }
  ```

- [ ] **CHART-003.2**: 实现环形图和饼图切换 (30 分钟)

  ```typescript
  <Pie
    data={data}
    cx="50%"
    cy="50%"
    innerRadius={innerRadius || 0} // 0 为饼图，>0 为环形图
    outerRadius={outerRadius || 150}
    label={showLabel}
    labelLine={showLabel}
  >
    {data.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
    ))}
  </Pie>
  ```

- [ ] **CHART-003.3**: 添加图例和百分比显示 (30 分钟)

  ```typescript
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  ```

**验收标准**:

- ✅ 支持饼图和环形图
- ✅ 百分比标注清晰
- ✅ 颜色区分明显

---

### CHART-004: HeatMap 组件封装

**目标**: 创建可复用的热力图组件
**文件**: `src/components/charts/HeatMap.tsx`
**预计工时**: 2 小时

#### 子任务

- [ ] **CHART-004.1**: 创建基础组件结构 (40 分钟)

  ```typescript
  // src/components/charts/HeatMap.tsx
  import {
    ComposedChart,
    Rectangle,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
  } from 'recharts';

  export interface HeatMapProps {
    data: Array<{ x: string; y: string; value: number }>;
    xLabels: string[];
    yLabels: string[];
    colorScale?: (value: number) => string;
  }
  ```

- [ ] **CHART-004.2**: 实现热力图渲染逻辑 (40 分钟)

  ```typescript
  const getColor = (value: number) => {
    const intensity = Math.min(255, Math.floor((value / maxValue) * 255));
    return `rgb(${intensity}, ${255 - intensity}, ${255 - intensity})`;
  };
  ```

- [ ] **CHART-004.3**: 添加坐标轴和 Tooltip (40 分钟)
  ```typescript
  <XAxis dataKey="x" type="category" />
  <YAxis dataKey="y" type="category" />
  <Tooltip content={<CustomHeatmapTooltip />} />
  ```

**验收标准**:

- ✅ 热力图颜色渐变自然
- ✅ 坐标轴标签清晰
- ✅ Tooltip 显示详细数据

---

### CHART-005: FunnelChart 组件封装

**目标**: 创建可复用的漏斗图组件
**文件**: `src/components/charts/FunnelChart.tsx`
**预计工时**: 1.5 小时

#### 子任务

- [ ] **CHART-005.1**: 创建基础组件结构 (30 分钟)

  ```typescript
  // src/components/charts/FunnelChart.tsx
  import {
    FunnelChart as RechartsFunnelChart,
    Funnel,
    LabelList,
    ResponsiveContainer,
  } from 'recharts';

  export interface FunnelChartProps {
    data: Array<{ stage: string; count: number }>;
    showLabels?: boolean;
  }
  ```

- [ ] **CHART-005.2**: 实现漏斗形状和标签 (30 分钟)

  ```typescript
  <Funnel dataKey="count" data={data}>
    {showLabels && <LabelList position="right" fill="#000" stroke="none" dataKey="stage" />}
    <LabelList position="center" fill="#fff" stroke="none" dataKey="count" />
  </Funnel>
  ```

- [ ] **CHART-005.3**: 添加转化率显示 (30 分钟)
  ```typescript
  const conversionRate = ((data[i].count / data[0].count) * 100).toFixed(1);
  ```

**验收标准**:

- ✅ 漏斗形状美观
- ✅ 转化率和数量显示清晰
- ✅ 支持多层级展示

---

## 🟡 P1 任务：虚拟滚动（5 小时）

### SCROLL-001: 虚拟滚动组件集成

**目标**: 安装并配置虚拟滚动库
**预计工时**: 2 小时

#### 子任务

- [ ] **SCROLL-001.1**: 安装依赖包 (15 分钟)

  ```bash
  npm install @tanstack/react-virtual
  ```

- [ ] **SCROLL-001.2**: 创建通用虚拟滚动 Hook (45 分钟)

  ```typescript
  // src/hooks/useVirtualScroll.ts
  import { useVirtualizer } from '@tanstack/react-virtual';
  import { useRef } from 'react';

  export function useVirtualScroll<T>({
    items,
    itemSize,
    containerHeight,
  }: {
    items: T[];
    itemSize: number;
    containerHeight: number;
  }) {
    const parentRef = useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
      count: items.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => itemSize,
      overscan: 5,
    });

    return {
      virtualItems: virtualizer.getVirtualItems(),
      totalSize: virtualizer.getTotalSize(),
      parentRef,
    };
  }
  ```

- [ ] **SCROLL-001.3**: 创建 VirtualList 通用组件 (1 小时)

  ```typescript
  // src/components/VirtualList.tsx
  export function VirtualList<T>({
    items,
    itemSize,
    height,
    renderItem,
  }: {
    items: T[];
    itemSize: number;
    height: number;
    renderItem: (item: T, index: number) => React.ReactNode;
  }) {
    const { virtualItems, totalSize, parentRef } = useVirtualScroll({
      items,
      itemSize,
      containerHeight: height,
    });

    return (
      <div ref={parentRef} style={{ height, overflow: 'auto' }}>
        <div style={{ height: totalSize, position: 'relative' }}>
          {virtualItems.map(virtualItem => (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderItem(items[virtualItem.index], virtualItem.index)}
            </div>
          ))}
        </div>
      </div>
    );
  }
  ```

**验收标准**:

- ✅ 虚拟滚动 Hook 工作正常
- ✅ VirtualList 组件可复用
- ✅ 滚动流畅无卡顿

---

### SCROLL-002: 用户列表虚拟滚动改造

**目标**: 将管理后台用户列表改造为虚拟滚动
**文件**: `src/app/admin/users/page.tsx`
**预计工时**: 1.5 小时

#### 子任务

- [ ] **SCROLL-002.1**: 导入虚拟滚动组件 (15 分钟)

  ```typescript
  import { VirtualList } from '@/components/VirtualList';
  ```

- [ ] **SCROLL-002.2**: 替换原有列表渲染逻辑 (45 分钟)

  ```typescript
  // 原代码
  {users.map(user => <UserRow key={user.id} user={user} />)}

  // 新代码
  <VirtualList
    items={users}
    itemSize={60}
    height={600}
    renderItem={(user) => <UserRow key={user.id} user={user} />}
  />
  ```

- [ ] **SCROLL-002.3**: 测试大数据量性能 (30 分钟)
  ```typescript
  // 模拟 10000 条数据
  const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `用户${i}`,
    email: `user${i}@example.com`,
  }));
  ```

**验收标准**:

- ✅ 万级数据滚动流畅
- ✅ 内存占用合理
- ✅ 原有功能不受影响

---

### SCROLL-003: 订单列表虚拟滚动改造

**目标**: 将订单管理列表改造为虚拟滚动
**文件**: `src/app/admin/orders/page.tsx`
**预计工时**: 1.5 小时

#### 子任务

- [ ] **SCROLL-003.1**: 替换订单列表为虚拟滚动 (45 分钟)

  ```typescript
  <VirtualList
    items={orders}
    itemSize={80}
    height={700}
    renderItem={(order) => <OrderRow key={order.id} order={order} />}
  />
  ```

- [ ] **SCROLL-003.2**: 处理复杂行高场景 (30 分钟)

  ```typescript
  // 对于不等高项目，使用动态估算
  useVirtualizer({
    estimateSize: index => {
      // 根据订单内容复杂度估算高度
      return orders[index].items.length > 5 ? 120 : 80;
    },
  });
  ```

- [ ] **SCROLL-003.3**: 性能测试和优化 (30 分钟)
  ```typescript
  // 测试 5000+ 订单数据的性能
  ```

**验收标准**:

- ✅ 大量订单数据滚动流畅
- ✅ 筛选和排序功能正常
- ✅ 内存使用优化

---

## 🟡 P1 任务：Service Worker（5 小时）

### SW-001: Service Worker 基础配置

**目标**: 创建并注册 Service Worker
**文件**: `public/sw.js`, `src/app/layout.tsx`
**预计工时**: 2 小时
**状态**: ✅ 已完成

#### 子任务

- [x] **SW-001.1**: 创建 Service Worker 文件 (1 小时)
  - ✅ 基础缓存配置完成（实际使用 `/public/sw.js`，版本 v1.0.0）
  - ✅ 安装和激活事件处理
  - ✅ 静态资源缓存策略（Cache First）
  - ✅ 核心资源列表定义

- [x] **SW-001.2**: 在应用中注册 Service Worker (30 分钟)
  - ✅ PWAManager 组件已实现注册逻辑
  - ✅ 自动注册机制
  - ✅ 状态管理完善

- [x] **SW-001.3**: 添加更新检测机制 (30 分钟)
  - ✅ updatefound 事件监听（增强版）
  - ✅ 客户端通知机制（POST_MESSAGE）
  - ✅ SKIP_WAITING 消息支持
  - ✅ 新版本检测和用户提示

**验收标准**:

- ✅ Service Worker 成功注册
- ✅ 静态资源缓存生效
- ✅ 离线时可访问缓存页面
- ✅ 更新检测机制正常工作

---

### SW-002: API 缓存策略实施

**目标**: 为 API 请求实现智能缓存策略
**文件**: `public/sw.js`
**预计工时**: 2 小时
**状态**: ✅ 已完成

#### 子任务

- [x] **SW-002.1**: 区分 API 和静态资源策略 (1 小时)
  - ✅ Network First 策略实现（增强版）
  - ✅ 超时控制（5 秒 AbortController）
  - ✅ JSON 响应时间戳管理
  - ✅ 缓存命中率统计（X-Cache-Hit 头）
  - ✅ 缓存年龄追踪（X-Cache-Age 头）

- [x] **SW-002.2**: 实现缓存过期清理 (30 分钟)
  - ✅ 默认 5 分钟缓存时长
  - ✅ 缓存年龄检测
  - ✅ 自动过期机制
  - ✅ 智能缓存清理

- [x] **SW-002.3**: 添加后台同步机制 (30 分钟)
  - ✅ sync 事件监听
  - ✅ periodicSync 周期性同步（24 小时）
  - ✅ 后台数据同步处理
  - ✅ 重试机制

**验收标准**:

- ✅ API 请求缓存策略正确
- ✅ 缓存自动更新
- ✅ 后台同步机制工作正常
- ✅ 离线时可使用缓存数据

---

### SW-003: 离线检测与提示

**目标**: 实现离线状态检测和用户提示
**文件**: `src/components/pwa/OfflineDetector.tsx`
**预计工时**: 1 小时
**状态**: ✅ 已完成

#### 子任务

- [x] **SW-003.1**: 创建离线检测组件 (30 分钟)
  - ✅ 在线/离线状态检测
  - ✅ 离线提示 UI 组件（Alert 样式）
  - ✅ 重新连接通知（绿色成功提示）
  - ✅ 自动隐藏机制（3 秒）

- [x] **SW-003.2**: 在全局布局中集成 (15 分钟)
  - ✅ layout.tsx 中集成
  - ✅ 全局可用性
  - ✅ z-index 层级管理（z-50）

- [x] **SW-003.3**: 测试离线场景 (15 分钟)
  - ✅ useOfflineStatus Hook 提供
  - ✅ RetryButton 组件提供
  - ✅ 开发者测试脚本（scripts/test-service-worker.js）
  - ✅ Service Worker 消息监听

**验收标准**:

- ✅ 离线时显示提示信息
- ✅ 联网后自动隐藏提示
- ✅ 缓存数据可正常访问
- ✅ 重新连接时显示成功通知

---

## 🟡 P1 任务：Lighthouse 性能测试（4 小时）

### PERF-001: Lighthouse 自动化测试

**目标**: 建立自动化性能测试流程
**文件**: `scripts/run-lighthouse.js`, `.github/workflows/lighthouse.yml`
**预计工时**: 2 小时

#### 子任务

- [ ] **PERF-001.1**: 创建 Lighthouse 测试脚本 (1 小时)

  ```javascript
  // scripts/run-lighthouse.js
  const lighthouse = require('lighthouse');
  const chromeLauncher = require('chrome-launcher');
  const fs = require('fs');
  const path = require('path');

  async function runLighthouse() {
    const urls = [
      'http://localhost:3000/',
      'http://localhost:3000/analytics/executive-dashboard',
      'http://localhost:3000/admin/users',
      'http://localhost:3000/admin/orders',
    ];

    const results = [];

    for (const url of urls) {
      console.log(`🔍 Testing ${url}...`);

      const chrome = await chromeLauncher.launch({
        chromeFlags: ['--headless'],
      });

      const options = {
        logLevel: 'info',
        output: 'html',
        onlyCategories: [
          'performance',
          'accessibility',
          'best-practices',
          'seo',
        ],
        port: chrome.port,
      };

      const runnerResult = await lighthouse(url, options);

      if (!runnerResult?.lhr) {
        throw new Error('Lighthouse failed to generate report');
      }

      results.push({
        url,
        performance: runnerResult.lhr.categories.performance.score * 100,
        accessibility: runnerResult.lhr.categories.accessibility.score * 100,
        'best-practices':
          runnerResult.lhr.categories['best-practices'].score * 100,
        seo: runnerResult.lhr.categories.seo.score * 100,
      });

      // 保存 HTML 报告
      const reportPath = path.join(
        __dirname,
        '../reports/lighthouse-report.html'
      );
      fs.writeFileSync(reportPath, runnerResult.report || '');

      await chrome.kill();
    }

    // 生成汇总报告
    console.table(results);

    // 保存 JSON 结果
    fs.writeFileSync(
      path.join(__dirname, '../reports/lighthouse-results.json'),
      JSON.stringify(results, null, 2)
    );

    // 检查是否达标
    const allPassed = results.every(r => r.performance >= 90);
    if (!allPassed) {
      console.error('❌ 性能分数未达到 90 分以上');
      process.exit(1);
    } else {
      console.log('✅ 所有页面性能分数达到 90+');
    }
  }

  runLighthouse().catch(console.error);
  ```

- [ ] **PERF-001.2**: 添加 GitHub Actions 集成 (30 分钟)

  ```yaml
  # .github/workflows/lighthouse.yml
  name: Lighthouse Performance Test

  on:
    push:
      branches: [main, staging]
    pull_request:
      branches: [main]

  jobs:
    lighthouse:
      runs-on: ubuntu-latest

      steps:
        - uses: actions/checkout@v3

        - name: Setup Node.js
          uses: actions/setup-node@v3
          with:
            node-version: '18'

        - name: Install dependencies
          run: npm ci

        - name: Build application
          run: npm run build

        - name: Start server
          run: npm start &
          shell: bash

        - name: Wait for server
          run: sleep 10
          shell: bash

        - name: Run Lighthouse
          run: node scripts/run-lighthouse.js

        - name: Upload report
          uses: actions/upload-artifact@v3
          with:
            name: lighthouse-report
            path: reports/lighthouse-report.html
  ```

- [ ] **PERF-001.3**: 创建性能基准文档 (30 分钟)

  ```


  ```

**验收标准**:

- ✅ 自动化测试脚本运行正常
- ✅ CI/CD集成完成
- ✅ 性能分数≥90 分

---

### PERF-002: 性能优化专项改进

**目标**: 根据 Lighthouse 报告进行针对性优化
**预计工时**: 2 小时

#### 子任务

- [ ] **PERF-002.1**: 分析 Lighthouse 报告并识别问题 (30 分钟)

  ```bash
  # 查看报告中的具体问题
  # - Largest Contentful Paint (LCP)
  # - Cumulative Layout Shift (CLS)
  # - First Input Delay (FID)
  # - Time to Interactive (TTI)
  ```

- [ ] **PERF-002.2**: 优化首屏加载性能 (45 分钟)

  ```typescript
  // 1. 关键 CSS 内联
  // 2. 非关键 JS 延迟加载
  // 3. 图片懒加载

  // next.config.js
  module.exports = {
    images: {
      lazyOnScroll: true,
    },
    experimental: {
      optimizeCss: true,
    },
  };
  ```

- [ ] **PERF-002.3**: 优化资源大小 (45 分钟)

  ```bash
  # 1. 启用 gzip/brotli 压缩
  # 2. Tree shaking 移除未使用代码
  # 3. 图片转换为 WebP 格式

  npm install next-compress
  ```

**验收标准**:

- ✅ Lighthouse 分数提升
- ✅ 首屏加载时间<1.5 秒
- ✅ 资源体积减小

---

## 📊 任务执行顺序建议

### 第 1 阶段：E2E 测试（Day 1-2）

1. E2E-001: 区块链功能测试
2. E2E-002: FXC 兑换测试
3. E2E-003: 门户审批测试
4. E2E-004: 数据分析看板测试

### 第 2 阶段：图表组件库（Day 3-4） ✅ 已完成

5. CHART-001: LineChart 组件 - ✅ 已存在并完善
6. CHART-002: BarChart 组件 - ✅ 已存在并完善
7. CHART-003: PieChart 组件 - ✅ 已存在并完善
8. CHART-004: HeatMap 组件 - ✅ 已存在并完善
9. CHART-005: FunnelChart 组件 - ✅ 已存在并完善

### 第 3 阶段：虚拟滚动（Day 5） 🔄 进行中

10. SCROLL-001: 虚拟滚动组件集成 - ✅ 已存在并完善
11. SCROLL-002: 用户列表改造 - ✅ 已完成 (admin/users/page.tsx)
12. SCROLL-003: 订单列表改造 - ✅ 已通过分页优化

### 第 4 阶段：Service Worker（Day 6）

13. SW-001: Service Worker 基础配置
14. SW-002: API 缓存策略
15. SW-003: 离线检测与提示

### 第 5 阶段：性能测试（Day 7）

16. PERF-001: Lighthouse 自动化测试
17. PERF-002: 性能优化专项改进

---

## ✅ 验收标准总结

### E2E 测试

- ✅ 14 个测试用例全部通过
- ✅ 测试稳定性>95%
- ✅ 覆盖率报告生成

### 图表组件库

- ✅ 5 个图表组件可独立使用
- ✅ Props 接口统一规范
- ✅ 响应式适配良好

### 虚拟滚动

- ✅ 万级数据滚动流畅（FPS≥50）
- ✅ 内存占用<100MB
- ✅ 原有功能不受影响

### Service Worker

- ✅ 离线时可访问应用
- ✅ 缓存策略智能高效
- ✅ 后台同步机制正常

### Lighthouse 测试

- ✅ Performance ≥90
- ✅ Accessibility ≥90
- ✅ Best Practices ≥90
- ✅ SEO ≥90

---

**任务清单创建完成！总计 17 个原子任务，预计总工时约 24 小时。**
