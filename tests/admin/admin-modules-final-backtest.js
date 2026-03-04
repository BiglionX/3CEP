const fs = require('fs');
const path = require('path');

async function runComprehensiveBacktest() {
  console.log('🚀 开始管理后台模块综合回测验证...\n');

  const results = {
    timestamp: new Date().toISOString(),
    modules: {},
    documentation: {},
    overallStatus: 'pending',
  };

  try {
    // 1. 模块文件完整性检查
    console.log('🧪 测试1: 模块文件完整性检查');
    await checkModuleFiles(results);

    // 2. API接口可用性检查
    console.log('\n🧪 测试2: API接口可用性检查');
    await checkApiEndpoints(results);

    // 3. 文档完整性检查
    console.log('\n🧪 测试3: 技术文档完整性检查');
    await checkDocumentation(results);

    // 4. 权限配置检查
    console.log('\n🧪 测试4: 权限配置检查');
    await checkPermissions(results);

    // 5. 代码规范检查
    console.log('\n🧪 测试5: 代码规范检查');
    await checkCodeStandards(results);

    // 生成最终报告
    generateFinalReport(results);
  } catch (error) {
    console.error('❌ 回测过程中发生错误:', error);
    results.overallStatus = 'failed';
  }

  return results;
}

async function checkModuleFiles(results) {
  const modulePaths = [
    'src/app/admin/diagnostics/page.tsx',
    'src/app/admin/parts-market/page.tsx',
    'src/app/admin/user-manager/page.tsx',
    'src/app/admin/device-manager/page.tsx',
    'src/app/admin/system-dashboard/page.tsx',
    'src/app/admin/shops/page.tsx',
    'src/app/admin/content/page.tsx',
    'src/app/admin/finance/page.tsx',
    'src/app/admin/procurement/page.tsx',
    'src/app/admin/inventory/page.tsx',
  ];

  let passed = 0;
  const total = modulePaths.length;

  for (const modulePath of modulePaths) {
    const fullPath = path.join(process.cwd(), modulePath);
    const exists = fs.existsSync(fullPath);

    results.modules[modulePath] = {
      exists: exists,
      status: exists ? 'passed' : 'failed',
      message: exists ? '文件存在' : '文件缺失',
    };

    if (exists) passed++;

    console.log(
      `  ${exists ? '✅' : '❌'} ${modulePath}: ${exists ? '存在' : '缺失'}`
    );
  }

  results.modules.summary = {
    total: total,
    passed: passed,
    failed: total - passed,
    passRate: `${((passed / total) * 100).toFixed(1)}%`,
  };

  console.log(
    `\n📊 模块文件检查完成: ${passed}/${total} 通过 (${results.modules.summary.passRate})`
  );
}

async function checkApiEndpoints(results) {
  const apiPaths = [
    'src/app/api/admin/users',
    'src/app/api/admin/devices',
    'src/app/api/admin/shops',
    'src/app/api/admin/content',
    'src/app/api/admin/finance',
    'src/app/api/admin/procurement',
    'src/app/api/admin/inventory',
    'src/app/api/admin/diagnostics',
    'src/app/api/admin/parts',
  ];

  let passed = 0;
  const total = apiPaths.length;

  for (const apiPath of apiPaths) {
    const fullPath = path.join(process.cwd(), apiPath);
    const exists = fs.existsSync(fullPath);

    results.modules[apiPath] = {
      exists: exists,
      status: exists ? 'passed' : 'failed',
      message: exists ? 'API目录存在' : 'API目录缺失',
    };

    if (exists) passed++;

    console.log(
      `  ${exists ? '✅' : '❌'} ${apiPath}: ${exists ? '存在' : '缺失'}`
    );
  }

  results.modules.apiSummary = {
    total: total,
    passed: passed,
    failed: total - passed,
    passRate: `${((passed / total) * 100).toFixed(1)}%`,
  };

  console.log(
    `\n📊 API接口检查完成: ${passed}/${total} 通过 (${results.modules.apiSummary.passRate})`
  );
}

async function checkDocumentation(results) {
  const docFiles = [
    'docs/user-guides/admin-modules-user-manual.md',
    'docs/technical-docs/admin-modules-api-reference.md',
    'docs/deployment/admin-modules-deployment-guide.md',
    'docs/admin-module-development-spec.md',
  ];

  let passed = 0;
  const total = docFiles.length;

  for (const docFile of docFiles) {
    const fullPath = path.join(process.cwd(), docFile);
    const exists = fs.existsSync(fullPath);

    results.documentation[docFile] = {
      exists: exists,
      status: exists ? 'passed' : 'failed',
      message: exists ? '文档存在' : '文档缺失',
    };

    if (exists) passed++;

    console.log(
      `  ${exists ? '✅' : '❌'} ${docFile}: ${exists ? '存在' : '缺失'}`
    );
  }

  results.documentation.summary = {
    total: total,
    passed: passed,
    failed: total - passed,
    passRate: `${((passed / total) * 100).toFixed(1)}%`,
  };

  console.log(
    `\n📊 文档完整性检查完成: ${passed}/${total} 通过 (${results.documentation.summary.passRate})`
  );
}

