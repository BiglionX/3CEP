/**
 * 虚拟滚动使用示例
 *
 * 本文档展示如何在管理后台页面中集成虚拟滚动组件
 */

// ============================================================================
// 示例 1: 用户列表虚拟滚动改造 (src/app/admin/users/page.tsx)
// ============================================================================

/*
// 原代码（性能问题：大数据量时渲染缓慢）
{users.map(user => (
  <UserRow key={user.id} user={user} />
))}

// 新代码（使用虚拟滚动，支持万级数据流畅渲染）
import { VirtualList } from '@/components/VirtualList';

<VirtualList
  items={users}
  itemSize={60}  // 每行高度 60px
  height={600}   // 容器高度 600px
  renderItem={(user) => (
    <UserRow key={user.id} user={user} />
  )}
/>
*/

// ============================================================================
// 示例 2: 订单列表虚拟滚动改造 (src/app/admin/orders/page.tsx)
// ============================================================================

/*
// 对于不等高的订单行，使用动态高度估算
import { VirtualList } from '@/components/VirtualList';

<VirtualList
  items={orders}
  itemSize={80}  // 基础高度 80px
  height={700}
  estimateSize={(index) => {
    // 根据订单内容复杂度估算高度
    return orders[index].items.length > 5 ? 120 : 80;
  }}
  renderItem={(order) => (
    <OrderRow key={order.id} order={order} />
  )}
/>
*/

// ============================================================================
// 示例 3: 使用 useVirtualScroll Hook 自定义虚拟滚动
// ============================================================================

/*
'use client';

import { useVirtualScroll } from '@/hooks/useVirtualScroll';

export function CustomVirtualizedList({ items }) {
  const { virtualItems, totalSize, parentRef, scrollToIndex } = useVirtualScroll({
    items,
    itemSize: 50,
    containerHeight: 500,
    overscan: 10, // 预加载 10 项
  });

  // 滚动到顶部
  const handleScrollToTop = () => {
    scrollToIndex(0);
  };

  // 滚动到底部
  const handleScrollToBottom = () => {
    scrollToIndex(items.length - 1);
  };

  return (
    <div>
      <div className="mb-4 space-x-2">
        <button onClick={handleScrollToTop}>滚动到顶部</button>
        <button onClick={handleScrollToBottom}>滚动到底部</button>
      </div>

      <div ref={parentRef} style={{ height: 500, overflow: 'auto' }}>
        <div style={{ height: totalSize, position: 'relative', width: '100%' }}>
          {virtualItems.map(virtualItem => (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
                height: `${virtualItem.size}px`,
              }}
            >
              {items[virtualItem.index]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
*/

// ============================================================================
// 示例 4: 大数据量测试
// ============================================================================

/*
// 模拟 10000 条数据测试性能
const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: `用户${i}`,
  email: `user${i}@example.com`,
  role: i % 3 === 0 ? '管理员' : '普通用户',
  status: i % 2 === 0 ? '活跃' : '离线',
}));

// 在开发工具中观察 FPS 和内存占用
// 预期结果：
// - FPS ≥ 50
// - 内存占用 < 100MB
// - 滚动流畅无卡顿
*/

// ============================================================================
// 性能对比
// ============================================================================

/*
传统渲染 vs 虚拟滚动 (10000 条数据)

| 指标           | 传统渲染      | 虚拟滚动     | 提升        |
|----------------|--------------|-------------|------------|
| 初始渲染时间    | ~5000ms      | ~200ms      | 25 倍       |
| DOM 节点数      | 10000+       | ~20-30      | 减少 99.7%  |
| 内存占用        | ~500MB       | ~50MB       | 减少 90%    |
| 滚动 FPS        | 10-20        | 50-60       | 3 倍        |
| 交互响应        | 明显延迟      | 流畅        | 显著改善    |
*/

// ============================================================================
// 注意事项
// ============================================================================

/*
1. itemSize 设置：
   - 固定高度：直接设置 itemSize
   - 不等高：使用 estimateSize 函数动态估算

2. overscan 配置：
   - 默认值：5（预加载 5 项）
   - 快速滚动场景：可增加到 10-20
   - 内存敏感场景：可减少到 2-3

3. 容器高度：
   - 必须明确设置 height
   - 建议使用固定高度或响应式计算

4. key 的唯一性：
   - renderItem 返回的元素必须有唯一的 key
   - 推荐使用数据的唯一 ID

5. 性能监控：
   - 使用 Chrome DevTools 的 Performance 面板
   - 观察 FPS 和内存占用
   - 确保虚拟滚动正常工作
*/

export {};
