// DC009 元数据管理回测验证脚本
const fs = require('fs');
const path = require('path');

async function runDC009Backtest() {
  console.log('🚀 开始 DC009 元数据管理回测验证...');
  console.log('📋 测试目标: 验证数据资产目录和元数据管理功能\n');

  const results = {
    timestamp: new Date().toISOString(),
    testName: 'DC009 Metadata Management Backtest',
    modules: {},
    summary: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      successRate: 0,
    },
  };

  try {
    // 测试1: 文件结构验证
    console.log('🧪 测试1: 文件结构验证');
    results.modules.fileStructure = { status: 'pending', tests: [] };

    const expectedFiles = [
      'src/data-center/models/metadata-models.ts',
      'src/data-center/core/metadata-service.ts',
      'src/app/data-center/metadata/page.tsx',
    ];

    let passedCount = 0;
    for (const filePath of expectedFiles) {
      try {
        const fullPath = path.join(process.cwd(), filePath);
        const exists = fs.existsSync(fullPath);
        results.modules.fileStructure.tests.push({
          name: `文件存在性: ${filePath}`,
          status: exists ? 'passed' : 'failed',
          details: exists ? '文件存在' : '文件不存在',
        });

        if (exists) passedCount++;
      } catch (error) {
        results.modules.fileStructure.tests.push({
          name: `文件存在性: ${filePath}`,
          status: 'failed',
          details: `检查失败: ${error.message}`,
        });
      }
    }

    results.modules.fileStructure.status =
      passedCount === expectedFiles.length ? 'passed' : 'failed';
    results.modules.fileStructure.passed = passedCount;
    results.modules.fileStructure.total = expectedFiles.length;

    results.summary.totalTests += expectedFiles.length;
    results.summary.passedTests += passedCount;
    results.summary.failedTests += expectedFiles.length - passedCount;

    // 测试2: 代码质量检查
    console.log('🧪 测试2: 代码质量检查');
    results.modules.codeQuality = { status: 'pending', tests: [] };

    const modelFile = path.join(
      process.cwd(),
      'src/data-center/models/metadata-models.ts'
    );
    const serviceFile = path.join(
      process.cwd(),
      'src/data-center/core/metadata-service.ts'
    );

    try {
      const modelContent = fs.readFileSync(modelFile, 'utf8');
      const serviceContent = fs.readFileSync(serviceFile, 'utf8');

      // 检查是否包含必要的接口定义
      const hasInterfaces =
        modelContent.includes('interface DataAsset') &&
        modelContent.includes('interface ColumnSchema');
      results.modules.codeQuality.tests.push({
        name: '模型接口定义完整性',
        status: hasInterfaces ? 'passed' : 'failed',
        details: hasInterfaces ? '包含必要接口定义' : '缺少关键接口定义',
      });

      // 检查服务类实现
      const hasServiceClass = serviceContent.includes('class MetadataService');
      results.modules.codeQuality.tests.push({
        name: '服务类实现',
        status: hasServiceClass ? 'passed' : 'failed',
        details: hasServiceClass ? '包含MetadataService类' : '缺少服务类实现',
      });

      // 检查搜索功能
      const hasSearchFunction = serviceContent.includes('searchAssets');
      results.modules.codeQuality.tests.push({
        name: '搜索功能实现',
        status: hasSearchFunction ? 'passed' : 'failed',
        details: hasSearchFunction ? '包含搜索方法' : '缺少搜索功能',
      });

      const qualityPassed = [
        hasInterfaces,
        hasServiceClass,
        hasSearchFunction,
      ].filter(Boolean).length;
      results.modules.codeQuality.status =
        qualityPassed === 3 ? 'passed' : 'failed';
      results.modules.codeQuality.passed = qualityPassed;
      results.modules.codeQuality.total = 3;

      results.summary.totalTests += 3;
      results.summary.passedTests += qualityPassed;
      results.summary.failedTests += 3 - qualityPassed;
    } catch (error) {
      results.modules.codeQuality.status = 'failed';
      results.modules.codeQuality.tests.push({
        name: '代码质量检查',
        status: 'failed',
        details: `读取文件失败: ${error.message}`,
      });
      results.summary.totalTests += 1;
      results.summary.failedTests += 1;
    }

    // 测试3: 功能完整性验证
    console.log('🧪 测试3: 功能完整性验证');
    results.modules.functionality = { status: 'pending', tests: [] };

    try {
      const pageFile = path.join(
        process.cwd(),
        'src/app/data-center/metadata/page.tsx'
      );
      const pageContent = fs.readFileSync(pageFile, 'utf8');

      // 检查关键功能组件
      const hasSearch = pageContent.includes('searchTerm');
      const hasFilters =
        pageContent.includes('categoryFilter') ||
        pageContent.includes('typeFilter');
      const hasAssetDisplay =
        pageContent.includes('DataAsset') || pageContent.includes('资产');
      const hasStatistics =
        pageContent.includes('statistics') || pageContent.includes('统计');

      results.modules.functionality.tests.push({
        name: '搜索功能',
        status: hasSearch ? 'passed' : 'failed',
        details: hasSearch ? '包含搜索功能' : '缺少搜索功能',
      });

      results.modules.functionality.tests.push({
        name: '筛选功能',
        status: hasFilters ? 'passed' : 'failed',
        details: hasFilters ? '包含筛选功能' : '缺少筛选功能',
      });

      results.modules.functionality.tests.push({
        name: '资产展示',
        status: hasAssetDisplay ? 'passed' : 'failed',
        details: hasAssetDisplay ? '包含资产展示' : '缺少资产展示',
      });

      const funcPassed = [hasSearch, hasFilters, hasAssetDisplay].filter(
        Boolean
      ).length;
      results.modules.functionality.status =
        funcPassed >= 2 ? 'passed' : 'failed';
      results.modules.functionality.passed = funcPassed;
      results.modules.functionality.total = 3;

      results.summary.totalTests += 3;
      results.summary.passedTests += funcPassed;
      results.summary.failedTests += 3 - funcPassed;
    } catch (error) {
      results.modules.functionality.status = 'failed';
      results.modules.functionality.tests.push({
        name: '功能完整性检查',
        status: 'failed',
        details: `检查失败: ${error.message}`,
      });
      results.summary.totalTests += 1;
      results.summary.failedTests += 1;
    }

    // 计算总体成功率
    results.summary.successRate =
      results.summary.totalTests > 0
        ? Math.round(
            (results.summary.passedTests / results.summary.totalTests) * 100
          )
        : 0;

    // 输出结果
    console.log('\n📊 DC009 回测验证结果汇总:');
    console.log('=====================================');
    console.log(`总测试数: ${results.summary.totalTests}`);
    console.log(`通过测试: ${results.summary.passedTests}`);
    console.log(`失败测试: ${results.summary.failedTests}`);
    console.log(`成功率: ${results.summary.successRate}%`);
    console.log('=====================================\n');

    // 详细结果输出
    Object.entries(results.modules).forEach(([moduleName, module]) => {
      const statusEmoji = module.status === 'passed' ? '✅' : '❌';
      console.log(
        `${statusEmoji} ${moduleName}: ${module.passed}/${module.total} 通过`
      );
    });

    // 保存结果到文件
    const resultFile = path.join(
      process.cwd(),
      'reports',
      'dc009-backtest-results.json'
    );
    fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
    console.log(`\n💾 详细结果已保存到: ${resultFile}`);

    // 最终判断
    const overallPass = results.summary.successRate >= 80;
    console.log(`\n${'='.repeat(50)}`);
    if (overallPass) {
      console.log('✅ DC009 元数据管理回测通过!');
    } else {
      console.log('❌ DC009 元数据管理回测未通过!');
    }
    console.log('='.repeat(50));

    return overallPass;
  } catch (error) {
    console.error('❌ 回测执行失败:', error);
    return false;
  }
}

// 执行回测
runDC009Backtest()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ 回测执行异常:', error);
    process.exit(1);
  });
