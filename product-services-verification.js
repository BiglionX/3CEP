#!/usr/bin/env node

/**
 * 产品服务页面功能检查脚本
 * 验证设备维修、配件商城、智能估价、维修网点、企业服务等页面配置
 */

const fs = require('fs');
const path = require('path');

// 项目根目录
const PROJECT_ROOT = path.resolve(__dirname);

// 要检查的产品服务页面
const PRODUCT_SERVICES = [
  {
    name: '设备维修',
    path: '/diagnosis',
    expectedFile: 'src/app/diagnosis/page.tsx',
    status: 'active',
    description: 'AI智能诊断和维修服务页面',
  },
  {
    name: '配件商城',
    path: '/parts-market',
    expectedFile: 'src/app/parts-market/page.tsx',
    status: 'active',
    description: '手机配件和维修配件购买平台',
  },
  {
    name: '智能估价',
    path: '/valuation', // 注意：目前可能不存在
    expectedFile: 'src/app/valuation/page.tsx',
    status: 'missing',
    description: '设备回收和维修估价服务',
  },
  {
    name: '维修网点',
    path: '/repair-shop',
    expectedFile: 'src/app/repair-shop/page.tsx',
    status: 'active',
    description: '附近维修店铺查找和服务',
  },
  {
    name: '企业服务',
    path: '/enterprise', // 注意：目前可能不存在
    expectedFile: 'src/app/enterprise/page.tsx',
    status: 'missing',
    description: '面向企业的批量维修和定制服务',
  },
];

// 检查文件是否存在
function checkFileExists(relativePath) {
  const fullPath = path.join(PROJECT_ROOT, relativePath);
  return fs.existsSync(fullPath);
}

// 检查路由配置
function checkRouteConfiguration() {
  const navbarPath = path.join(
    PROJECT_ROOT,
    'src/components/layout/UnifiedNavbar.tsx'
  );
  const footerPath = path.join(
    PROJECT_ROOT,
    'src/components/layout/UnifiedFooter.tsx'
  );

  const results = {
    navbar: { exists: false, hasCorrectRoutes: false },
    footer: { exists: false, hasCorrectLinks: false },
  };

  // 检查导航栏配置
  if (checkFileExists('src/components/layout/UnifiedNavbar.tsx')) {
    results.navbar.exists = true;
    try {
      const navbarContent = fs.readFileSync(navbarPath, 'utf8');
      // 检查是否包含正确的路由配置
      const hasDiagnosisRoute = navbarContent.includes('/diagnosis');
      const hasPartsMarketRoute = navbarContent.includes('/parts-market');
      const hasRepairShopRoute = navbarContent.includes('/repair-shop');

      results.navbar.hasCorrectRoutes =
        hasDiagnosisRoute && hasPartsMarketRoute && hasRepairShopRoute;
    } catch (error) {
      console.error('读取导航栏文件失败:', error.message);
    }
  }

  // 检查页脚配置
  if (checkFileExists('src/components/layout/UnifiedFooter.tsx')) {
    results.footer.exists = true;
    try {
      const footerContent = fs.readFileSync(footerPath, 'utf8');
      // 检查页脚链接配置
      const hasDiagnosisLink = footerContent.includes('/diagnosis');
      const hasPlaceholderLinks = footerContent.includes("href: '#'");

      results.footer.hasCorrectLinks = hasDiagnosisLink;
    } catch (error) {
      console.error('读取页脚文件失败:', error.message);
    }
  }

  return results;
}

// 检查API端点
function checkApiEndpoints() {
  const apiDir = path.join(PROJECT_ROOT, 'src/app/api');
  const endpoints = [];

  if (fs.existsSync(apiDir)) {
    const apiFiles = fs.readdirSync(apiDir, { recursive: true });
    apiFiles.forEach(file => {
      if (file.endsWith('route.ts') || file.endsWith('page.tsx')) {
        endpoints.push({
          path: `/api/${path.dirname(file)}`,
          file: `src/app/api/${file}`,
        });
      }
    });
  }

  return endpoints;
}

