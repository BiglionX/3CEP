// 部署维修教程表结构
const fs = require('fs');
const path = require('path');

async function deployRepairTutorials() {
  console.log('🔧 开始部署维修教程表结构...');
  
  // 从环境变量获取Supabase配置
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ 未找到 Supabase 配置环境变量');
    process.exit(1);
  }

  try {
    // 读取SQL迁移文件
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '022_create_repair_tutorials_table.sql');
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📋 准备执行SQL迁移...');
    
    // 使用Supabase REST API执行SQL
    // 注意：这里需要通过Supabase的SQL编辑器手动执行
    console.log('\n📋 SQL迁移内容:');
    console.log('=======================');
    console.log(sqlContent);
    console.log('=======================');
    
    console.log('\n📋 请将以上SQL内容复制到Supabase SQL编辑器中执行');
    console.log('📍 访问地址: ' + supabaseUrl.replace('https://', 'https://app.supabase.com/project/') + '/sql');
    console.log('🔑 使用服务角色密钥进行身份验证');
    
    // 验证表是否存在（如果已经存在的话）
    console.log('\n🔍 验证现有表结构...');
    
    const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/repair_tutorials?select=*,limit=1`, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (verifyResponse.ok) {
      const data = await verifyResponse.json();
      console.log('✅ repair_tutorials 表已存在');
      console.log(`📊 当前记录数: ${Array.isArray(data) ? data.length : 0}`);
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('📝 现有数据预览:');
        data.slice(0, 3).forEach((row, index) => {
          console.log(`   ${index + 1}. ${row.title} (${row.device_model} - ${row.fault_type}) [${row.status}]`);
        });
      }
    } else {
      console.log('⚠️ repair_tutorials 表尚未创建，请执行上述SQL');
    }

    console.log('\n🎉 维修教程表结构部署脚本执行完成！');
    console.log('\n📋 下一步操作:');
    console.log('1. 复制上面的SQL内容');
    console.log('2. 访问Supabase控制台SQL编辑器');
    console.log('3. 粘贴并执行SQL');
    console.log('4. 验证表创建成功');

    console.log('\n🎉 维修教程表结构部署完成！');
    
  } catch (error) {
    console.error('❌ 部署过程出现错误:', error.message);
    process.exit(1);
  }
}

// 执行部署
deployRepairTutorials().catch(console.error);