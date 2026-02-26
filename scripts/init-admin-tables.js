#!/usr/bin/env node

/**
 * 执行管理员表初始化
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function initAdminTables() {
  console.log('🔧 开始初始化管理员表...');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    // 创建管理员用户表
    console.log('\n1️⃣ 创建 admin_users 表...');
    const createAdminUsersTable = `
      CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL UNIQUE,
        role VARCHAR(50) DEFAULT 'viewer',
        is_active BOOLEAN DEFAULT true,
        created_by UUID REFERENCES auth.users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: tableError } = await supabase.rpc('execute_sql', { 
      sql: createAdminUsersTable 
    });
    
    if (tableError) {
      console.log('   表创建结果:', tableError.message);
    } else {
      console.log('   ✅ admin_users 表创建成功');
    }
    
    // 创建权限表
    console.log('\n2️⃣ 创建 permissions 表...');
    const createPermissionsTable = `
      CREATE TABLE IF NOT EXISTS permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        role VARCHAR(50) NOT NULL,
        resource VARCHAR(100) NOT NULL,
        action VARCHAR(50) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: permError } = await supabase.rpc('execute_sql', { 
      sql: createPermissionsTable 
    });
    
    if (permError) {
      console.log('   表创建结果:', permError.message);
    } else {
      console.log('   ✅ permissions 表创建成功');
    }
    
    // 插入默认权限
    console.log('\n3️⃣ 插入默认权限...');
    const insertPermissions = `
      INSERT INTO permissions (role, resource, action, description) VALUES
        ('admin', 'all', 'manage', '超级管理员拥有所有权限'),
        ('content_reviewer', 'content', 'review', '内容审核权限'),
        ('shop_reviewer', 'shops', 'review', '店铺审核权限'),
        ('finance', 'finance', 'manage', '财务管理权限'),
        ('viewer', 'dashboard', 'view', '查看仪表板权限')
      ON CONFLICT DO NOTHING;
    `;
    
    const { error: insertError } = await supabase.rpc('execute_sql', { 
      sql: insertPermissions 
    });
    
    if (insertError) {
      console.log('   权限插入结果:', insertError.message);
    } else {
      console.log('   ✅ 默认权限插入成功');
    }
    
    // 为现有管理员用户创建记录
    console.log('\n4️⃣ 为管理员用户创建数据库记录...');
    const adminEmail = '1055603323@qq.com';
    
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.log('   获取用户列表失败:', listError.message);
      return;
    }
    
    const targetUser = users.users.find(user => user.email === adminEmail);
    if (targetUser) {
      const { data: existingAdmin, error: checkError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', targetUser.id)
        .single();
      
      if (checkError || !existingAdmin) {
        const { data: newAdmin, error: insertAdminError } = await supabase
          .from('admin_users')
          .insert({
            user_id: targetUser.id,
            email: adminEmail,
            role: 'admin',
            is_active: true,
            created_by: targetUser.id
          })
          .select()
          .single();
        
        if (insertAdminError) {
          console.log('   创建管理员记录失败:', insertAdminError.message);
        } else {
          console.log('   ✅ 管理员记录创建成功:', newAdmin.id);
        }
      } else {
        console.log('   ✅ 管理员记录已存在');
      }
    }
    
    // 验证结果
    console.log('\n5️⃣ 验证表结构...');
    const { data: tableData, error: verifyError } = await supabase
      .from('admin_users')
      .select('*')
      .limit(3);
    
    if (verifyError) {
      console.log('   验证失败:', verifyError.message);
    } else {
      console.log('   ✅ 表结构验证通过');
      console.log('   管理员记录数量:', tableData.length);
    }
    
    console.log('\n🎉 管理员表初始化完成！');
    
  } catch (error) {
    console.error('\n❌ 初始化过程中发生错误:', error.message);
  }
}

initAdminTables();