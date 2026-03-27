-- ====================================================================
-- Skills 商店数据检查脚本
-- ====================================================================
-- 用途：检查 Skills 商店中是否有测试数据
-- 执行方式：在 Supabase SQL Editor 中运行

-- 1. 检查 skills 表总记录数
SELECT 'Skills 总数' AS 检查项，COUNT(*) AS 数量 FROM skills;

-- 2. 按审核状态统计
SELECT
  review_status AS 审核状态，
  COUNT(*) AS 数量
FROM skills
GROUP BY review_status;

-- 3. 按上下架状态统计
SELECT
  shelf_status AS 上下架状态，
  COUNT(*) AS 数量
FROM skills
GROUP BY shelf_status;

-- 4. 查看最新的 10 个 Skill
SELECT
  id,
  name,
  description,
  category,
  price,
  review_status,
  shelf_status,
  created_at
FROM skills
ORDER BY created_at DESC
LIMIT 10;

-- 5. 检查分类数据
SELECT
  'Skill 分类' AS 检查项，
  COUNT(*) AS 数量
FROM skill_categories
WHERE is_active = true;

-- 6. 查看所有可用的分类
SELECT
  name AS 分类名称，
  slug AS 标识，
  description AS 描述
FROM skill_categories
WHERE is_active = true
ORDER BY sort_order;

-- ====================================================================
-- 预期结果分析
-- ====================================================================

-- 如果结果为 0:
-- ✅ 说明数据库中还没有任何 Skill 数据
-- ✅ 需要创建测试数据或等待用户通过后台创建

-- 如果有数据:
-- ✅ 可以通过第 4 条查询看到具体的 Skill
-- ✅ 可以在管理后台查看和管理

-- ====================================================================
-- 创建测试数据（可选）
-- ====================================================================
-- 如果需要创建测试数据，取消下面的注释并执行：

/*
INSERT INTO skills (
  name,
  description,
  category,
  price,
  review_status,
  shelf_status,
  developer_id
) VALUES
(
  '测试 Skill - 订单查询',
  '这是一个用于测试的订单查询技能',
  'order-management',
  99.00,
  'approved',
  'on_shelf',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  '测试 Skill - 库存管理',
  '这是一个用于测试的库存管理技能',
  'warehouse-management',
  199.00,
  'approved',
  'on_shelf',
  (SELECT id FROM auth.users LIMIT 1)
);
*/
