# 库存管理UI组件使用指南

## 组件列表

### 1. SalesForecastChart - 销量预测曲线图表

**文件**: `src/components/inventory/SalesForecastChart.tsx`

**功能**: 使用Recharts展示历史销量和AI预测趋势对比

**特性**:

- ✅ 响应式设计(ResponsiveContainer)
- ✅ 时间范围切换(7天/30天/90天)
- ✅ 置信区间可视化
- ✅ 自定义Tooltip
- ✅ 渐变填充效果
- ✅ 移动端友好的字体大小

**使用示例**:

```tsx
import { SalesForecastChart } from '@/components/inventory';

const forecastData = [
  {
    date: '2026-04-01',
    actual: 100,
    predicted: 105,
    lowerBound: 95,
    upperBound: 115,
  },
  {
    date: '2026-04-02',
    actual: 110,
    predicted: 112,
    lowerBound: 102,
    upperBound: 122,
  },
  // ...更多数据
];

<SalesForecastChart
  data={forecastData}
  title="商品A销量预测"
  itemName="Widget Pro"
  description="基于Prophet模型的30天预测"
/>;
```

**Props**:

- `data`: ForecastDataPoint[] - 预测数据数组
- `title?`: string - 图表标题
- `description?`: string - 图表描述
- `itemName?`: string - 商品名称

---

### 2. ReplenishmentCard - 智能补货建议卡片

**文件**: `src/components/inventory/ReplenishmentCard.tsx`

**功能**: 展示AI生成的补货建议,支持审批和操作

**特性**:

- ✅ 优先级徽章(紧急/高/中/低)
- ✅ 状态管理(待审批/已批准/已拒绝/已下单)
- ✅ AI预测数据展示
- ✅ 推荐理由说明
- ✅ 一键批准/拒绝/生成订单
- ✅ 加载状态指示
- ✅ 移动端卡片布局

**使用示例**:

```tsx
import { ReplenishmentCard } from '@/components/inventory';

const suggestion = {
  id: 'uuid-123',
  itemId: 'item-uuid',
  itemName: 'Widget Pro',
  sku: 'WP-001',
  currentStock: 15,
  suggestedQuantity: 100,
  priority: 'urgent' as const,
  reason: '基于AI预测分析:\n- 未来30天预计需求: 120件\n- 当前库存: 15件',
  forecastData: {
    summary: {
      totalPredicted: 120,
      averageDaily: 4,
    },
  },
  createdAt: '2026-04-08T10:00:00Z',
  status: 'pending' as const,
};

<ReplenishmentCard
  suggestion={suggestion}
  onApprove={async id => {
    await fetch(`/api/replenishment/${id}/approve`, { method: 'POST' });
  }}
  onReject={async id => {
    await fetch(`/api/replenishment/${id}/reject`, { method: 'PUT' });
  }}
  onCreateOrder={async id => {
    await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ replenishmentId: id }),
    });
  }}
/>;
```

**Props**:

- `suggestion`: ReplenishmentSuggestion - 补货建议数据
- `onApprove?`: (id: string) => Promise<void> - 批准回调
- `onReject?`: (id: string) => Promise<void> - 拒绝回调
- `onCreateOrder?`: (id: string) => Promise<void> - 创建订单回调

---

### 3. AIInventoryAssistant - AI库存问答助手

**文件**: `src/components/inventory/AIInventoryAssistant.tsx`

**功能**: 集成Dify API,提供自然语言库存查询能力

**特性**:

- ✅ 聊天界面
- ✅ 上下文记忆(conversation_id)
- ✅ 快捷问题按钮
- ✅ 加载动画
- ✅ 自动滚动
- ✅ 回车发送
- ✅ 移动端适配(固定高度600px)

**使用示例**:

