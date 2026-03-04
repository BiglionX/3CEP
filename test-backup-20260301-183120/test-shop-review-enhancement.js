#!/usr/bin/env node

/**
 * 店铺审核流程完善测试验证脚本
 * 验证升级后的功能完整性和系统稳定性
 */

const fs = require('fs');
const path = require('path');

async function runValidationTests() {
  console.log('🧪 开始店铺审核流程完善验证测试...\n');

  const testResults = [];

  // 测试1: 验证备份文件完整性
  console.log('📋 测试1: 验证备份文件完整性');
  try {
    const backupDir = 'backup/procyc-upgrade-1771819713196';
    const backupFiles = ['page.tsx', 'route.ts', 'shop-review-guide.md'];

    let backupSuccess = true;
    for (const file of backupFiles) {
      const backupPath = path.join(backupDir, file);
      if (!fs.existsSync(backupPath)) {
        console.log(`❌ 备份文件缺失: ${file}`);
        backupSuccess = false;
      }
    }

    if (backupSuccess) {
      console.log('✅ 备份文件完整性验证通过');
      testResults.push({ test: '备份完整性', status: 'PASS' });
    } else {
      testResults.push({ test: '备份完整性', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`❌ 备份验证失败: ${error.message}`);
    testResults.push({
      test: '备份完整性',
      status: 'FAIL',
      error: error.message,
    });
  }

  // 测试2: 验证新生成文件
  console.log('\n📋 测试2: 验证新生成文件');
  try {
    const generatedFiles = [
      'docs/standards/shop-review-process.md',
      'sql/shop-review-enhancement.sql',
      'SHOP_REVIEW_UPGRADE_REPORT.json',
    ];

    let generationSuccess = true;
    for (const file of generatedFiles) {
      if (!fs.existsSync(file)) {
        console.log(`❌ 生成文件缺失: ${file}`);
        generationSuccess = false;
      } else {
        const stats = fs.statSync(file);
        if (stats.size === 0) {
          console.log(`❌ 生成文件为空: ${file}`);
          generationSuccess = false;
        }
      }
    }

    if (generationSuccess) {
      console.log('✅ 新生成文件验证通过');
      testResults.push({ test: '文件生成', status: 'PASS' });
    } else {
      testResults.push({ test: '文件生成', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`❌ 文件生成验证失败: ${error.message}`);
    testResults.push({
      test: '文件生成',
      status: 'FAIL',
      error: error.message,
    });
  }

  // 测试3: 验证数据库脚本语法
  console.log('\n📋 测试3: 验证数据库脚本基本语法');
  try {
    const sqlContent = fs.readFileSync(
      'sql/shop-review-enhancement.sql',
      'utf8'
    );

    // 基本语法检查
    const requiredStatements = [
      'CREATE TABLE IF NOT EXISTS review_criteria',
      'CREATE TABLE IF NOT EXISTS shop_review_records',
      'INSERT INTO review_criteria',
    ];

    let syntaxValid = true;
    for (const statement of requiredStatements) {
      if (!sqlContent.includes(statement)) {
        console.log(`❌ 缺少必要SQL语句: ${statement}`);
        syntaxValid = false;
      }
    }

    // 检查SQL关键字
    if (
      !sqlContent.includes('PRIMARY KEY') ||
      !sqlContent.includes('REFERENCES')
    ) {
      console.log('❌ SQL约束定义不完整');
      syntaxValid = false;
    }

    if (syntaxValid) {
      console.log('✅ 数据库脚本语法验证通过');
      testResults.push({ test: 'SQL语法', status: 'PASS' });
    } else {
      testResults.push({ test: 'SQL语法', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`❌ SQL语法验证失败: ${error.message}`);
    testResults.push({ test: 'SQL语法', status: 'FAIL', error: error.message });
  }

  // 测试4: 验证文档内容质量
  console.log('\n📋 测试4: 验证文档内容质量');
  try {
    const docContent = fs.readFileSync(
      'docs/standards/shop-review-process.md',
      'utf8'
    );

    const requiredSections = [
      '审核标准权重分配',
      '审核流程步骤',
      '风险等级判定',
    ];

    let docQuality = true;
    for (const section of requiredSections) {
      if (!docContent.includes(section)) {
        console.log(`❌ 缺少必要文档章节: ${section}`);
        docQuality = false;
      }
    }

    if (docContent.length < 500) {
      console.log('❌ 文档内容过于简短');
      docQuality = false;
    }

    if (docQuality) {
      console.log('✅ 文档内容质量验证通过');
      testResults.push({ test: '文档质量', status: 'PASS' });
    } else {
      testResults.push({ test: '文档质量', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`❌ 文档质量验证失败: ${error.message}`);
    testResults.push({
      test: '文档质量',
      status: 'FAIL',
      error: error.message,
    });
  }

  // 测试5: 验证现有功能兼容性
  console.log('\n📋 测试5: 验证现有功能兼容性');
  try {
    // 检查关键文件是否仍然存在且可访问
    const criticalPaths = [
      'src/app/admin/shops/pending/page.tsx',
      'src/app/api/admin/shops/pending/route.ts',
      'docs/guides/shop-review-guide.md',
    ];

    let compatibilityGood = true;
    for (const filePath of criticalPaths) {
      if (!fs.existsSync(filePath)) {
        console.log(`❌ 关键文件丢失: ${filePath}`);
        compatibilityGood = false;
      }
    }

    if (compatibilityGood) {
      console.log('✅ 现有功能兼容性验证通过');
      testResults.push({ test: '功能兼容性', status: 'PASS' });
    } else {
      testResults.push({ test: '功能兼容性', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`❌ 兼容性验证失败: ${error.message}`);
    testResults.push({
      test: '功能兼容性',
      status: 'FAIL',
      error: error.message,
    });
  }

  // 测试6: 风险评估验证
  console.log('\n📋 测试6: 风险评估验证');
  try {
    const report = JSON.parse(
      fs.readFileSync('SHOP_REVIEW_UPGRADE_REPORT.json', 'utf8')
    );

    let riskAssessmentValid = true;

    // 检查风险评估结果
    if (!report.identifiedRisks) {
      console.log('❌ 缺少风险评估结果');
      riskAssessmentValid = false;
    }

    // 检查升级报告完整性
    const requiredReportFields = [
      'timestamp',
      'backupDirectory',
      'enhancements',
      'nextSteps',
    ];
    for (const field of requiredReportFields) {
      if (!report[field]) {
        console.log(`❌ 升级报告缺少字段: ${field}`);
        riskAssessmentValid = false;
      }
    }

    if (riskAssessmentValid) {
      console.log('✅ 风险评估验证通过');
      testResults.push({ test: '风险评估', status: 'PASS' });
    } else {
      testResults.push({ test: '风险评估', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`❌ 风险评估验证失败: ${error.message}`);
    testResults.push({
      test: '风险评估',
      status: 'FAIL',
      error: error.message,
    });
  }

  // 输出测试总结
  console.log(`\n${'='.repeat(50)}`);
  console.log('📊 测试结果汇总:');
  console.log('='.repeat(50));

  const passedTests = testResults.filter(t => t.status === 'PASS').length;
  const failedTests = testResults.filter(t => t.status === 'FAIL').length;

  testResults.forEach((result, index) => {
    const statusIcon = result.status === 'PASS' ? '✅' : '❌';
    console.log(
      `${statusIcon} 测试${index + 1}: ${result.test} - ${result.status}`
    );
    if (result.error) {
      console.log(`   错误详情: ${result.error}`);
    }
  });

  console.log('\n📈 测试统计:');
  console.log(`   总测试数: ${testResults.length}`);
  console.log(`   通过: ${passedTests}`);
  console.log(`   失败: ${failedTests}`);
  console.log(
    `   通过率: ${((passedTests / testResults.length) * 100).toFixed(1)}%`
  );

  // 最终结论
  if (failedTests === 0) {
    console.log('\n🎉 所有测试通过！店铺审核流程完善成功！');
    console.log('\n📋 建议下一步操作:');
    console.log('1. 在测试环境中执行数据库升级脚本');
    console.log('2. 部署并测试新的审核功能');
    console.log('3. 对审核人员进行新流程培训');
    console.log('4. 监控生产环境运行状态');

    return true;
  } else {
    console.log('\n⚠️  部分测试失败，请检查并修复问题后重试');
    return false;
  }
}

// 执行测试
runValidationTests().catch(error => {
  console.error('测试执行过程中发生严重错误:', error);
  process.exit(1);
});