// 生成检查报告
function generateReport() {
  console.log('='.repeat(60));
  console.log('📱 产品服务页面功能检查报告');
  console.log('='.repeat(60));
  console.log();

  // 1. 检查各产品服务页面状态
  console.log('📋 产品服务页面状态检查:');
  console.log('-'.repeat(40));

  let activeServices = 0;
  let missingServices = 0;

  PRODUCT_SERVICES.forEach(service => {
    const fileExists = checkFileExists(service.expectedFile);
    const status = fileExists ? '✅ 存在' : '❌ 缺失';
    const statusSymbol = fileExists ? '🟢' : '🔴';

    console.log(`${statusSymbol} ${service.name}`);
    console.log(`   路径: ${service.path}`);
    console.log(`   文件: ${service.expectedFile}`);
    console.log(`   状态: ${status}`);
    console.log(`   描述: ${service.description}`);
    console.log();

    if (fileExists) {
      activeServices++;
    } else {
      missingServices++;
    }
  });

  // 2. 检查路由配置
  console.log('🧭 路由配置检查:');
  console.log('-'.repeat(40));

  const routeConfig = checkRouteConfiguration();

  console.log(
    `导航栏配置: ${routeConfig.navbar.exists ? '✅ 存在' : '❌ 缺失'}`
  );
  if (routeConfig.navbar.exists) {
    console.log(
      `  路由配置正确: ${routeConfig.navbar.hasCorrectRoutes ? '✅ 是' : '❌ 否'}`
    );
  }

  console.log(`页脚配置: ${routeConfig.footer.exists ? '✅ 存在' : '❌ 缺失'}`);
  if (routeConfig.footer.exists) {
    console.log(
      `  链接配置正确: ${routeConfig.footer.hasCorrectLinks ? '✅ 是' : '❌ 否'}`
    );
  }
  console.log();

  // 3. 检查API端点
  console.log('🔌 API端点检查:');
  console.log('-'.repeat(40));

  const apiEndpoints = checkApiEndpoints();
  console.log(`发现 ${apiEndpoints.length} 个API端点`);

  // 查找相关的API端点
  const relevantApis = apiEndpoints.filter(
    endpoint =>
      endpoint.path.includes('diagnosis') ||
      endpoint.path.includes('parts') ||
      endpoint.path.includes('repair') ||
      endpoint.path.includes('valuation')
  );

  if (relevantApis.length > 0) {
    console.log('相关API端点:');
    relevantApis.forEach(api => {
      console.log(`  ✅ ${api.path}`);
    });
  } else {
    console.log('  ⚠️  未找到直接相关的核心API端点');
  }
  console.log();

  // 4. 总结和建议
  console.log('📊 检查总结:');
  console.log('-'.repeat(40));
  console.log(`活跃服务页面: ${activeServices}/${PRODUCT_SERVICES.length}`);
  console.log(`缺失服务页面: ${missingServices}/${PRODUCT_SERVICES.length}`);
  console.log();

  if (missingServices > 0) {
    console.log('🔧 建议改进措施:');
    console.log('-'.repeat(20));

    PRODUCT_SERVICES.filter(s => !checkFileExists(s.expectedFile)).forEach(
      service => {
        console.log(`• 创建 ${service.name} 页面 (${service.path})`);
        console.log(`  建议路径: ${service.expectedFile}`);
      }
    );

    console.log();
    console.log('💡 开发建议:');
    console.log('1. 对于"智能估价"页面，可以参考现有诊断页面的结构');
    console.log('2. 对于"企业服务"页面，建议创建专门的企业服务入口');
    console.log('3. 统一路由配置，确保导航栏和页脚的一致性');
    console.log('4. 添加相应的API端点支持');
  } else {
    console.log('🎉 所有核心产品服务页面均已配置正确！');
  }

  console.log();
  console.log('='.repeat(60));
}

// 执行检查
try {
  generateReport();
} catch (error) {
  console.error('检查过程中发生错误:', error.message);
  process.exit(1);
}
