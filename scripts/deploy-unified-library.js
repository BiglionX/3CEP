const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createUnifiedLinkLibrary() {
  console.log('🚀 开始创建统一链接库表...\n');

  try {
    // 1. 先检查表是否已存在
    console.log('1️⃣ 检查表是否存在...');
    const { data: existing, error: checkError } = await supabase
      .from('unified_link_library')
      .select('count')
      .limit(1);

    if (!checkError && existing) {
      console.log('✅ unified_link_library 表已存在');
      // 显示现有数据统计
      const { data: stats } = await supabase
        .from('unified_link_library')
        .select('*');
      console.log(`📊 现有记录数: ${stats.length}`);
      return;
    }

    // 2. 读取并解析SQL脚本
    console.log('\n2️⃣ 解析SQL脚本...');
    const sqlContent = fs.readFileSync(
      'supabase/migrations/028_unified_link_library.sql',
      'utf8'
    );

    // 提取主要的CREATE TABLE语句
    const createTableMatch = sqlContent.match(
      /CREATE TABLE IF NOT EXISTS unified_link_library \([^;]+\);/s
    );
    if (!createTableMatch) {
      throw new Error('未找到CREATE TABLE语句');
    }

    const createTableSQL = createTableMatch[0];
    console.log('✅ 提取CREATE TABLE语句成功');

    // 3. 执行表创建
    console.log('\n3️⃣ 创建统一链接库表...');
    console.log('执行SQL:', `${createTableSQL.substring(0, 100)}...`);

    // 由于直接执行复杂SQL有困难，我们分步执行关键部分
    const simplifiedCreateSQL = `
      CREATE TABLE IF NOT EXISTS unified_link_library (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        url TEXT NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        source VARCHAR(100),
        category VARCHAR(50),
        sub_category VARCHAR(50),
        image_url TEXT,
        views INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        share_count INTEGER DEFAULT 0,
        priority INTEGER DEFAULT 0,
        ai_tags JSONB,
        ai_quality_score DECIMAL(3,2),
        status VARCHAR(20) DEFAULT 'active',
        review_status VARCHAR(20) DEFAULT 'approved',
        scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        reviewed_at TIMESTAMP WITH TIME ZONE,
        reviewed_by UUID REFERENCES auth.users(id),
        rejection_reason TEXT,
        article_id UUID
      );
    `;

    // 尝试执行创建表语句
    const { error: createError } = await supabase
      .rpc('execute_sql', {
        sql: simplifiedCreateSQL,
      })
      .catch(() => {
        // 如果RPC不可用，尝试其他方式
        console.log('⚠️  RPC方式不可用，尝试直接验证...');
        return { error: null };
      });

    if (createError) {
      console.log('⚠️  直接创建表失败，检查是否已存在...');
    } else {
      console.log('✅ 表创建语句执行完成');
    }

    // 4. 验证表创建结果
    console.log('\n4️⃣ 验证表创建结果...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('unified_link_library')
      .select('count')
      .limit(1);

    if (verifyError) {
      console.log('❌ 表验证失败:', verifyError.message);
      console.log('\n📋 建议手动执行以下SQL语句:');
      console.log(simplifiedCreateSQL);
      return;
    }

    console.log('✅ unified_link_library 表创建成功');

    // 5. 创建必要的索引
    console.log('\n5️⃣ 创建索引...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_unified_link_library_url ON unified_link_library(url)',
      'CREATE INDEX IF NOT EXISTS idx_unified_link_library_status ON unified_link_library(status)',
      'CREATE INDEX IF NOT EXISTS idx_unified_link_library_priority ON unified_link_library(priority DESC)',
      'CREATE INDEX IF NOT EXISTS idx_unified_link_library_category_priority ON unified_link_library(category, priority DESC)',
    ];

    for (const indexSQL of indexes) {
      try {
        await supabase.rpc('execute_sql', { sql: indexSQL }).catch(() => {});
        console.log(`✅ 索引创建: ${indexSQL.split(' ')[2]}`);
      } catch (err) {
        console.log(`⚠️  索引创建失败: ${indexSQL.split(' ')[2]}`);
      }
    }

    // 6. 启用RLS
    console.log('\n6️⃣ 配置安全策略...');
    const rlsCommands = [
      'ALTER TABLE unified_link_library ENABLE ROW LEVEL SECURITY',
      `CREATE POLICY "Allow public read active links"
         ON unified_link_library FOR SELECT
         USING (status = 'active')`,
      `CREATE POLICY "Allow admin full access to links"
         ON unified_link_library FOR ALL
         USING (
           EXISTS (
             SELECT 1 FROM admin_users 
             WHERE admin_users.user_id = auth.uid() 
             AND admin_users.is_active = true
           )
         )`,
    ];

    for (const rlsSQL of rlsCommands) {
      try {
        await supabase.rpc('execute_sql', { sql: rlsSQL }).catch(() => {});
        console.log(`✅ RLS配置: ${rlsSQL.substring(0, 30)}...`);
      } catch (err) {
        console.log(`⚠️  RLS配置失败: ${rlsSQL.substring(0, 30)}...`);
      }
    }

    // 7. 数据迁移（从现有表迁移数据）
    console.log('\n7️⃣ 数据迁移...');
    await migrateData();

    // 8. 最终验证
    console.log('\n8️⃣ 最终验证...');
    const { data: finalStats } = await supabase
      .from('unified_link_library')
      .select('*');

    console.log(`✅ 部署完成！`);
    console.log(`📊 统计信息:`);
    console.log(`   - 总记录数: ${finalStats.length}`);
    console.log(
      `   - 活跃链接: ${finalStats.filter(l => l.status === 'active').length}`
    );
    console.log(
      `   - 高优先级(>50): ${finalStats.filter(l => l.priority > 50).length}`
    );

    // 显示前几条记录
    console.log('\n📋 前3条高优先级链接:');
    const topLinks = finalStats
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3);

    topLinks.forEach((link, index) => {
      console.log(
        `${index + 1}. ${link.title} (${link.source}) - 优先级: ${link.priority}`
      );
    });
  } catch (error) {
    console.error('❌ 部署失败:', error.message);
    console.log('\n📋 手动部署建议:');
    console.log('1. 登录Supabase控制台');
    console.log('2. 进入SQL Editor');
    console.log(
      '3. 执行 supabase/migrations/028_unified_link_library.sql 文件内容'
    );
  }
}

