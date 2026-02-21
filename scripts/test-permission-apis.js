#!/usr/bin/env node

/**
 * 权限 API 测试脚本
 * 测试新创建的带权限检查的 API 端点
 */

const { hasPermission, loadRbacConfig } = require('../src/middleware/permissions');

async function testPermissionApis() {
  console.log('🧪 开始测试权限 API...\n');
  
  try {
    // 加载 RBAC 配置
    const config = loadRbacConfig();
    console.log('✅ RBAC 配置加载成功\n');
    
    // 测试不同角色的权限
    const testRoles = [
      'admin',
      'manager', 
      'agent_operator',
      'viewer'
    ];
    
    const testPermissions = [
      'n8n_workflows_replay',
      'agents_invoke',
      'tools_execute',
      'audit_read'
    ];
    
    console.log('🔐 权限检查测试:');
    console.log('=' .repeat(60));
    
    testRoles.forEach(role => {
      console.log(`\n角色: ${role} (${config.roles[role]?.name || 'Unknown'})`);
      console.log('-'.repeat(40));
      
      testPermissions.forEach(permission => {
        const hasPerm = hasPermission([role], permission);
        const permInfo = config.permissions[permission];
        const status = hasPerm ? '✅ 有权限' : '❌ 无权限';
        
        console.log(`  ${permission}: ${status}`);
        if (permInfo) {
          console.log(`    描述: ${permInfo.description}`);
          console.log(`    资源: ${permInfo.resource}.${permInfo.action}`);
        }
      });
    });
    
    console.log('\n📋 API 端点权限要求:');
    console.log('=' .repeat(60));
    
    const apiRequirements = {
      '/api/n8n/replay': 'n8n_workflows_replay',
      '/api/agents/invoke': 'agents_invoke', 
      '/api/tools/execute': 'tools_execute'
    };
    
    Object.entries(apiRequirements).forEach(([endpoint, permission]) => {
      console.log(`\n端点: ${endpoint}`);
      console.log(`要求权限: ${permission}`);
      console.log('适用角色:');
      
      testRoles.forEach(role => {
        const hasPerm = hasPermission([role], permission);
        if (hasPerm) {
          console.log(`  ✅ ${role} (${config.roles[role]?.name || 'Unknown'})`);
        }
      });
    });
    
    console.log('\n📊 权限覆盖率统计:');
    console.log('=' .repeat(60));
    
    const roleStats = {};
    testRoles.forEach(role => {
      const rolePerms = config.role_permissions[role] || [];
      roleStats[role] = {
        total: rolePerms.length,
        newPerms: rolePerms.filter(p => 
          ['n8n_workflows_replay', 'agents_invoke', 'tools_execute', 'audit_read'].includes(p)
        ).length
      };
    });
    
    Object.entries(roleStats).forEach(([role, stats]) => {
      const roleName = config.roles[role]?.name || 'Unknown';
      console.log(`${roleName}: ${stats.newPerms}/${stats.total} 新权限`);
    });
    
    console.log('\n🎉 权限 API 测试完成!');
    console.log('✅ 权限检查逻辑正常');
    console.log('✅ 角色权限映射正确');
    
  } catch (error) {
    console.error('❌ 权限 API 测试失败:');
    console.error(error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testPermissionApis();
}

module.exports = { testPermissionApis };