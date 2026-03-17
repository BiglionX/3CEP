-- =====================================================
-- 有奖问答系统数据表定义
-- =====================================================

-- 问答活动表
CREATE TABLE IF NOT EXISTS reward_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  reward_type VARCHAR(20) DEFAULT 'fcx', -- fcx: FCX奖励, physical: 实物奖励, both: 混合奖励
  reward_amount DECIMAL(10,2) DEFAULT 0,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  max_participants INTEGER DEFAULT 100,
  current_participants INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft', -- draft: 草稿, active: 进行中, ended: 已结束, closed: 已关闭
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 问答题目表（每个活动中的具体题目）
CREATE TABLE IF NOT EXISTS reward_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES reward_activities(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) DEFAULT 'single', -- single: 单选, multiple: 多选, text: 文本
  options JSONB, -- 选项列表，如: [{"label": "A", "value": "option1", "isCorrect": true}]
  correct_answer TEXT NOT NULL, -- 正确答案
  explanation TEXT, -- 答案解析
  points INTEGER DEFAULT 10, -- 题目的分值
  sort_order INTEGER DEFAULT 0, -- 排序
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户答题记录表
CREATE TABLE IF NOT EXISTS user_reward_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES reward_activities(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES reward_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  points_earned INTEGER DEFAULT 0,
  reward_claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMP WITH TIME ZONE,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_reward_activities_enterprise ON reward_activities(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_reward_activities_status ON reward_activities(status);
CREATE INDEX IF NOT EXISTS idx_reward_questions_activity ON reward_questions(activity_id);
CREATE INDEX IF NOT EXISTS idx_user_reward_answers_activity ON user_reward_answers(activity_id);
CREATE INDEX IF NOT EXISTS idx_user_reward_answers_user ON user_reward_answers(user_id);
