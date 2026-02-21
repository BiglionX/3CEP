#!/usr/bin/env node

/**
 * RBAC 配置验证脚本
 * 验证 rbac.json 配置的完整性和一致性
 */

const fs = require('fs');
const path = require('path');

// 配置文件路径
const RBAC_CONFIG_PATH = path.join(__dirname, '../config/rbac.json');

function validateRbacConfig() {
  console.log('🔍 开始验证 RBAC 配置...\n');
  
  try {
    // 读取配置文件
    const configContent = fs.readFileSync(RBAC_CONFIG_PATH, 'utf8');
    const config = JSON.parse(configContent);
    
    console.log('✅ 配置文件语法正确\n');
    
    // 验证基本结构
    const requiredSections = ['roles', 'permissions', 'role_permissions'];
    for (const section of requiredSections) {
      if (!config[section]) {
        throw new Error(`缺少必需的配置段: ${section}`);
      }
      console.log(`✅ 配置段 "${section}" 存在`);
    }
    
    console.log('\n📋 角色验证:');
    // 验证角色配置
    const roles = Object.keys(config.roles);
    console.log(`  发现 ${roles.length} 个角色:`);
    roles.forEach(role => {
      const roleConfig = config.roles[role];
      console.log(`    • ${role}: ${roleConfig.name} (${roleConfig.level})`);
    });
    
    console.log('\n🔐 权限验证:');
    // 验证权限配置
    const permissions = Object.keys(config.permissions);
    console.log(`  发现 ${permissions.length} 个权限点:`);
    
    // 按类别分组显示
    const categories = {};
    permissions.forEach(permKey => {
      const perm = config.permissions[permKey];
      const category = perm.category || 'uncategorized';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push({
        key: permKey,
        name: perm.name,
        resource: perm.resource,
        action: perm.action
      });
    });
    
    Object.entries(categories).forEach(([category, perms]) => {
      console.log(`    ${category} (${perms.length}个):`);
      perms.forEach(perm => {
        console.log(`      • ${perm.key}: ${perm.name} (${perm.resource}.${perm.action})`);
      });
    });
    
    console.log('\n🎯 角色权限映射验证:');
    // 验证角色权限映射
    let mappingIssues = 0;
    Object.entries(config.role_permissions).forEach(([role, rolePerms]) => {
      console.log(`  ${role} (${rolePerms.length}个权限):`);
      
      // 检查权限是否存在
      rolePerms.forEach(perm => {
        if (!config.permissions[perm]) {
          console.log(`    ❌ 未定义的权限: ${perm}`);
          mappingIssues++;
        } else {
          console.log(`    ✅ ${perm}`);
        }
      });
      
      // 检查是否有重复权限
      const uniquePerms = [...new Set(rolePerms)];
      if (uniquePerms.length !== rolePerms.length) {
        console.log(`    ⚠️  发现重复权限`);
      }
    });
    
    console.log('\n🏢 租户配置验证:');
    if (config.tenant_isolation) {
      console.log('✅ 租户隔离配置存在');
      console.log(`  模式: ${config.tenant_isolation.mode}`);
      console.log(`  启用状态: ${config.tenant_isolation.enabled ? '是' : '否'}`);
      console.log(`  涉及资源: ${config.tenant_isolation.resources_with_tenant.join(', ')}`);
    } else {
      console.log('⚠️  缺少租户隔离配置');
    }
    
    console.log('\n📝 审计配置验证:');
    if (config.audit_settings) {
      console.log('✅ 审计配置存在');
      console.log(`  启用状态: ${config.audit_settings.enabled ? '是' : '否'}`);
      console.log(`  日志保留天数: ${config.audit_settings.log_retention_days}`);
      console.log(`  敏感操作数量: ${config.audit_settings.sensitive_operations.length}`);
    } else {
      console.log('⚠️  缺少审计配置');
    }
    
    // 最终验证结果
    console.log('\n' + '='.repeat(50));
    if (mappingIssues === 0) {
      console.log('🎉 RBAC 配置验证通过！');
      console.log('✅ 所有角色权限映射正确');
      console.log('✅ 配置结构完整');
    } else {
      console.log(`⚠️  发现 ${mappingIssues} 个配置问题`);
      console.log('请检查上述标记的问题项');
    }
    
    // 输出统计信息
    console.log('\n📊 配置统计:');
    console.log(`  角色数量: ${roles.length}`);
    console.log(`  权限点数量: ${permissions.length}`);
    console.log(`  权限类别: ${Object.keys(categories).length}`);
    console.log(`  平均每个角色权限数: ${(permissions.length / roles.length).toFixed(1)}`);
    
    return mappingIssues === 0;
    
  } catch (error) {
    console.error('❌ RBAC 配置验证失败:');
    console.error(error.message);
    return false;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const isValid = validateRbacConfig();
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateRbacConfig };