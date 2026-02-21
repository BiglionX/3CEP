-- FCX智能推荐引擎数据库表结构
-- 创建时间: 2026-02-19
-- 版本: 1.0.0

-- 1. 用户行为表
CREATE TABLE IF NOT EXISTS user_behaviors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id VARCHAR(255) NOT NULL,
  item_type VARCHAR(50) NOT NULL, -- repair_shop, part, service, device, accessory
  action_type VARCHAR(50) NOT NULL, -- view, search, purchase, repair, bookmark, compare, share, comment
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  score DECIMAL(5,2) DEFAULT 1.0, -- 行为权重分数 0.0-5.0
  context JSONB, -- 上下文信息（位置、设备等）
  metadata JSONB, -- 额外元数据
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 用户画像表
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  demographics JSONB, -- 人口统计信息
  preferences JSONB, -- 用户偏好
  behavior_summary JSONB, -- 行为摘要
  engagement_level VARCHAR(20) DEFAULT 'medium', -- low, medium, high
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 物品画像表
CREATE TABLE IF NOT EXISTS item_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id VARCHAR(255) UNIQUE NOT NULL,
  item_type VARCHAR(50) NOT NULL, -- repair_shop, part, service, device, accessory
  basic_info JSONB, -- 基础信息
  features JSONB, -- 特征信息
  statistics JSONB, -- 统计信息
  location JSONB, -- 地理位置信息
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 推荐结果表
CREATE TABLE IF NOT EXISTS recommendation_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context JSONB, -- 推荐上下文
  items JSONB, -- 推荐结果
  algorithm VARCHAR(100), -- 使用的算法
  generation_time TIMESTAMP WITH TIME ZONE,
  processing_time_ms INTEGER,
  metadata JSONB, -- 元数据
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 推荐反馈表
CREATE TABLE IF NOT EXISTS recommendation_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_id UUID NOT NULL,
  item_id VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5), -- 评分 1-5
  feedback_type VARCHAR(50) NOT NULL, -- click, purchase, skip, dislike, explicit
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB, -- 额外信息
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. A/B测试配置表
CREATE TABLE IF NOT EXISTS ab_test_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id VARCHAR(100) UNIQUE NOT NULL,
  config JSONB NOT NULL, -- 测试配置
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. A/B测试结果表
CREATE TABLE IF NOT EXISTS ab_test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id VARCHAR(100) NOT NULL,
  variant_id VARCHAR(50) NOT NULL,
  metrics JSONB NOT NULL, -- 测试指标
  sample_size INTEGER NOT NULL,
  statistical_significance BOOLEAN DEFAULT false,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_behaviors_user_id ON user_behaviors(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behaviors_item_id ON user_behaviors(item_id);
CREATE INDEX IF NOT EXISTS idx_user_behaviors_timestamp ON user_behaviors(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_behaviors_action_type ON user_behaviors(action_type);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_engagement_level ON user_profiles(engagement_level);

CREATE INDEX IF NOT EXISTS idx_item_profiles_item_id ON item_profiles(item_id);
CREATE INDEX IF NOT EXISTS idx_item_profiles_item_type ON item_profiles(item_type);

CREATE INDEX IF NOT EXISTS idx_recommendation_results_user_id ON recommendation_results(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_results_request_id ON recommendation_results(request_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_results_created_at ON recommendation_results(created_at);

CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_user_id ON recommendation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_recommendation_id ON recommendation_feedback(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_timestamp ON recommendation_feedback(timestamp);

CREATE INDEX IF NOT EXISTS idx_ab_test_configs_experiment_id ON ab_test_configs(experiment_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_configs_is_active ON ab_test_configs(is_active);

CREATE INDEX IF NOT EXISTS idx_ab_test_results_experiment_id ON ab_test_results(experiment_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_results_recorded_at ON ab_test_results(recorded_at);

-- 创建复合索引
CREATE INDEX IF NOT EXISTS idx_user_behaviors_user_item ON user_behaviors(user_id, item_id);
CREATE INDEX IF NOT EXISTS idx_user_behaviors_user_action ON user_behaviors(user_id, action_type);
CREATE INDEX IF NOT EXISTS idx_recommendation_results_user_algorithm ON recommendation_results(user_id, algorithm);

-- 添加表注释
COMMENT ON TABLE user_behaviors IS '用户行为记录表，用于推荐算法训练';
COMMENT ON TABLE user_profiles IS '用户画像表，存储用户偏好和特征';
COMMENT ON TABLE item_profiles IS '物品画像表，存储物品特征和统计信息';
COMMENT ON TABLE recommendation_results IS '推荐结果记录表，用于效果分析';
COMMENT ON TABLE recommendation_feedback IS '推荐反馈表，用于模型优化';
COMMENT ON TABLE ab_test_configs IS 'A/B测试配置表';
COMMENT ON TABLE ab_test_results IS 'A/B测试结果表';

COMMENT ON COLUMN user_behaviors.score IS '行为权重分数，影响推荐算法';
COMMENT ON COLUMN user_behaviors.context IS '行为发生时的上下文信息';
COMMENT ON COLUMN user_profiles.engagement_level IS '用户参与度等级：low/medium/high';
COMMENT ON COLUMN recommendation_results.processing_time_ms IS '推荐生成耗时（毫秒）';
COMMENT ON COLUMN recommendation_feedback.feedback_type IS '反馈类型：click/purchase/skip/dislike/explicit';

-- RLS策略设置
ALTER TABLE user_behaviors ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_results ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的行为数据
CREATE POLICY "Users can view own behaviors" ON user_behaviors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own behaviors" ON user_behaviors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能访问自己的画像
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- 物品画像公开可读
CREATE POLICY "Public read access to item profiles" ON item_profiles
  FOR SELECT USING (true);

-- 推荐结果访问控制
CREATE POLICY "Users can view own recommendations" ON recommendation_results
  FOR SELECT USING (auth.uid() = user_id);

-- 反馈数据访问控制
CREATE POLICY "Users can insert feedback" ON recommendation_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own feedback" ON recommendation_feedback
  FOR SELECT USING (auth.uid() = user_id);

-- A/B测试配置管理（仅管理员）
CREATE POLICY "Admin manage ab test configs" ON ab_test_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles_ext 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- A/B测试结果查看（仅管理员）
CREATE POLICY "Admin view ab test results" ON ab_test_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles_ext 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 创建视图：用户行为分析
CREATE OR REPLACE VIEW user_behavior_analysis AS
SELECT 
  ub.user_id,
  COUNT(*) as total_actions,
  COUNT(DISTINCT ub.item_id) as unique_items,
  COUNT(DISTINCT DATE(ub.timestamp)) as active_days,
  AVG(ub.score) as avg_action_score,
  STRING_AGG(DISTINCT ub.action_type, ',') as action_types,
  MAX(ub.timestamp) as last_activity,
  MIN(ub.timestamp) as first_activity
FROM user_behaviors ub
WHERE ub.timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY ub.user_id;

-- 创建视图：热门物品统计
CREATE OR REPLACE VIEW popular_items AS
SELECT 
  ib.item_id,
  ib.item_type,
  COUNT(*) as interaction_count,
  COUNT(DISTINCT ib.user_id) as unique_users,
  AVG(ib.score) as avg_score,
  MAX(ib.timestamp) as last_interaction
FROM user_behaviors ib
WHERE ib.timestamp >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY ib.item_id, ib.item_type
ORDER BY interaction_count DESC
LIMIT 100;

-- 创建视图：推荐效果分析
CREATE OR REPLACE VIEW recommendation_performance AS
SELECT 
  rr.algorithm,
  COUNT(*) as total_recommendations,
  AVG(jsonb_array_length(rr.items)) as avg_items_per_request,
  COUNT(DISTINCT rr.user_id) as unique_users,
  AVG(rr.processing_time_ms) as avg_processing_time
FROM recommendation_results rr
WHERE rr.created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY rr.algorithm;

-- 添加一些示例数据（可选）
-- INSERT INTO ab_test_configs (experiment_id, config, start_date, end_date) VALUES
-- ('rec_alg_v1', '{"variants":[{"variant_id":"A","algorithm":"collaborative_only","weight":0.5},{"variant_id":"B","algorithm":"hybrid_balanced","weight":0.5}],"metrics":["ctr","conversion_rate"]}', NOW(), NOW() + INTERVAL '30 days');