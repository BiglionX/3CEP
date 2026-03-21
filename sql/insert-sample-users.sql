-- ============================================================================
-- 多类型用户管理 - 示例数据插入脚本
-- ============================================================================
-- 说明：为演示和测试目的创建各种类型的用户示例
-- 执行方式：在 Supabase Dashboard -> SQL Editor 中执行
-- ============================================================================

-- ============================================================================
-- 1. 插入个人用户（Individual Users）
-- ============================================================================

-- 个人用户 1: 张三
INSERT INTO user_accounts (
  user_id, user_type, account_type, email, phone, avatar_url,
  status, is_verified, verification_status,
  subscription_plan, role, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'individual', 'individual',
  'zhangsan@example.com', '13800138001',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
  'active', true, 'verified',
  'free', 'viewer',
  NOW() - INTERVAL '30 days', NOW()
);

-- 获取刚插入的用户 ID
DO $$
DECLARE
  v_user_id UUID;
  v_account_id UUID;
BEGIN
  SELECT id, user_id INTO v_account_id, v_user_id
  FROM user_accounts
  WHERE email = 'zhangsan@example.com';

  -- 插入个人用户详情
  INSERT INTO individual_users (
    user_account_id, first_name, last_name, nickname, gender, birthday,
    address, city, province, country, postal_code,
    membership_level, membership_points, created_at, updated_at
  ) VALUES (
    v_account_id, '三', '张', '小张', 'male', '1990-05-15',
    '北京市朝阳区建国路 100 号', '北京', '北京', 'China', '100000',
    3, 1500, NOW(), NOW()
  );
END $$;


-- 个人用户 2: 李四
INSERT INTO user_accounts (
  user_id, user_type, account_type, email, phone, avatar_url,
  status, is_verified, verification_status,
  subscription_plan, role, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'individual', 'individual',
  'lisi@example.com', '13800138002',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
  'active', true, 'verified',
  'basic', 'viewer',
  NOW() - INTERVAL '20 days', NOW()
);

DO $$
DECLARE
  v_account_id UUID;
BEGIN
  SELECT id INTO v_account_id FROM user_accounts WHERE email = 'lisi@example.com';

  INSERT INTO individual_users (
    user_account_id, first_name, last_name, nickname, gender,
    address, city, province, country,
    membership_level, membership_points
  ) VALUES (
    v_account_id, '四', '李', '小李', 'female',
    '上海市浦东新区世纪大道 200 号', '上海', '上海', 'China',
    2, 800
  );
END $$;


-- 个人用户 3: 王五（待审核）
INSERT INTO user_accounts (
  user_id, user_type, account_type, email, phone,
  status, is_verified, verification_status,
  subscription_plan, role, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'individual', 'individual',
  'wangwu@example.com', '13800138003',
  'pending', false, 'pending',
  'free', 'viewer',
  NOW() - INTERVAL '5 days', NOW()
);

DO $$
DECLARE
  v_account_id UUID;
BEGIN
  SELECT id INTO v_account_id FROM user_accounts WHERE email = 'wangwu@example.com';

  INSERT INTO individual_users (
    user_account_id, first_name, last_name, gender
  ) VALUES (
    v_account_id, '五', '王', 'male'
  );
END $$;


-- ============================================================================
-- 2. 插入维修店用户（Repair Shop Users）
-- ============================================================================

-- 维修店 1: 诚信手机维修店
INSERT INTO user_accounts (
  user_id, user_type, account_type, email, phone, avatar_url,
  status, is_verified, verification_status,
  subscription_plan, role, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'repair_shop', 'repair_shop',
  '诚信维修@example.com', '13800138010',
  'https://api.dicebear.com/7.x/shapes/svg?seed=chengxin',
  'active', true, 'verified',
  'professional', 'shop_manager',
  NOW() - INTERVAL '60 days', NOW()
);

DO $$
DECLARE
  v_account_id UUID;
BEGIN
  SELECT id INTO v_account_id FROM user_accounts WHERE email = '诚信维修@example.com';

  INSERT INTO repair_shop_users_detail (
    user_account_id, shop_name, shop_type, registration_number, tax_id,
    shop_description, specialties, services,
    contact_email, contact_phone, address, city, province, country,
    logo_url, certification_level, business_hours, service_areas
  ) VALUES (
    v_account_id, '诚信手机维修店', 'independent', '91110000XXXXXXXXXX', '91110000XXXXXXXXXX',
    '专业手机维修服务，10 年经验', ARRAY['手机维修', '平板维修', '电脑维修'], ARRAY['屏幕更换', '电池更换', '主板维修'],
    'service@chengxin.com', '13800138010', '北京市朝阳区中关村大街 1 号', '北京', '北京', 'China',
    'https://api.dicebear.com/7.x/shapes/svg?seed=chengxin', 4,
    '{"monday": "09:00-18:00", "tuesday": "09:00-18:00", "wednesday": "09:00-18:00"}',
    ARRAY['朝阳区', '海淀区', '东城区']
  );
