/**
 * 智能体市场功能回测脚本
 * FixCycle 6.0 智能体市场平台
 */
const fs = require('fs');
const path = require('path');

// 测试配置
const TEST_CONFIG = {
  routes: [
    '/marketplace',
    '/marketplace/cart',
    '/marketplace/checkout',
    '/marketplace/orders',
    '/marketplace/tokens',
    '/marketplace/developer',
    '/marketplace/enterprise',
    '/marketplace/categories/sales',
    '/marketplace/123',
  ],
  files: [
    'src/app/marketplace/page.tsx',
    'src/app/marketplace/[id]/page.tsx',
    'src/app/marketplace/categories/[category]/page.tsx',
    'src/app/marketplace/cart/page.tsx',
    'src/app/marketplace/checkout/page.tsx',
    'src/app/marketplace/orders/page.tsx',
    'src/app/marketplace/tokens/page.tsx',
    'src/app/marketplace/developer/page.tsx',
    'src/app/marketplace/enterprise/page.tsx',
    'src/app/api/marketplace/route.ts',
    'src/app/api/marketplace/orders/route.ts',
    'src/app/api/marketplace/tokens/route.ts',
    'src/app/api/marketplace/enterprise/route.ts',
  ],
  requiredComponents: [
    'MarketplacePage',
    'AgentDetailPage',
    'CategoryPage',
    'CartPage',
    'CheckoutPage',
    'OrdersPage',
    'TokensPage',
    'DeveloperPage',
    'EnterprisePage',
  ],
};

// 测试结果
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: [],
};

function logTest(name, passed, message) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}: ${message}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}: ${message}`);
  }
  testResults.details.push({ name, passed, message });
}

// 测试1: 检查文件是否存在
function testFilesExistence() {
  console.log('\n=== 文件存在性测试 ===');

  TEST_CONFIG.files.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    const exists = fs.existsSync(fullPath);
    logTest(
      `文件存在性 - ${filePath}`,
      exists,
      exists ? '文件存在' : '文件不存在'
    );
  });
}

// 测试2: 检查路由结构
function testRouteStructure() {
  console.log('\n=== 路由结构测试 ===');

  const marketplaceDir = path.join(process.cwd(), 'src/app/marketplace');
  const exists = fs.existsSync(marketplaceDir);
  logTest('市场目录存在', exists, exists ? '目录存在' : '目录不存在');

  if (exists) {
    const items = fs.readdirSync(marketplaceDir);
    const expectedDirs = ['[id]', 'categories', 'cart'];
    const expectedFiles = ['page.tsx'];

    expectedDirs.forEach(dir => {
      const dirExists = items.includes(dir);
      logTest(
        `子目录 ${dir}`,
        dirExists,
        dirExists ? '目录存在' : '目录不存在'
      );
    });

    expectedFiles.forEach(file => {
      const fileExists = items.includes(file);
      logTest(
        `文件 ${file}`,
        fileExists,
        fileExists ? '文件存在' : '文件不存在'
      );
    });
  }
}

// 测试3: 检查组件导出
function testComponentExports() {
  console.log('\n=== 组件导出测试 ===');

  TEST_CONFIG.files.forEach(filePath => {
    if (!filePath.endsWith('page.tsx')) return;

    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) return;

    const content = fs.readFileSync(fullPath, 'utf8');
    const componentName = TEST_CONFIG.requiredComponents.find(comp =>
      content.includes(`export default function ${comp}`)
    );

    logTest(
      `组件导出 - ${path.basename(filePath)}`,
      !!componentName,
      componentName ? `导出组件: ${componentName}` : '未找到默认导出组件'
    );
  });
}

// 测试4: 检查API路由
function testApiRoutes() {
  console.log('\n=== API路由测试 ===');

  const apiRoute = path.join(process.cwd(), 'src/app/api/marketplace/route.ts');
  const exists = fs.existsSync(apiRoute);
  logTest('API路由文件', exists, exists ? 'API路由存在' : 'API路由不存在');

  if (exists) {
    const content = fs.readFileSync(apiRoute, 'utf8');
    const hasGET = content.includes('export async function GET');
    const hasPOST = content.includes('export async function POST');

    logTest('GET方法实现', hasGET, hasGET ? 'GET方法已实现' : '缺少GET方法');

    logTest(
      'POST方法实现',
      hasPOST,
      hasPOST ? 'POST方法已实现' : '缺少POST方法'
    );
  }
}

// 测试5: 检查关键功能实现
function testKeyFeatures() {
  console.log('\n=== 关键功能测试 ===');

  // 检查搜索功能
  const marketplacePage = path.join(
    process.cwd(),
    'src/app/marketplace/page.tsx'
  );
  if (fs.existsSync(marketplacePage)) {
    const content = fs.readFileSync(marketplacePage, 'utf8');
    const hasSearch =
      content.includes('searchTerm') && content.includes('setSearchTerm');
    logTest(
      '搜索功能',
      hasSearch,
      hasSearch ? '搜索功能已实现' : '缺少搜索功能'
    );

    const hasFilter =
      content.includes('selectedCategory') || content.includes('filter');
    logTest(
      '筛选功能',
      hasFilter,
      hasFilter ? '筛选功能已实现' : '缺少筛选功能'
    );
  }

  // 检查购物车功能
  const cartPage = path.join(
    process.cwd(),
    'src/app/marketplace/cart/page.tsx'
  );
  if (fs.existsSync(cartPage)) {
    const content = fs.readFileSync(cartPage, 'utf8');
    const hasCartState =
      content.includes('cartItems') && content.includes('useState');
    logTest(
      '购物车状态管理',
      hasCartState,
      hasCartState ? '购物车状态已实现' : '缺少购物车状态管理'
    );
  }
}

// 生成测试报告
function generateReport() {
  console.log('\n=== 测试报告 ===');
  console.log(`总测试数: ${testResults.total}`);
  console.log(`通过: ${testResults.passed}`);
  console.log(`失败: ${testResults.failed}`);
  console.log(
    `通过率: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`
  );

  if (testResults.failed > 0) {
    console.log('\n失败的测试:');
    testResults.details
      .filter(detail => !detail.passed)
      .forEach(detail => {
        console.log(`  ❌ ${detail.name}: ${detail.message}`);
      });
  }

  // 保存详细报告
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      passRate: ((testResults.passed / testResults.total) * 100).toFixed(2),
    },
    details: testResults.details,
  };

  const reportPath = path.join(
    process.cwd(),
    'reports',
    'marketplace-regression-test-report.json'
  );
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n详细报告已保存至: ${reportPath}`);

  return testResults.passed === testResults.total;
}

// 主函数
async function main() {
  console.log('🚀 开始智能体市场功能回测...\n');

  try {
    testFilesExistence();
    testRouteStructure();
    testComponentExports();
    testApiRoutes();
    testKeyFeatures();

    const allPassed = generateReport();

    if (allPassed) {
      console.log('\n🎉 所有测试通过！智能体市场基础功能已完成。');
      process.exit(0);
    } else {
      console.log('\n⚠️  部分测试失败，请检查上述问题。');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 回测过程中发生错误:', error.message);
    process.exit(1);
  }
}

main();
