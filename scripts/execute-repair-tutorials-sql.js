// 执行维修教程表SQL
const fs = require('fs');
const path = require('path');

async function executeSQL() {
  console.log('📋 准备执行维修教程表SQL...\n');
  
  try {
    // 读取SQL文件
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '022_create_repair_tutorials_table.sql');
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🔧 SQL内容:');
    console.log('====================');
    console.log(sqlContent);
    console.log('====================\n');
    
    console.log('📋 请按以下步骤操作:');
    console.log('1. 访问 Supabase 控制台: https://app.supabase.com/project/hrjqzbhqueleszkvnsen');
    console.log('2. 进入 SQL Editor 页面');
    console.log('3. 将上面的SQL内容粘贴到编辑器中');
    console.log('4. 点击 "RUN" 按钮执行');
    console.log('5. 确认执行成功后，重新测试API');
    
    // 尝试使用Supabase REST API检查表是否存在
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && serviceKey) {
      console.log('\n🔍 检查表是否存在...');
      
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/repair_tutorials?select=*&limit=1`, {
          headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          console.log('✅ repair_tutorials 表已存在');
        } else {
          console.log('❌ repair_tutorials 表不存在，请执行上述SQL');
        }
      } catch (checkError) {
        console.log('⚠️ 无法检查表状态，请手动执行SQL');
      }
    }
    
  } catch (error) {
    console.error('❌ 执行SQL准备失败:', error.message);
  }
}

executeSQL();