# CROWDFUND-303 旧机型关联推荐功能文档

## 功能概述

基于用户历史购买记录和扫码行为，为用户提供个性化的机型升级推荐服务，展示以旧换新优惠信息。

## 技术架构

### 核心组件

1. **数据库层**
   - `model_upgrade_mappings`: 新旧机型映射表
   - `user_device_history`: 用户设备历史表
   - `upgrade_recommendations`: 推荐记录表

2. **服务层**
   - `UpgradeRecommendationService`: 核心推荐服务
   - 自动从扫描记录提取设备信息
   - 智能计算回收价值和优惠额度

3. **API层**
   - `GET /api/crowdfunding/recommend`: 获取推荐列表
   - `POST /api/crowdfunding/recommend`: 强制刷新推荐
   - `PUT /api/crowdfunding/recommend/click`: 记录点击
   - `PATCH /api/crowdfunding/recommend/conversion`: 记录转化

4. **前端组件**
   - `UpgradeRecommendationList`: 推荐列表组件
   - 响应式设计，支持移动端
   - 可视化推荐得分展示

## 数据库设计

### model_upgrade_mappings 表

```sql
CREATE TABLE model_upgrade_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    old_model VARCHAR(100) NOT NULL,
    new_model VARCHAR(100) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    upgrade_discount_rate DECIMAL(5,4) DEFAULT 0.15,
    min_trade_value DECIMAL(10,2) DEFAULT 100,
    max_trade_value DECIMAL(10,2) DEFAULT 2000,
    compatibility_score INTEGER DEFAULT 80,
    upgrade_reason TEXT,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1
);
```

### user_device_history 表

```sql
CREATE TABLE user_device_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    purchase_date DATE,
    condition_rating INTEGER,
    usage_duration_months INTEGER,
    source_type VARCHAR(20) DEFAULT 'purchase',
    is_current BOOLEAN DEFAULT true
);
```

## API 接口文档

### 获取推荐列表

```
GET /api/crowdfunding/recommend?userId={userId}&limit={limit}&useCache={true|false}
```

**参数说明:**

- `userId` (必需): 用户ID
- `limit` (可选): 返回推荐数量，默认5
- `useCache` (可选): 是否使用缓存，默认true

**响应示例:**

```json
{
  "success": true,
  "data": [
    {
      "oldModel": "iPhone 12",
      "newModel": "iPhone 15",
      "brand": "Apple",
      "category": "手机",
      "predictedTradeValue": 650.0,
      "discountAmount": 97.5,
      "discountRate": 0.15,
      "recommendationScore": 0.85,
      "recommendationReason": "显著性能提升，支持最新iOS功能",
      "expiresAt": "2026-02-27T10:30:00Z"
    }
  ],
  "meta": {
    "totalCount": 1,
    "userId": "user-123",
    "timestamp": "2026-02-20T10:30:00Z",
    "fromCache": true
  },
  "message": "为您找到1个升级推荐"
}
```

### 强制刷新推荐

```
POST /api/crowdfunding/recommend
```

**请求体:**

```json
{
  "userId": "user-123",
  "limit": 5
}
```

### 记录推荐点击

```
PUT /api/crowdfunding/recommend/click
```

**请求体:**

```json
{
  "userId": "user-123",
  "oldModel": "iPhone 12",
  "newModel": "iPhone 15"
}
```

### 记录推荐转化

```
PATCH /api/crowdfunding/recommend/conversion
```

**请求体:**

```json
{
  "userId": "user-123",
  "oldModel": "iPhone 12",
  "newModel": "iPhone 15"
}
```

## 推荐算法

### 核心逻辑

1. **设备历史提取**
   - 从 `user_device_history` 表获取用户设备记录
   - 自动从扫描记录中提取设备信息
   - 估算设备使用时长和状况

2. **升级映射匹配**
   - 根据品牌和旧机型匹配升级路径
   - 考虑兼容性评分和优先级

3. **价值计算**

   ```
   预估回收价值 = 基础价值 × 设备状况系数 × 使用时长系数
   折扣金额 = 预估回收价值 × 折扣率
   ```

4. **推荐得分计算**
   ```
   得分 = 兼容性评分×0.4 + 优先级评分×0.3 + 设备状况×0.2 + 使用时长×0.1
   ```

## 前端集成

### 基本用法

```jsx
import UpgradeRecommendationList from '@/components/crowdfunding/UpgradeRecommendationList';

function CrowdfundingPage({ userId }) {
  return (
    <div className="container mx-auto py-8">
      <UpgradeRecommendationList
        userId={userId}
        limit={5}
        onRecommendationClick={rec => {
          console.log('用户点击查看推荐:', rec);
        }}
        onConversion={rec => {
          console.log('用户准备升级:', rec);
          // 跳转到购买页面
        }}
      />
    </div>
  );
}
```

### 组件属性

- `userId` (必需): 当前用户ID
- `limit` (可选): 显示推荐数量，默认5
- `className` (可选): 自定义样式类名
- `onRecommendationClick`: 点击推荐项回调
- `onConversion`: 转化行为回调

## 部署指南

### 1. 数据库迁移

```bash
# 执行数据库迁移脚本
npx supabase migration up
# 或手动执行 SQL 文件
psql -f supabase/migrations/020_create_upgrade_recommendation_system.sql
```

### 2. 环境配置

确保 `.env` 文件包含必要的数据库连接信息：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. 启动服务

```bash
npm run dev
# 或生产环境
npm run build
npm start
```

## 测试验证

### 运行自动化测试

```bash
node scripts/test-upgrade-recommendation.js
```

### 手动测试要点

1. 验证API接口返回正确的推荐数据
2. 检查推荐准确性是否符合预期
3. 测试缓存机制是否正常工作
4. 验证用户交互追踪功能

## 性能优化

### 缓存策略

- 推荐结果默认缓存7天
- 支持强制刷新机制
- 智能缓存命中检测

### 数据库优化

- 关键字段建立索引
- 使用分页查询限制结果集
- 异步处理耗时操作

## 监控指标

### 关键指标

- 推荐点击率 (CTR)
- 转化率 (Conversion Rate)
- 平均推荐得分
- 缓存命中率
- API响应时间

### 日志记录

```javascript
// 推荐生成日志
console.log('生成推荐', { userId, deviceCount, recommendationCount });

// 用户行为日志
console.log('记录点击', { userId, oldModel, newModel });
```

## 故障排除

### 常见问题

1. **API返回404**
   - 检查路由文件路径是否正确
   - 确认Next.js服务正常运行

2. **无推荐结果**
   - 验证用户设备历史数据
   - 检查升级映射表数据
   - 确认用户ID有效性

3. **推荐不准确**
   - 审核升级映射配置
   - 调整推荐算法参数
   - 优化设备状况评估逻辑

## 后续优化方向

1. **机器学习增强**
   - 引入协同过滤算法
   - 基于用户行为的深度学习推荐

2. **实时数据处理**
   - 流式处理用户扫描行为
   - 实时更新推荐结果

3. **个性化体验**
   - A/B测试不同推荐策略
   - 用户偏好学习机制

4. **商业智能**
   - 推荐效果分析仪表板
   - ROI计算和优化
