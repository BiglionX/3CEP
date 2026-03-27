-- ====================================================================
-- Skills 商店冷启动数据 - 开源 Skill 集合
-- ====================================================================
-- 用途：为 Skills 商店添加初始测试数据
-- 来源：基于常见的开源工具和服务
-- 执行方式：在 Supabase SQL Editor 中运行

-- ====================================================================
-- 第一部分：插入示例 Skills（10 个实用技能）
-- ====================================================================

INSERT INTO skills (
  id,
  name,
  title,
  description,
  category,
  price,
  review_status,
  shelf_status,
  developer_id,
  created_at,
  updated_at
) VALUES
  -- 1. 二维码生成器
  (
    gen_random_uuid(),
    'QR Code 生成器',
    '免费在线二维码生成器 - 快速创建 QR Code',
    '快速生成二维码，支持文本、URL、联系方式等多种格式。基于开源项目 qrcode.js 实现。',
    'tools-productivity',
    0.00,
    'approved',
    'on_shelf',
    NULL,
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '30 days'
  ),

  -- 2. Markdown 转换器
  (
    gen_random_uuid(),
    'Markdown 转换器',
    'Markdown 转 HTML/PDF/Word - 在线格式转换工具',
    '将 Markdown 文档转换为 HTML、PDF、Word 等格式。支持语法高亮和自定义样式。',
    'tools-productivity',
    29.00,
    'approved',
    'on_shelf',
    NULL,
    NOW() - INTERVAL '28 days',
    NOW() - INTERVAL '28 days'
  ),

  -- 3. 图片压缩工具
  (
    gen_random_uuid(),
    '智能图片压缩',
    'AI 在线图片压缩 - 无损缩小 JPG/PNG 文件',
    'AI 驱动的图片压缩工具，在保持画质的同时大幅减小文件体积。支持批量处理。',
    'data-analytics',
    49.00,
    'approved',
    'on_shelf',
    NULL,
    NOW() - INTERVAL '25 days',
    NOW() - INTERVAL '25 days'
  ),

  -- 4. 邮件验证服务
  (
    gen_random_uuid(),
    '邮箱地址验证',
    '邮箱批量验证工具 - 检测 Email 有效性',
    '验证邮箱地址的有效性和可达性，减少邮件退回率。支持批量验证。',
    'information-query',
    99.00,
    'approved',
    'on_shelf',
    NULL,
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '20 days'
  ),

  -- 5. 天气查询 API
  (
    gen_random_uuid(),
    '全球天气查询',
    '实时天气预报查询 - 全球城市天气数据',
    '提供全球主要城市的实时天气数据、预报和预警信息。数据来源 OpenWeatherMap。',
    'information-query',
    19.00,
    'approved',
    'on_shelf',
    NULL,
    NOW() - INTERVAL '18 days',
    NOW() - INTERVAL '18 days'
  ),

  -- 6. PDF 合并工具
  (
    gen_random_uuid(),
    'PDF 合并与分割',
    '在线 PDF 合并分割工具 - 免费编辑 PDF 文件',
    '在线合并多个 PDF 文件，或将一个 PDF 分割成多个文件。完全本地处理，保护隐私。',
    'tools-productivity',
    39.00,
    'approved',
    'on_shelf',
    NULL,
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '15 days'
  ),

  -- 7. 汇率转换
  (
    gen_random_uuid(),
    '实时汇率转换',
    '在线货币转换器 - 160+ 国家汇率换算',
    '支持 160+ 种货币的实时汇率查询和转换。数据每小时更新。',
    'finance',
    0.00,
    'approved',
    'on_shelf',
    NULL,
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '12 days'
  ),

  -- 8. 密码生成器
  (
    gen_random_uuid(),
    '强密码生成器',
    '高强度随机密码生成工具 - 安全密码制作器',
    '生成高强度的随机密码，支持自定义长度和字符类型。符合安全最佳实践。',
    'tools-productivity',
    0.00,
    'approved',
    'on_shelf',
    NULL,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '10 days'
  ),

  -- 9. URL 缩短服务
  (
    gen_random_uuid(),
    '短链接生成器',
    '免费短链接生成 - URL 缩短工具带统计功能',
    '将长 URL 转换为短链接，支持自定义后缀和访问统计。',
    'tools-productivity',
    9.90,
    'approved',
    'on_shelf',
    NULL,
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days'
  ),

  -- 10. 待办事项管理
  (
    gen_random_uuid(),
    '智能待办清单',
    '免费待办事项管理工具 - 任务提醒 APP',
    '简洁高效的待办事项管理工具，支持提醒、重复任务和优先级设置。',
    'tools-productivity',
    0.00,
    'approved',
    'on_shelf',
    NULL,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
  )

ON CONFLICT DO NOTHING;

-- ====================================================================
-- 第二部分：插入 Skill 标签
-- ====================================================================

INSERT INTO skill_tags (name, name_en, description, category) VALUES
  ('免费', 'free', '免费使用的技能', 'pricing'),
  ('效率工具', 'productivity', '提升工作效率的工具', 'category'),
  ('数据处理', 'data-processing', '数据处理和转换', 'function'),
  ('AI 驱动', 'ai-powered', '使用人工智能技术', 'technology'),
  ('批量处理', 'batch-processing', '支持批量操作', 'function'),
  ('API 集成', 'api-integration', '提供 API 接口', 'technology'),
  ('隐私保护', 'privacy-focused', '注重用户隐私保护', 'feature'),
  ('开源', 'open-source', '基于开源项目', 'license')
ON CONFLICT (name) DO NOTHING;

-- ====================================================================
-- 第三部分：插入 Skill 文档（使用指南）
-- ====================================================================

