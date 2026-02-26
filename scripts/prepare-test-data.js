// 测试数据准备脚本
const { createClient } = require('@supabase/supabase-js');

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hrjqzbhqueleszkvnsen.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_5e-tqlrRNyKW3fAmWJipIQ_1-fjS711'
);

async function prepareTestData() {
  console.log('🧪 开始准备测试数据...\n');
  
  try {
    // 1. 插入测试热点链接
    console.log('1️⃣ 插入测试热点链接...');
    const hotLinks = [
      {
        url: 'https://example.com/iphone15-repair-guide',
        title: 'iPhone 15 Pro 维修完整指南',
        description: '详细的iPhone 15 Pro屏幕更换和电池更换教程',
        source: '维修技术博客',
        category: '手机维修',
        sub_category: '屏幕更换',
        likes: 45,
        views: 1200,
        status: 'promoted'
      },
      {
        url: 'https://example.com/android-troubleshooting',
        title: 'Android手机常见故障排查方法',
        description: 'Android系统卡顿、发热、耗电快等问题解决方案',
        source: '技术分享站',
        category: '手机维修',
        sub_category: '系统优化',
        likes: 32,
        views: 850,
        status: 'promoted'
      },
      {
        url: 'https://example.com/battery-replacement',
        title: '手机电池更换注意事项',
        description: '各类手机电池更换的安全操作规范和工具推荐',
        source: '专业维修论坛',
        category: '手机维修',
        sub_category: '电池更换',
        likes: 28,
        views: 650,
        status: 'promoted'
      }
    ];
    
    const { data: insertedLinks, error: linkError } = await supabase
      .from('hot_link_pool')
      .insert(hotLinks)
      .select();
    
    if (linkError) {
      console.log('❌ 插入热点链接失败:', linkError.message);
    } else {
      console.log(`✅ 成功插入 ${insertedLinks.length} 条热点链接`);
      insertedLinks.forEach((link, index) => {
        console.log(`   ${index + 1}. ${link.title}`);
      });
    }
    
    // 2. 插入测试文章
    console.log('\n2️⃣ 插入测试文章...');
    const articles = [
      {
        title: 'iPhone 14 Pro 屏幕更换详细教程',
        content: '# iPhone 14 Pro 屏幕更换指南\n\n## 准备工作\n1. 准备专业工具\n2. 确保工作环境清洁\n3. 备份重要数据\n\n## 操作步骤\n详细的操作步骤...',
        summary: '完整的iPhone 14 Pro屏幕更换教程，包含所需工具和详细步骤',
        cover_image_url: 'https://example.com/iphone14-screen.jpg',
        status: 'published',
        like_count: 156,
        view_count: 2450
      },
      {
        title: '华为手机电池续航优化技巧',
        content: '# 华为手机电池优化\n\n## 系统设置优化\n1. 调整屏幕亮度\n2. 关闭不必要的后台应用\n3. 启用省电模式\n\n## 使用习惯改善...',
        summary: '华为手机电池续航优化的实用技巧和设置建议',
        cover_image_url: 'https://example.com/huawei-battery.jpg',
        status: 'published',
        like_count: 89,
        view_count: 1800
      }
    ];
    
    const { data: insertedArticles, error: articleError } = await supabase
      .from('articles')
      .insert(articles)
      .select();
    
    if (articleError) {
      console.log('❌ 插入文章失败:', articleError.message);
    } else {
      console.log(`✅ 成功插入 ${insertedArticles.length} 篇文章`);
      insertedArticles.forEach((article, index) => {
        console.log(`   ${index + 1}. ${article.title}`);
      });
    }
    
    // 3. 插入测试配件
    console.log('\n3️⃣ 插入测试配件...');
    const parts = [
      {
        name: 'iPhone 15 Pro 原装屏幕',
        part_number: 'A2843',
        brand: 'Apple',
        category: '屏幕总成',
        description: '适用于iPhone 15 Pro的原装屏幕总成',
        status: 'active'
      },
      {
        name: '华为Mate60 电池',
        part_number: 'HW-M60-BAT',
        brand: '华为',
        category: '电池',
        description: '华为Mate60原装电池，容量4800mAh',
        status: 'active'
      },
      {
        name: '小米13 充电器',
        part_number: 'XM-13-CHG',
        brand: '小米',
        category: '充电器',
        description: '小米13原装67W快充充电器',
        status: 'active'
      }
    ];
    
    const { data: insertedParts, error: partError } = await supabase
      .from('parts')
      .insert(parts)
      .select();
    
    if (partError) {
      console.log('❌ 插入配件失败:', partError.message);
    } else {
      console.log(`✅ 成功插入 ${insertedParts.length} 个配件`);
      insertedParts.forEach((part, index) => {
        console.log(`   ${index + 1}. ${part.brand} ${part.name}`);
      });
    }
    
    // 4. 插入测试维修店铺
    console.log('\n4️⃣ 插入测试维修店铺...');
    const shops = [
      {
        name: '苹果官方授权维修中心',
        contact_person: '张经理',
        phone: '400-666-8800',
        address: '北京市朝阳区建国路88号SOHO现代城A座101室',
        city: '北京',
        province: '北京市',
        rating: 4.8,
        review_count: 1256,
        status: 'approved'
      },
      {
        name: '华为授权服务中心',
        contact_person: '李主任',
        phone: '400-830-8300',
        address: '上海市浦东新区陆家嘴环路1000号恒生大厦2楼',
        city: '上海',
        province: '上海市',
        rating: 4.6,
        review_count: 892,
        status: 'approved'
      }
    ];
    
    const { data: insertedShops, error: shopError } = await supabase
      .from('repair_shops')
      .insert(shops)
      .select();
    
    if (shopError) {
      console.log('❌ 插入维修店铺失败:', shopError.message);
    } else {
      console.log(`✅ 成功插入 ${insertedShops.length} 家维修店铺`);
      insertedShops.forEach((shop, index) => {
        console.log(`   ${index + 1}. ${shop.name} (${shop.city})`);
      });
    }
    
    // 5. 验证数据插入结果
    console.log('\n5️⃣ 验证数据插入结果...');
    
    const validations = [
      { table: 'hot_link_pool', condition: { status: 'promoted' } },
      { table: 'articles', condition: { status: 'published' } },
      { table: 'parts', condition: { status: 'active' } },
      { table: 'repair_shops', condition: { status: 'approved' } }
    ];
    
    for (const validation of validations) {
      const { count, error } = await supabase
        .from(validation.table)
        .select('*', { count: 'exact', head: true })
        .match(validation.condition);
      
      if (error) {
        console.log(`❌ 验证 ${validation.table} 失败: ${error.message}`);
      } else {
        console.log(`✅ ${validation.table}: ${count} 条记录`);
      }
    }
    
    console.log('\n🎉 测试数据准备完成！');
    console.log('\n📋 下一步建议:');
    console.log('1. 运行API功能测试验证数据');
    console.log('2. 开始性能优化配置');
    console.log('3. 启动第三阶段功能开发');
    
  } catch (error) {
    console.error('❌ 数据准备过程中出错:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  prepareTestData().then(() => {
    console.log('\n数据准备脚本执行完毕！');
    process.exit(0);
  }).catch(error => {
    console.error('数据准备失败:', error);
    process.exit(1);
  });
}

module.exports = { prepareTestData };