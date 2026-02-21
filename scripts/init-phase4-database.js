/**
 * 第四阶段数据库初始化脚本
 * 创建估值日志表和其他必要的监控表
 */

const { createClient } = require('@supabase/supabase-js');

// 从环境变量获取配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少Supabase配置信息');
  console.error('请确保设置了 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY 环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function initializeDatabase() {
  console.log('🚀 开始初始化第四阶段数据库...');
  
  try {
    // 创建估值日志表
    console.log('\n📋 创建估值日志表...');
    const { error: tableError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS valuation_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          device_qrcode_id TEXT NOT NULL,
          device_profile JSONB,
          condition_input JSONB,
          market_price NUMERIC,
          final_value NUMERIC NOT NULL,
          valuation_method TEXT NOT NULL,
          confidence_score NUMERIC(5,4),
          confidence_level TEXT,
          fusion_details JSONB,
          breakdown JSONB,
          alternatives JSONB,
          request_source TEXT,
          client_ip INET,
          user_agent TEXT,
          api_key_used TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          processing_time_ms INTEGER,
          metadata JSONB DEFAULT '{}',
          CONSTRAINT valid_confidence CHECK (confidence_score >= 0 AND confidence_score <= 1),
          CONSTRAINT valid_method CHECK (valuation_method IN ('ml', 'market', 'rule', 'hybrid', 'fused'))
        );

        CREATE INDEX IF NOT EXISTS idx_valuation_logs_device_qrcode ON valuation_logs(device_qrcode_id);
        CREATE INDEX IF NOT EXISTS idx_valuation_logs_created_at ON valuation_logs(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_valuation_logs_method ON valuation_logs(valuation_method);
        CREATE INDEX IF NOT EXISTS idx_valuation_logs_confidence ON valuation_logs(confidence_score);
        
        ALTER TABLE valuation_logs ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Admins can view all valuation logs" ON valuation_logs
        FOR SELECT TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
          )
        );
      `
    });
    
    if (tableError) {
      console.log('⚠️  表创建可能遇到问题:', tableError.message);
    } else {
      console.log('✅ 估值日志表创建成功');
    }
    
    // 插入测试数据
    console.log('\n📋 插入测试数据...');
    const { error: insertError } = await supabase
      .from('valuation_logs')
      .insert([
        {
          device_qrcode_id: 'TEST-DEVICE-001',
          device_profile: {
            productModel: 'iPhone 14',
            brandName: 'Apple',
            productCategory: '手机'
          },
          condition_input: {
            screen: 'minor_scratches',
            battery: 'good',
            body: 'light_wear'
          },
          market_price: 4500,
          final_value: 3800,
          valuation_method: 'fused',
          confidence_score: 0.85,
          confidence_level: 'high',
          request_source: 'api',
          processing_time_ms: 120,
          metadata: { test_record: true }
        },
        {
          device_qrcode_id: 'TEST-DEVICE-002',
          device_profile: {
            productModel: 'Samsung Galaxy S23',
            brandName: 'Samsung',
            productCategory: '手机'
          },
          condition_input: {
            screen: 'perfect',
            battery: 'excellent',
            body: 'perfect'
          },
          market_price: 5200,
          final_value: 4600,
          valuation_method: 'market',
          confidence_score: 0.92,
          confidence_level: 'high',
          request_source: 'web',
          processing_time_ms: 85,
          metadata: { test_record: true }
        }
      ]);
    
    if (insertError) {
      console.log('⚠️  测试数据插入失败:', insertError.message);
    } else {
      console.log('✅ 测试数据插入成功');
    }
    
    // 验证表结构
    console.log('\n📋 验证表结构...');
    const { data: columns, error: verifyError } = await supabase
      .from('valuation_logs')
      .select('*')
      .limit(1);
    
    if (verifyError) {
      console.log('❌ 表验证失败:', verifyError.message);
      return false;
    }
    
    console.log('✅ 表结构验证通过');
    console.log(`📊 当前表中记录数: ${columns ? columns.length : 0}`);
    
    console.log('\n🎉 第四阶段数据库初始化完成！');
    return true;
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    return false;
  }
}

// 执行初始化
if (require.main === module) {
  initializeDatabase().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('初始化过程异常:', error);
    process.exit(1);
  });
}

module.exports = { initializeDatabase };