INSERT INTO skill_documents (skill_id, category, title, content, order_index, is_published)
SELECT
  s.id,
  'guide',
  '快速开始指南',
  '# ' || s.name || E'\n\n## 功能介绍\n\n' || s.description || E'\n\n## 使用步骤\n\n1. 登录系统后访问此技能\n2. 根据提示输入必要参数\n3. 点击“执行”按钮\n4. 查看结果\n\n## 注意事项\n\n- 请确保输入的数据格式正确\n- 部分功能可能需要付费订阅\n- 如有问题请联系客服',
  1,
  true
FROM skills s
WHERE s.name IN (
  'QR Code 生成器',
  'Markdown 转换器',
  '智能图片压缩',
  '邮箱地址验证',
  '全球天气查询',
  'PDF 合并与分割',
  '实时汇率转换',
  '强密码生成器',
  '短链接生成器',
  '智能待办清单'
)
ON CONFLICT DO NOTHING;

-- ====================================================================
-- 第四部分：插入 Skill 评论（模拟用户反馈）
-- ====================================================================

INSERT INTO skill_reviews (skill_id, user_id, rating, title, content, is_approved)
SELECT
  s.id,
  (SELECT id FROM auth.users ORDER BY RANDOM() LIMIT 1),
  CASE
    WHEN s.price = 0 THEN 5  -- 免费技能评分较高
    ELSE 4
  END,
  CASE s.name
    WHEN 'QR Code 生成器' THEN '非常好用的二维码生成工具，简单快捷！'
    WHEN 'Markdown 转换器' THEN '转换效果不错，节省了很多时间'
    WHEN '智能图片压缩' THEN '压缩比很高，画质损失很小'
    WHEN '邮箱地址验证' THEN '准确率挺高的，减少了邮件退回'
    WHEN '全球天气查询' THEN '数据准确，更新及时'
    WHEN 'PDF 合并与分割' THEN '操作简单，功能实用'
    WHEN '实时汇率转换' THEN '汇率更新及时，很方便'
    WHEN '强密码生成器' THEN '生成的密码很安全，推荐使用'
    WHEN '短链接生成器' THEN '链接稳定，还有统计功能'
    WHEN '智能待办清单' THEN '界面简洁，功能够用'
    ELSE '不错的技能'
  END,
  CASE s.name
    WHEN 'QR Code 生成器' THEN '功能强大，支持多种格式，生成速度快。非常适合需要频繁创建二维码的用户。'
    WHEN 'Markdown 转换器' THEN '支持导出 PDF、HTML、Word 等多种格式，语法高亮很实用。'
    WHEN '智能图片压缩' THEN 'AI 压缩算法确实厉害，文件小了 80% 但肉眼几乎看不出区别。'
    WHEN '邮箱地址验证' THEN '批量验证功能很好用，清理了不少无效邮箱，节省了邮件预算。'
    WHEN '全球天气查询' THEN '数据源可靠，预报准确，而且更新很及时。'
    WHEN 'PDF 合并与分割' THEN '完全本地处理，不用担心隐私泄露，速度也很快。'
    WHEN '实时汇率转换' THEN '覆盖货币种类多，汇率更新频率高，出国旅游必备。'
    WHEN '强密码生成器' THEN '可以自定义长度和字符类型，生成的密码真的很安全。'
    WHEN '短链接生成器' THEN '支持自定义后缀，还有访问统计，做营销很有用。'
    WHEN '智能待办清单' THEN '没有花哨的功能，就是简单的待办管理，正好是我需要的。'
    ELSE '功能实用，值得推荐。'
  END,
  true  -- 标记为已审核
FROM skills s
WHERE s.review_status = 'approved' AND s.shelf_status = 'on_shelf'
ORDER BY RANDOM()
LIMIT 15
ON CONFLICT DO NOTHING;

-- ====================================================================
-- 第五部分：统计数据验证
-- ====================================================================

-- 显示插入结果
DO $$
DECLARE
  v_total_skills INTEGER;
  v_approved_skills INTEGER;
  v_on_shelf_skills INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total_skills FROM skills;
  SELECT COUNT(*) INTO v_approved_skills FROM skills WHERE review_status = 'approved';
  SELECT COUNT(*) INTO v_on_shelf_skills FROM skills WHERE shelf_status = 'on_shelf';

  RAISE NOTICE '=====================================';
  RAISE NOTICE 'Skills 冷启动数据导入完成!';
  RAISE NOTICE '=====================================';
  RAISE NOTICE '总 Skill 数：%', v_total_skills;
  RAISE NOTICE '已审核通过：%', v_approved_skills;
  RAISE NOTICE '已上架：% ', v_on_shelf_skills;
  RAISE NOTICE '=====================================';
END $$;

-- ====================================================================
-- 第六部分：查询验证（可选执行）
-- ====================================================================

-- 查看所有 Skills
-- SELECT id, name, category, price, review_status, shelf_status
-- FROM skills
-- ORDER BY created_at DESC;

-- 按分类统计
-- SELECT category, COUNT(*) as count, AVG(price) as avg_price
-- FROM skills
-- GROUP BY category
-- ORDER BY count DESC;

-- ====================================================================
-- 说明
-- ====================================================================
--
-- 这些 Skills 的特点:
-- 1. 都是实用性强的常见工具
-- 2. 基于真实的开源项目或服务
-- 3. 包含免费和付费两种模式
-- 4. 覆盖了多个分类
-- 5. 有完整的文档和评论
--
-- 下一步建议:
-- 1. 访问 /admin/skill-store 查看列表
-- 2. 点击 Skill 名称查看详情
-- 3. 测试各项功能
-- 4. 根据需要修改或补充
--
-- ====================================================================
