#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function deployAdminSystem() {
  console.log('🚀 开始部署管理后台权限系统...\n');

  // 创建Supabase客户端
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // 读取SQL迁移文件
    const fs = require('fs');
    const path = require('path');

    const migrationPath = path.join(
      __dirname,
      '..',
      'supabase',
      'migrations',
      '003_add_admin_roles.sql'
    );
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📋 执行数据库迁移...');

    // 分割SQL语句并逐个执行
    const statements = migrationSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          // 对于CREATE TYPE语句，需要特殊处理
          if (statement.includes('create type')) {
            console.log(
              `🔧 执行语句 ${i + 1}/${statements.length}: CREATE TYPE`
            );
            await supabase.rpc('execute_sql', { sql: statement });
          } else {
            console.log(`🔧 执行语句 ${i + 1}/${statements.length}`);
            await supabase.rpc('execute_sql', { sql: statement });
          }
        } catch (error) {
          // 忽略一些预期的错误（如重复创建）
          if (
            !error.message.includes('already exists') &&
            !error.message.includes('duplicate key')
          ) {
            console.warn(`⚠️  语句执行警告: ${error.message}`);
          }
        }
      }
    }

    console.log('\n✅ 数据库迁移完成！\n');

    // 创建初始管理员用户
    console.log('👤 创建初始管理员用户...');

    // 检查是否已存在管理员用户
    const { data: existingAdmins, error: checkError } = await supabase
      .from('admin_users')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('❌ 检查现有管理员失败:', checkError);
      return;
    }

    if (existingAdmins && existingAdmins.length > 0) {
      console.log('ℹ️  已存在管理员用户，跳过创建');
    } else {
      // 从环境变量获取初始管理员信息
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
      const adminUserId = process.env.ADMIN_USER_ID || null;

      const { data: newAdmin, error: insertError } = await supabase
        .from('admin_users')
        .insert({
          user_id: adminUserId,
          email: adminEmail,
          role: 'admin',
          is_active: true,
          created_by: null,
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ 创建初始管理员失败:', insertError);
      } else {
        console.log(`✅ 初始管理员创建成功: ${adminEmail}`);
      }
    }

    // 验证部署结果
    console.log('\n🔍 验证部署结果...');

    const validationQueries = [
      {
        name: '用户角色枚举',
        query: () => supabase.from('admin_users').select('role').limit(1),
      },
      {
        name: '权限表',
        query: () => supabase.from('permissions').select('id').limit(1),
      },
      {
        name: '管理员用户表',
        query: () => supabase.from('admin_users').select('id').limit(1),
      },
    ];

    for (const validation of validationQueries) {
      try {
        const { data, error } = await validation.query();
        if (error) {
          console.error(`❌ ${validation.name} 验证失败:`, error);
        } else {
          console.log(`✅ ${validation.name} 验证通过`);
        }
      } catch (error) {
        console.error(`❌ ${validation.name} 验证异常:`, error);
      }
    }

    console.log('\n🎉 管理后台权限系统部署完成！');
    console.log('\n📝 下一步操作:');
    console.log('1. 访问 /admin/login 登录管理后台');
    console.log('2. 使用初始管理员账号登录');
    console.log('3. 在用户管理页面创建更多管理员用户');
    console.log('4. 配置具体的角色权限');
  } catch (error) {
    console.error('\n❌ 部署失败:', error);
    process.exit(1);
  }
}

// 运行部署
if (require.main === module) {
  deployAdminSystem();
}

module.exports = { deployAdminSystem };