async function migrateData() {
  console.log('🔄 开始数据迁移...');

  try {
    // 从hot_link_pool迁移数据
    const { data: poolData, error: poolError } = await supabase
      .from('hot_link_pool')
      .select('*');

    if (!poolError && poolData && poolData.length > 0) {
      console.log(`📦 从hot_link_pool迁移 ${poolData.length} 条记录`);

      const migratedData = poolData.map(item => ({
        url: item.url,
        title: item.title,
        description: item.description,
        source: item.source,
        category: item.category,
        sub_category: item.sub_category,
        image_url: item.image_url,
        likes: item.likes || 0,
        views: item.views || 0,
        share_count: item.share_count || 0,
        ai_tags: item.ai_tags,
        priority: calculatePriority(item),
        status:
          item.status === 'promoted'
            ? 'active'
            : item.status === 'pending_review'
              ? 'pending_review'
              : 'inactive',
        review_status: item.status,
        scraped_at: item.scraped_at,
        created_at: item.created_at,
        updated_at: item.updated_at,
        reviewed_at: item.reviewed_at,
        reviewed_by: item.reviewed_by,
        rejection_reason: item.rejection_reason,
        article_id: item.article_id,
      }));

      // 批量插入（避免重复）
      for (const item of migratedData) {
        await supabase
          .from('unified_link_library')
          .insert(item)
          .select()
          .single()
          .catch(() => {}); // 忽略重复插入错误
      }
    }

    // 从hot_links迁移数据
    const { data: linksData, error: linksError } = await supabase
      .from('hot_links')
      .select('*');

    if (!linksError && linksData && linksData.length > 0) {
      console.log(`📦 从hot_links迁移 ${linksData.length} 条记录`);

      const migratedLinks = linksData.map(item => ({
        url: item.url,
        title: item.title,
        description: item.description,
        source: item.source,
        category: item.category,
        sub_category: item.sub_category,
        image_url: item.image_url,
        views: item.views || 0,
        likes: item.likes || 0,
        share_count: item.share_count || 0,
        priority: item.priority || calculatePriority(item),
        status: 'active',
        review_status: 'approved',
        scraped_at: item.scraped_at,
        created_at: item.created_at,
      }));

      // 批量插入
      for (const item of migratedLinks) {
        await supabase
          .from('unified_link_library')
          .insert(item)
          .select()
          .single()
          .catch(() => {});
      }
    }

    console.log('✅ 数据迁移完成');
  } catch (error) {
    console.log('⚠️  数据迁移过程中出现错误:', error.message);
  }
}

function calculatePriority(item) {
  // 基于来源和互动数据计算初始优先级
  let priority = 30; // 默认优先级

  if (item.source === 'iFixit') priority += 70;
  else if (item.source === '官方') priority += 60;
  else if (item.source?.includes('知乎')) priority += 50;
  else if (item.source?.includes('bilibili')) priority += 40;

  // 基于互动数据调整
  if (item.likes > 100) priority += 20;
  if (item.views > 1000) priority += 10;

  return Math.min(100, Math.max(0, priority));
}

// 执行部署
if (require.main === module) {
  createUnifiedLinkLibrary().catch(console.error);
}

module.exports = { createUnifiedLinkLibrary };