END $$;


-- 维修店 2: 快速家电维修中心
INSERT INTO user_accounts (
  user_id, user_type, account_type, email, phone,
  status, is_verified, verification_status,
  subscription_plan, role, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'repair_shop', 'repair_shop',
  '快速家电@example.com', '13800138011',
  'active', true, 'verified',
  'basic', 'shop_manager',
  NOW() - INTERVAL '45 days', NOW()
);

DO $$
DECLARE
  v_account_id UUID;
BEGIN
  SELECT id INTO v_account_id FROM user_accounts WHERE email = '快速家电@example.com';

  INSERT INTO repair_shop_users_detail (
    user_account_id, shop_name, shop_type,
    shop_description, specialties, services,
    address, city, province, certification_level
  ) VALUES (
    v_account_id, '快速家电维修中心', 'franchise',
    '专注家电维修 20 年', ARRAY['空调维修', '冰箱维修', '洗衣机维修'], ARRAY['上门维修', '到店维修'],
    '上海市浦东新区陆家嘴路 100 号', '上海', '上海', 3
  );
END $$;


-- 维修店 3: 小李快修（审核中）
INSERT INTO user_accounts (
  user_id, user_type, account_type, email, phone,
  status, is_verified, verification_status,
  subscription_plan, role, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'repair_shop', 'repair_shop',
  'xiaoli@example.com', '13800138012',
  'pending', false, 'under_review',
  'free', 'shop_manager',
  NOW() - INTERVAL '3 days', NOW()
);

DO $$
DECLARE
  v_account_id UUID;
BEGIN
  SELECT id INTO v_account_id FROM user_accounts WHERE email = 'xiaoli@example.com';

  INSERT INTO repair_shop_users_detail (
    user_account_id, shop_name, shop_type,
    shop_description
  ) VALUES (
    v_account_id, '小李快修', 'mobile_service',
    '上门服务，快速响应'
  );
END $$;


-- ============================================================================
-- 3. 插入企业用户（Enterprise Users - 工厂/供应商）
-- ============================================================================

-- 企业 1: 深圳电子科技有限公司（工厂）
INSERT INTO user_accounts (
  user_id, user_type, account_type, email, phone, avatar_url,
  status, is_verified, verification_status,
  subscription_plan, role, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'enterprise', 'factory',
  'sz-electronics@example.com', '13800138020',
  'https://api.dicebear.com/7.x/identicon/svg?seed=szelectronics',
  'active', true, 'verified',
  'enterprise', 'manager',
  NOW() - INTERVAL '90 days', NOW()
);

DO $$
DECLARE
  v_account_id UUID;
BEGIN
  SELECT id INTO v_account_id FROM user_accounts WHERE email = 'sz-electronics@example.com';

  INSERT INTO enterprise_users_detail (
    user_account_id, company_name, business_type, registration_number, tax_id,
    company_description, industry, employee_count, annual_revenue,
    procurement_categories, main_products, target_markets,
    contact_email, contact_phone, contact_person, address, city, province,
    website_url, iso_cert_url
  ) VALUES (
    v_account_id, '深圳电子科技有限公司', 'manufacturer', '91440300XXXXXXXXXX', '91440300XXXXXXXXXX',
    '专业从事电子产品研发和生产', '电子/半导体', '500-1000', '5000 万 -1 亿',
    ARRAY['电子元器件', '集成电路', 'PCB 板'], ARRAY['手机芯片', '电源管理 IC', '传感器'],
    ARRAY['中国大陆', '东南亚', '欧洲'],
    'info@szelectronics.com', '13800138020', '张经理',
    '深圳市南山区科技园南路 100 号', '深圳', '广东',
    'https://www.szelectronics.com',
    'https://example.com/certs/iso9001.pdf'
  );
END $$;


-- 企业 2: 上海贸易有限公司（供应商）
INSERT INTO user_accounts (
  user_id, user_type, account_type, email, phone,
  status, is_verified, verification_status,
  subscription_plan, role, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'enterprise', 'supplier',
  'sh-trading@example.com', '13800138021',
  'active', true, 'verified',
  'professional', 'manager',
  NOW() - INTERVAL '75 days', NOW()
);

DO $$
DECLARE
  v_account_id UUID;
BEGIN
  SELECT id INTO v_account_id FROM user_accounts WHERE email = 'sh-trading@example.com';

  INSERT INTO enterprise_users_detail (
    user_account_id, company_name, business_type,
    company_description, industry, employee_count,
    procurement_categories, main_products,
    contact_email, contact_phone, contact_person,
    address, city, province
  ) VALUES (
    v_account_id, '上海贸易有限公司', 'supplier',
    '专业的电子元器件供应商', '贸易/分销', '100-500',
    ARRAY['电子元器件', '连接器', '线缆'], ARRAY['电阻', '电容', '电感'],
    'sales@shtrading.com', '13800138021', '李经理',
    '上海市黄浦区南京东路 200 号', '上海', '上海'
  );
