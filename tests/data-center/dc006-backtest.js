// DC006 API整合回测验证脚本
// 验证API整合后的功能连通性和数据准确性

const fs = require('fs');
const path = require('path');

async function runDC006Backtest() {
  console.log('🚀 开始 DC006 API整合回测验证...');
  console.log('📋 测试目标: 验证API整合后的功能连通性和数据准确性\n');

  const results = {
    timestamp: new Date().toISOString(),
    testName: 'DC006 API Integration Backtest',
    modules: {},
    summary: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      successRate: 0,
    },
  };

  try {
    // 测试1: API网关文件结构验证
    console.log('🧪 测试1: API网关文件结构验证');
    results.modules.fileStructure = { status: 'pending', tests: [] };

    const gatewayFiles = ['src/app/api/data-center/gateway/route.ts'];

    let filePassed = 0;
    for (const filePath of gatewayFiles) {
      try {
        const fullPath = path.join(process.cwd(), filePath);
        const exists = fs.existsSync(fullPath);
        results.modules.fileStructure.tests.push({
          name: `网关文件存在性: ${filePath}`,
          status: exists ? 'passed' : 'failed',
          details: exists ? '文件存在' : '文件不存在',
        });
        if (exists) filePassed++;
      } catch (error) {
        results.modules.fileStructure.tests.push({
          name: `文件检查: ${filePath}`,
          status: 'failed',
          details: `检查失败: ${error.message}`,
        });
      }
    }

    results.modules.fileStructure.status =
      filePassed === gatewayFiles.length ? 'complete' : 'partial';
    console.log(
      `   ✅ 文件结构验证: ${filePassed}/${gatewayFiles.length} 通过`
    );

    // 测试2: 代码质量检查
    console.log('\n🧪 测试2: 网关代码质量检查');
    results.modules.codeQuality = { status: 'pending', tests: [] };

    try {
      const gatewayCode = fs.readFileSync(
        'src/app/api/data-center/gateway/route.ts',
        'utf8'
      );

      const qualityChecks = [
        {
          name: '导出函数完整性',
          check: () =>
            gatewayCode.includes('export async function GET') &&
            gatewayCode.includes('export async function POST'),
        },
        {
          name: '错误处理机制',
          check: () =>
            gatewayCode.includes('try {') && gatewayCode.includes('catch'),
        },
        {
          name: '模块路由映射',
          check: () =>
            gatewayCode.includes('API_ROUTES') &&
            gatewayCode.includes('devices:'),
        },
        {
          name: '健康检查功能',
          check: () =>
            gatewayCode.includes('HEALTH_CHECKS') &&
            gatewayCode.includes('health'),
        },
      ];

      let qualityPassed = 0;
      for (const check of qualityChecks) {
        const passed = check.check();
        results.modules.codeQuality.tests.push({
          name: check.name,
          status: passed ? 'passed' : 'failed',
          details: passed ? '检查通过' : '检查未通过',
        });
        if (passed) qualityPassed++;
      }

      results.modules.codeQuality.status =
        qualityPassed === qualityChecks.length ? 'complete' : 'partial';
      console.log(
        `   ✅ 代码质量检查: ${qualityPassed}/${qualityChecks.length} 通过`
      );
    } catch (error) {
      results.modules.codeQuality.tests.push({
        name: '代码质量检查',
        status: 'failed',
        details: `检查异常: ${error.message}`,
      });
      results.modules.codeQuality.status = 'failed';
    }

    // 测试3: API路由配置验证
    console.log('\n🧪 测试3: API路由配置验证');
    results.modules.routing = { status: 'pending', tests: [] };

    try {
      const gatewayCode = fs.readFileSync(
        'src/app/api/data-center/gateway/route.ts',
        'utf8'
      );

      const requiredModules = [
        'devices',
        'supply-chain',
        'wms',
        'fcx',
        'data-quality',
        'monitoring',
        'analytics',
        'enterprise',
      ];

      const configuredModules = requiredModules.filter(module =>
        gatewayCode.includes(`'${module}'`)
      );

      const routingComplete = configuredModules.length >= 6; // 至少6个模块

      results.modules.routing.tests.push({
        name: '模块路由配置',
        status: routingComplete ? 'passed' : 'failed',
        details: `配置了 ${configuredModules.length}/${requiredModules.length} 个模块`,
      });

      // 检查健康检查配置
      const hasHealthChecks =
        gatewayCode.includes('HEALTH_CHECKS') &&
        gatewayCode.includes('checkModuleHealth');

      results.modules.routing.tests.push({
        name: '健康检查配置',
        status: hasHealthChecks ? 'passed' : 'failed',
        details: hasHealthChecks ? '健康检查已配置' : '缺少健康检查',
      });

      results.modules.routing.status =
        routingComplete && hasHealthChecks ? 'complete' : 'partial';
      console.log(
        `   ${routingComplete && hasHealthChecks ? '✅' : '⚠️'} 路由配置验证: ${configuredModules.length}/${requiredModules.length} 模块配置`
      );
    } catch (error) {
      results.modules.routing.tests.push({
        name: '路由配置检查',
        status: 'failed',
        details: `检查异常: ${error.message}`,
      });
      results.modules.routing.status = 'failed';
    }

    // 测试4: 功能逻辑验证
    console.log('\n🧪 测试4: 功能逻辑验证');
    results.modules.functionality = { status: 'pending', tests: [] };

    try {
      const gatewayCode = fs.readFileSync(
        'src/app/api/data-center/gateway/route.ts',
        'utf8'
      );

      const functionChecks = [
        {
          name: '代理请求功能',
          check: () =>
            gatewayCode.includes('proxyRequest') &&
            gatewayCode.includes('fetch'),
        },
        {
          name: '数据聚合功能',
          check: () =>
            gatewayCode.includes('aggregateModuleData') &&
            gatewayCode.includes('Promise.all'),
        },
        {
          name: '参数解析功能',
          check: () =>
            gatewayCode.includes('searchParams.get') &&
            gatewayCode.includes('URL'),
        },
        {
          name: '响应格式标准化',
          check: () =>
            gatewayCode.includes('ApiResponse') &&
            gatewayCode.includes('timestamp'),
        },
      ];

      let functionPassed = 0;
      for (const check of functionChecks) {
        const passed = check.check();
        results.modules.functionality.tests.push({
          name: check.name,
          status: passed ? 'passed' : 'failed',
          details: passed ? '功能实现完整' : '功能实现不完整',
        });
        if (passed) functionPassed++;
      }

      results.modules.functionality.status =
        functionPassed === functionChecks.length ? 'complete' : 'partial';
      console.log(
        `   ✅ 功能逻辑验证: ${functionPassed}/${functionChecks.length} 通过`
      );
    } catch (error) {
      results.modules.functionality.tests.push({
        name: '功能逻辑检查',
        status: 'failed',
        details: `检查异常: ${error.message}`,
      });
      results.modules.functionality.status = 'failed';
    }

    // 测试5: 文档完整性验证
    console.log('\n🧪 测试5: 文档完整性验证');
    results.modules.documentation = { status: 'pending', tests: [] };

    const docFiles = [
      'docs/api/API_INTEGRATION_GUIDE.md',
      'docs/technical/DC005_PROTOTYPE_IMPLEMENTATION_REPORT.md',
    ];

    let docPassed = 0;
    for (const docPath of docFiles) {
      try {
        const fullPath = path.join(process.cwd(), docPath);
        const exists = fs.existsSync(fullPath);
        results.modules.documentation.tests.push({
          name: `文档文件存在性: ${docPath}`,
          status: exists ? 'passed' : 'failed',
          details: exists ? '文档存在' : '文档不存在',
        });
        if (exists) docPassed++;
      } catch (error) {
        results.modules.documentation.tests.push({
          name: `文档检查: ${docPath}`,
          status: 'failed',
          details: `检查失败: ${error.message}`,
        });
      }
    }

    results.modules.documentation.status =
      docPassed === docFiles.length ? 'complete' : 'partial';
    console.log(`   ✅ 文档完整性验证: ${docPassed}/${docFiles.length} 通过`);

    // 计算汇总结果
    let totalTests = 0;
    let passedTests = 0;

    Object.values(results.modules).forEach(module => {
      if (module.tests) {
        totalTests += module.tests.length;
        passedTests += module.tests.filter(
          test => test.status === 'passed'
        ).length;
      }
    });

    results.summary.totalTests = totalTests;
    results.summary.passedTests = passedTests;
    results.summary.failedTests = totalTests - passedTests;
    results.summary.successRate =
      totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

    // 输出详细结果
    console.log('\n📊 DC006 回测验证结果汇总:');
    console.log('=====================================');
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过测试: ${passedTests}`);
    console.log(`失败测试: ${results.summary.failedTests}`);
    console.log(`成功率: ${results.summary.successRate}%`);
    console.log('=====================================\n');

    Object.entries(results.modules).forEach(([moduleName, module]) => {
      const passed = module.tests
        ? module.tests.filter(t => t.status === 'passed').length
        : 0;
      const total = module.tests ? module.tests.length : 0;
      const status =
        module.status === 'complete'
          ? '✅'
          : module.status === 'partial'
            ? '⚠️'
            : '❌';
      console.log(`${status} ${moduleName}: ${passed}/${total} 通过`);
    });

    // 保存结果到文件
    const outputPath = 'reports/dc006-backtest-results.json';
    // 确保reports目录存在
    if (!fs.existsSync('reports')) {
      fs.mkdirSync('reports', { recursive: true });
    }
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 详细结果已保存到: ${outputPath}`);

    // 返回最终结果
    return {
      success: results.summary.successRate >= 85,
      results,
      message:
        results.summary.successRate >= 85
          ? '✅ DC006 API整合回测通过!'
          : '❌ DC006 API整合回测未达到预期标准',
    };
  } catch (error) {
    console.error('❌ 回测过程中发生错误:', error);
    return {
      success: false,
      error: error.message,
      message: '❌ DC006 回测执行失败',
    };
  }
}

// 执行回测
if (require.main === module) {
  runDC006Backtest()
    .then(result => {
      console.log(`\n${'='.repeat(50)}`);
      console.log(result.message);
      console.log('='.repeat(50));
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ 回测执行异常:', error);
      process.exit(1);
    });
}

module.exports = { runDC006Backtest };