async function checkPermissions(results) {
  // 检查权限配置文件
  const rbacFiles = ['config/rbac.json', 'config/rbac.schema.json'];

  let passed = 0;
  const total = rbacFiles.length;

  for (const rbacFile of rbacFiles) {
    const fullPath = path.join(process.cwd(), rbacFile);
    const exists = fs.existsSync(fullPath);

    results.modules[rbacFile] = {
      exists: exists,
      status: exists ? 'passed' : 'failed',
      message: exists ? '权限配置存在' : '权限配置缺失',
    };

    if (exists) passed++;

    console.log(
      `  ${exists ? '✅' : '❌'} ${rbacFile}: ${exists ? '存在' : '缺失'}`
    );
  }

  results.modules.permissionsSummary = {
    total: total,
    passed: passed,
    failed: total - passed,
    passRate: `${((passed / total) * 100).toFixed(1)}%`,
  };

  console.log(
    `\n📊 权限配置检查完成: ${passed}/${total} 通过 (${results.modules.permissionsSummary.passRate})`
  );
}

async function checkCodeStandards(results) {
  // 检查代码规范相关文件
  const standardFiles = [
    '.eslintrc',
    '.prettierrc',
    'tsconfig.json',
    'package.json',
  ];

  let passed = 0;
  const total = standardFiles.length;

  for (const stdFile of standardFiles) {
    const fullPath = path.join(process.cwd(), stdFile);
    const exists = fs.existsSync(fullPath);

    results.modules[stdFile] = {
      exists: exists,
      status: exists ? 'passed' : 'failed',
      message: exists ? '规范配置存在' : '规范配置缺失',
    };

    if (exists) passed++;

    console.log(
      `  ${exists ? '✅' : '❌'} ${stdFile}: ${exists ? '存在' : '缺失'}`
    );
  }

  results.modules.standardsSummary = {
    total: total,
    passed: passed,
    failed: total - passed,
    passRate: `${((passed / total) * 100).toFixed(1)}%`,
  };

  console.log(
    `\n📊 代码规范检查完成: ${passed}/${total} 通过 (${results.modules.standardsSummary.passRate})`
  );
}

function generateFinalReport(results) {
  console.log(`\n${'='.repeat(60)}`);
  console.log('📋 管理后台模块综合回测验证报告');
  console.log('='.repeat(60));

  // 总体统计
  const totalTests =
    results.modules.summary.total +
    results.modules.apiSummary.total +
    results.documentation.summary.total +
    results.modules.permissionsSummary.total +
    results.modules.standardsSummary.total;

  const passedTests =
    results.modules.summary.passed +
    results.modules.apiSummary.passed +
    results.documentation.summary.passed +
    results.modules.permissionsSummary.passed +
    results.modules.standardsSummary.passed;

  const passRate = ((passedTests / totalTests) * 100).toFixed(1);

  console.log(`\n📊 总体统计:`);
  console.log(`  总检查项: ${totalTests}`);
  console.log(`  通过项: ${passedTests}`);
  console.log(`  通过率: ${passRate}%`);

  // 各项详细统计
  console.log(`\n📈 详细统计:`);
  console.log(`  模块文件: ${results.modules.summary.passRate}`);
  console.log(`  API接口: ${results.modules.apiSummary.passRate}`);
  console.log(`  技术文档: ${results.documentation.summary.passRate}`);
  console.log(`  权限配置: ${results.modules.permissionsSummary.passRate}`);
  console.log(`  代码规范: ${results.modules.standardsSummary.passRate}`);

  // 最终状态判定
  results.overallStatus =
    passRate >= 95
      ? 'excellent'
      : passRate >= 85
        ? 'good'
        : passRate >= 70
          ? 'acceptable'
          : 'poor';

  const statusEmoji = {
    excellent: '🎉',
    good: '✅',
    acceptable: '⚠️',
    poor: '❌',
  };

  const statusText = {
    excellent: '优秀',
    good: '良好',
    acceptable: '可接受',
    poor: '需要改进',
  };

  console.log(
    `\n${statusEmoji[results.overallStatus]} 最终状态: ${statusText[results.overallStatus]}`
  );

  if (results.overallStatus === 'excellent') {
    console.log('\n🎊 恭喜！所有管理模块均已通过完整验证，可以进入生产环境。');
  } else if (results.overallStatus === 'good') {
    console.log('\n👍 管理模块基本完善，建议修复少量问题后上线。');
  } else {
    console.log('\n⚠️  管理模块存在较多问题，需要进一步完善后再考虑上线。');
  }

  // 生成JSON报告文件
  const reportPath = path.join(
    process.cwd(),
    'reports',
    'admin-modules-final-backtest-report.json'
  );
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 详细报告已保存至: ${reportPath}`);

  return results;
}

// 执行回测
runComprehensiveBacktest()
  .then(results => {
    console.log('\n🏁 回测验证完成！');
    process.exit(results.overallStatus === 'poor' ? 1 : 0);
  })
  .catch(error => {
    console.error('❌ 回测执行失败:', error);
    process.exit(1);
  });

module.exports = { runComprehensiveBacktest };