END $$;


-- 企业 3: 北京智能科技公司（审核中）
INSERT INTO user_accounts (
  user_id, user_type, account_type, email, phone,
  status, is_verified, verification_status,
  subscription_plan, role, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'enterprise', 'factory',
  'bj-smart@example.com', '13800138022',
  'pending', false, 'under_review',
  'enterprise', 'manager',
  NOW() - INTERVAL '7 days', NOW()
);

DO $$
DECLARE
  v_account_id UUID;
BEGIN
  SELECT id INTO v_account_id FROM user_accounts WHERE email = 'bj-smart@example.com';

  INSERT INTO enterprise_users_detail (
    user_account_id, company_name, business_type,
    company_description, industry
  ) VALUES (
    v_account_id, '北京智能科技公司', 'manufacturer',
    '人工智能硬件创新企业', '科技/智能硬件'
  );
END $$;


-- ============================================================================
-- 4. 插入外贸公司用户（Foreign Trade Companies）
-- ============================================================================

-- 外贸公司 1: 广州国际贸易有限公司
INSERT INTO user_accounts (
  user_id, user_type, account_type, email, phone, avatar_url,
  status, is_verified, verification_status,
  subscription_plan, role, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'foreign_trade_company', 'foreign_trade',
  'gz-intl@example.com', '13800138030',
  'https://api.dicebear.com/7.x/identicon/svg?seed=gzintl',
  'active', true, 'verified',
  'enterprise', 'manager',
  NOW() - INTERVAL '120 days', NOW()
);

DO $$
DECLARE
  v_account_id UUID;
BEGIN
  SELECT id INTO v_account_id FROM user_accounts WHERE email = 'gz-intl@example.com';

  INSERT INTO enterprise_users_detail (
    user_account_id, company_name, business_type,
    company_description, industry, employee_count, annual_revenue,
    procurement_categories, main_products, target_markets,
    contact_email, contact_phone, contact_person,
    address, city, province, country,
    website_url, social_media
  ) VALUES (
    v_account_id, '广州国际贸易有限公司', 'foreign_trade',
    '专业进出口贸易服务', '国际贸易', '200-500', '1 亿 -5 亿',
    ARRAY['电子产品', '机械设备', '纺织品'], ARRAY['手机', '电脑配件', '家用电器'],
    ARRAY['北美', '欧洲', '中东', '东南亚'],
    'export@gzintl.com', '13800138030', '王经理',
    '广州市天河区珠江新城花城大道 100 号', '广州', '广东', 'China',
    'https://www.gzintl.com',
    '{"linkedin": "https://linkedin.com/company/gzintl", "wechat": "gzintl"}'
  );
END $$;


-- 外贸公司 2: 宁波出口贸易公司
INSERT INTO user_accounts (
  user_id, user_type, account_type, email, phone,
  status, is_verified, verification_status,
  subscription_plan, role, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'foreign_trade_company', 'foreign_trade',
  'nb-export@example.com', '13800138031',
  'active', true, 'verified',
  'professional', 'manager',
  NOW() - INTERVAL '80 days', NOW()
);

DO $$
DECLARE
  v_account_id UUID;
BEGIN
  SELECT id INTO v_account_id FROM user_accounts WHERE email = 'nb-export@example.com';

  INSERT INTO enterprise_users_detail (
    user_account_id, company_name, business_type,
    company_description, industry,
    main_products, target_markets,
    contact_email, contact_phone, contact_person,
    address, city, province
  ) VALUES (
    v_account_id, '宁波出口贸易公司', 'foreign_trade',
    '专注欧美市场出口业务', '贸易/出口',
    ARRAY['五金工具', '家居用品', '汽摩配件'], ARRAY['北美', '欧洲', '南美'],
    'sales@nbexport.com', '13800138031', '陈经理',
    '宁波市海曙区中山西路 300 号', '宁波', '浙江'
  );
END $$;


-- ============================================================================
-- 5. 更新统计数据视图（刷新物化视图，如果是物化视图的话）
-- ============================================================================

-- 查询统计信息
SELECT
  '数据统计' as 类别，
  total_users as "总用户数",
  individual_count as "个人用户",
  repair_shop_count as "维修店",
  enterprise_count as "企业用户",
  foreign_trade_count as "外贸公司"
FROM user_stats_view;


-- ============================================================================
-- 6. 验证插入的数据
-- ============================================================================

-- 显示所有插入的用户
SELECT
  user_type as "用户类型",
  account_type as "账户类型",
  email as "邮箱",
  status as "状态",
  is_verified as "已认证",
  subscription_plan as "订阅计划",
  role as "角色",
  created_at as "创建时间"
FROM user_accounts
WHERE email LIKE '%example.com'
ORDER BY created_at DESC;


-- ============================================================================
-- 完成提示
-- ============================================================================

SELECT '✅ 示例数据插入完成！' as 状态，
       COUNT(*) as "插入的用户总数"
FROM user_accounts
WHERE email LIKE '%example.com';