```tsx
import { AIInventoryAssistant } from '@/components/inventory';

// 方式1: 使用环境变量
<AIInventoryAssistant />

// 方式2: 手动配置
<AIInventoryAssistant
  apiKey="app-your-dify-api-key"
  baseUrl="https://api.dify.ai/v1"
/>
```

**环境变量配置** (`.env.local`):

```env
NEXT_PUBLIC_DIFY_API_KEY=app-your-dify-api-key
NEXT_PUBLIC_DIFY_BASE_URL=https://api.dify.ai/v1
```

**Props**:

- `apiKey?`: string - Dify API密钥
- `baseUrl?`: string - Dify API基础URL

---

## 移动端优化说明

所有组件都已针对移动设备优化:

### 响应式特性

1. **SalesForecastChart**:
   - ✅ ResponsiveContainer自动适应容器宽度
   - ✅ 字体大小自适应(12px)
   - ✅ 时间范围选择器紧凑布局
   - ✅ 图例说明网格布局(2列)

2. **ReplenishmentCard**:
   - ✅ 卡片式布局适合小屏幕
   - ✅ 网格布局展示库存信息(2列)
   - ✅ 按钮全宽显示(flex-1)
   - ✅ 文本截断和换行处理

3. **AIInventoryAssistant**:
   - ✅ 固定高度600px避免溢出
   - ✅ ScrollArea内部滚动
   - ✅ 输入框和按钮水平布局
   - ✅ 快捷问题自动换行(flex-wrap)

### Tailwind CSS类说明

- `w-full`: 全宽适应
- `max-w-[75%]`: 消息气泡最大宽度
- `grid grid-cols-2`: 两列网格
- `flex-wrap`: 自动换行
- `text-xs/sm/base`: 响应式字体
- `h-[600px]`: 固定高度

---

## 集成到库存页面

在 `src/app/admin/inventory/page.tsx` 中集成:

```tsx
import {
  SalesForecastChart,
  ReplenishmentCard,
  AIInventoryAssistant,
} from '@/components/inventory';

export default function InventoryPage() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [forecastData, setForecastData] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  return (
    <div className="space-y-6">
      {/* 顶部: AI助手 */}
      <AIInventoryAssistant />

      {/* 中部: 预测图表 */}
      {selectedItem && (
        <SalesForecastChart data={forecastData} itemName={selectedItem} />
      )}

      {/* 底部: 补货建议列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map(suggestion => (
          <ReplenishmentCard
            key={suggestion.id}
            suggestion={suggestion}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 样式定制

所有组件使用shadcn/ui组件和Tailwind CSS,可以轻松定制:

### 修改颜色主题

编辑组件中的颜色类:

- 预测曲线: `#8884d8` (紫色) → 改为你品牌色
- 实际销量: `#82ca9d` (绿色)
- 紧急优先级: `bg-red-100 text-red-800`

### 调整尺寸

- 图表高度: `<ResponsiveContainer height={300}>` → 改为400
- 卡片高度: `h-[600px]` → 改为500或700
- 字体大小: `text-xs` → `text-sm`

---

## 性能优化建议

1. **数据缓存**: 使用React Query或SWR缓存API数据
2. **懒加载**: 大型列表使用虚拟滚动
3. **防抖**: 搜索输入添加debounce
4. **图片优化**: 如有商品图片,使用next/image

---

## 常见问题

### Q: 图表不显示?

A: 检查:

1. Recharts是否正确安装: `npm list recharts`
2. 数据格式是否正确(date字段必须是字符串)
3. 容器是否有明确的高度

### Q: AI助手无法连接?

A: 确认:

1. DIFY_API_KEY已配置
2. 网络连接正常
3. Dify应用已发布

### Q: 移动端布局错乱?

A: 检查:

1. 是否使用了viewport meta标签
2. Tailwind配置是否包含响应式断点
3. 浏览器开发者工具测试不同屏幕尺寸

---

**文档版本**: 1.0
**最后更新**: 2026-04-08
**维护者**: Frontend Team
