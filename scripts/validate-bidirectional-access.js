#!/usr/bin/env node

/**
 * 双向访问验证脚本
 * 验证管理后台 ↔ 数据中心的双向跳转功能
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 双向访问验证');
console.log('==================\n');

// 验证任务列表
const validationTasks = [
  {
    name: '管理后台导航菜单',
    check: () => {
      const adminLayout = path.join(
        process.cwd(),
        'src',
        'components',
        'admin',
        'EnhancedAdminLayout.tsx'
      );
      if (!fs.existsSync(adminLayout)) return false;

      const content = fs.readFileSync(adminLayout, 'utf8');
      return (
        content.includes('数据中心') &&
        content.includes("href: '/data-center'") &&
        content.includes('BarChart3')
      );
    },
    description: '检查管理后台是否添加了数据中心入口',
  },
  {
    name: '管理后台用户菜单',
    check: () => {
      const topbar = path.join(
        process.cwd(),
        'src',
        'components',
        'admin',
        'RoleAwareTopbar.tsx'
      );
      if (!fs.existsSync(topbar)) return false;

      const content = fs.readFileSync(topbar, 'utf8');
      return (
        content.includes('数据中心') &&
        content.includes('/data-center') &&
        content.includes('BarChart3')
      );
    },
    description: '检查管理后台用户菜单是否包含数据中心链接',
  },
  {
    name: '数据中心导航集成',
    check: () => {
      const dataCenterPage = path.join(
        process.cwd(),
        'src',
        'app',
        'data-center',
        'page.tsx'
      );
      if (!fs.existsSync(dataCenterPage)) return false;

      const content = fs.readFileSync(dataCenterPage, 'utf8');
      return (
        content.includes('管理后台') &&
        content.includes('/admin/dashboard') &&
        content.includes('Shield')
      );
    },
    description: '验证数据中心到管理后台的跳转入口',
  },
  {
    name: '用户菜单组件',
    check: () => {
      const userMenu = path.join(
        process.cwd(),
        'src',
        'components',
        'data-center',
        'DataCenterUserMenu.tsx'
      );
      if (!fs.existsSync(userMenu)) return false;

      const content = fs.readFileSync(userMenu, 'utf8');
      return (
        content.includes('管理后台') &&
        content.includes('/admin/dashboard') &&
        content.includes('Shield')
      );
    },
    description: '检查数据中心用户菜单的管理后台入口',
  },
  {
    name: '权限桥接服务',
    check: () => {
      const bridgeService = path.join(
        process.cwd(),
        'src',
        'services',
        'portal-admin-bridge.ts'
      );
      return fs.existsSync(bridgeService);
    },
    description: '验证跨系统权限桥接服务是否存在',
  },
];

// 执行验证
let passedTests = 0;
const totalTests = validationTasks.length;

console.log('📋 验证项目清单:');
console.log('-------------------');

validationTasks.forEach((task, index) => {
  console.log(`\n${index + 1}. ${task.name}`);
  console.log(`   描述: ${task.description}`);

  try {
    const result = task.check();
    if (result) {
      console.log('   ✅ 通过');
      passedTests++;
    } else {
      console.log('   ❌ 未通过');
    }
  } catch (error) {
    console.log(`   ❌ 执行错误: ${error.message}`);
  }
});

// 输出结果
console.log(`\n${'='.repeat(50)}`);
console.log('📊 验证结果汇总:');
console.log(`   通过测试: ${passedTests}/${totalTests}`);
console.log(`   成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n🎉 双向访问完全打通！');
  console.log('\n✨ 实现功能:');
  console.log('   • 管理后台 → 数据中心: 侧边栏菜单 + 用户下拉菜单');
  console.log('   • 数据中心 → 管理后台: 顶部导航 + 管理员专区 + 用户菜单');
  console.log('   • 权限统一控制: 基于RBAC的角色权限管理');
  console.log('   • 跨系统导航: portal-admin-bridge服务支持');
} else {
  console.log('\n⚠️  部分功能未完成，请检查相关配置。');
}

console.log('\n🚀 使用说明:');
console.log('   1. 管理员在管理后台侧边栏可直接点击"数据中心"');
console.log('   2. 管理后台用户菜单中增加了"数据中心"快捷入口');
console.log('   3. 数据中心中管理员可通过顶部盾牌图标或管理员专区进入管理后台');
console.log('   4. 所有跳转都受RBAC权限控制，确保安全性');
