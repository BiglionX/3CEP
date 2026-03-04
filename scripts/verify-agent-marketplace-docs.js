#!/usr/bin/env node

/**
 * 智能体市场文档验证脚本
 * 验证智能体市场相关文档的完整性和正确性
 */

const fs = require('fs');
const path = require('path');

// 配置文件路径
const CONFIG = {
  // 主要文档文件
  MAIN_DOCS: [
    {
      path: 'docs/project-planning/agent-marketplace-optimization-plan.md',
      name: '智能体市场优化方案',
      requiredSections: [
        '项目背景与目标',
        '整体架构设计',
        '原子任务清单',
        '技术实现细节',
      ],
    },
    {
      path: 'docs/project-overview/project-specification.md',
      name: '项目说明书',
      requiredSections: ['智能体市场平台', 'FixCycle 6.0'],
    },
  ],

  // 相关技术文档
  TECH_DOCS: [
    'docs/modules/foreign-trade/specification.md',
    'docs/modules/procurement-intelligence/upgrade-specification.md',
    'docs/technical-docs/user-management-optimization.md',
  ],

  // 验证规则
  VALIDATION_RULES: {
    MIN_LENGTH: 1000, // 最小文件长度
    REQUIRED_KEYWORDS: ['智能体', 'Agent', 'Marketplace', 'Token'],
    LINK_PATTERNS: [/\[.*?\]\(.*?\)/g, /\/src\/app\//g],
  },
};

/**
 * 验证单个文档文件
 */
function validateDocument(filePath, docName, requiredSections = []) {
  console.log(`🔍 验证文档: ${docName}`);
  console.log(`📁 文件路径: ${filePath}`);

  try {
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      console.error(`❌ 文件不存在: ${filePath}`);
      return { success: false, error: 'FILE_NOT_FOUND' };
    }

    // 读取文件内容
    const content = fs.readFileSync(filePath, 'utf8');
    const stats = fs.statSync(filePath);

    console.log(`📊 文件大小: ${stats.size} 字节`);
    console.log(`📝 行数: ${content.split('\n').length} 行`);

    // 基本验证
    const validation = {
      success: true,
      checks: {},
      errors: [],
      warnings: [],
    };

    // 长度检查
    validation.checks.minLength =
      content.length >= CONFIG.VALIDATION_RULES.MIN_LENGTH;
    if (!validation.checks.minLength) {
      validation.warnings.push(
        `文件长度不足 (${content.length} < ${CONFIG.VALIDATION_RULES.MIN_LENGTH})`
      );
    }

    // 关键词检查
    validation.checks.keywords = {};
    CONFIG.VALIDATION_RULES.REQUIRED_KEYWORDS.forEach(keyword => {
      const count = (content.match(new RegExp(keyword, 'gi')) || []).length;
      validation.checks.keywords[keyword] = count > 0;
      if (count === 0) {
        validation.warnings.push(`缺少关键词: ${keyword}`);
      }
    });

    // 章节检查
    if (requiredSections.length > 0) {
      validation.checks.sections = {};
      requiredSections.forEach(section => {
        const hasSection = content.includes(section);
        validation.checks.sections[section] = hasSection;
        if (!hasSection) {
          validation.errors.push(`缺少必要章节: ${section}`);
        }
      });
    }

    // 链接检查
    validation.checks.links = {};
    const linkMatches =
      content.match(CONFIG.VALIDATION_RULES.LINK_PATTERNS[0]) || [];
    validation.checks.links.internalLinks = linkMatches.length;

    const pathMatches =
      content.match(CONFIG.VALIDATION_RULES.LINK_PATTERNS[1]) || [];
    validation.checks.links.codeReferences = pathMatches.length;

    // 状态汇总
    const hasErrors = validation.errors.length > 0;
    const hasWarnings = validation.warnings.length > 0;

    if (hasErrors) {
      validation.success = false;
      console.error(`❌ 验证失败:`);
      validation.errors.forEach(err => console.error(`   - ${err}`));
    } else if (hasWarnings) {
      console.warn(`⚠️  存在警告:`);
      validation.warnings.forEach(warn => console.warn(`   - ${warn}`));
    } else {
      console.log(`✅ 验证通过`);
    }

    return validation;
  } catch (error) {
    console.error(`❌ 验证过程中发生错误: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 验证文档引用完整性
 */
function validateCrossReferences() {
  console.log('\n🔗 验证文档间引用完整性');

  const references = {
    success: true,
    missingRefs: [],
    brokenLinks: [],
  };

  // 检查项目说明书中是否正确引用了智能体市场文档
  const specPath = 'docs/project-overview/project-specification.md';
  if (fs.existsSync(specPath)) {
    const specContent = fs.readFileSync(specPath, 'utf8');

    const marketplaceRef = specContent.includes(
      'agent-marketplace-optimization-plan.md'
    );
    if (!marketplaceRef) {
      references.missingRefs.push('项目说明书缺少对智能体市场文档的引用');
    }

    const fixcycle6Ref = specContent.includes('FixCycle 6.0');
    if (!fixcycle6Ref) {
      references.missingRefs.push('项目说明书缺少FixCycle 6.0版本标识');
    }
  }

  // 检查智能体市场文档中引用的其他文档是否存在
  const planPath =
    'docs/project-planning/agent-marketplace-optimization-plan.md';
  if (fs.existsSync(planPath)) {
    const planContent = fs.readFileSync(planPath, 'utf8');

    // 检查引用的相关文档
    CONFIG.TECH_DOCS.forEach(docPath => {
      if (
        planContent.includes(path.basename(docPath)) &&
        !fs.existsSync(docPath)
      ) {
        references.brokenLinks.push(`引用的文档不存在: ${docPath}`);
      }
    });
  }

  // 输出结果
  if (references.missingRefs.length > 0 || references.brokenLinks.length > 0) {
    references.success = false;
    console.error(`❌ 引用完整性检查失败:`);
    references.missingRefs.forEach(ref => console.error(`   - ${ref}`));
    references.brokenLinks.forEach(link => console.error(`   - ${link}`));
  } else {
    console.log(`✅ 文档引用完整`);
  }

  return references;
}

/**
 * 生成验证报告
 */
function generateReport(results) {
  console.log(`\n${'='.repeat(60)}`);
  console.log('📋 智能体市场文档验证报告');
  console.log('='.repeat(60));

  const timestamp = new Date().toISOString();
  console.log(`📅 验证时间: ${timestamp}`);
  console.log(`📂 工作目录: ${process.cwd()}`);

  // 统计信息
  const totalDocs = CONFIG.MAIN_DOCS.length;
  const passedDocs = results.mainDocs.filter(r => r.validation.success).length;
  const failedDocs = totalDocs - passedDocs;

  console.log(`\n📈 验证统计:`);
  console.log(`   总文档数: ${totalDocs}`);
  console.log(`   通过: ${passedDocs}`);
  console.log(`   失败: ${failedDocs}`);
  console.log(`   通过率: ${((passedDocs / totalDocs) * 100).toFixed(1)}%`);

  // 详细结果
  console.log(`\n📄 详细验证结果:`);
  results.mainDocs.forEach(result => {
    const status = result.validation.success ? '✅' : '❌';
    console.log(`   ${status} ${result.doc.name}`);
    if (!result.validation.success) {
      if (result.validation.errors) {
        result.validation.errors.forEach(err => console.log(`      - ${err}`));
      }
      if (result.validation.error) {
        console.log(`      - 错误: ${result.validation.error}`);
      }
    }
  });

  // 引用检查结果
  console.log(
    `\n🔗 引用完整性: ${results.crossRefs.success ? '✅ 通过' : '❌ 失败'}`
  );
  if (!results.crossRefs.success) {
    results.crossRefs.missingRefs.forEach(ref => console.log(`   - ${ref}`));
    results.crossRefs.brokenLinks.forEach(link => console.log(`   - ${link}`));
  }

  // 总体结论
  const overallSuccess =
    results.mainDocs.every(r => r.validation.success) &&
    results.crossRefs.success;
  console.log(
    `\n🎯 总体结论: ${overallSuccess ? '✅ 所有文档验证通过' : '❌ 存在文档问题需要修复'}`
  );

  // 建议
  if (!overallSuccess) {
    console.log(`\n💡 修复建议:`);
    if (failedDocs > 0) {
      console.log(`   - 修复验证失败的文档`);
    }
    if (results.crossRefs.missingRefs.length > 0) {
      console.log(`   - 补充缺失的文档引用`);
    }
    if (results.crossRefs.brokenLinks.length > 0) {
      console.log(`   - 修正损坏的链接`);
    }
  }

  console.log('='.repeat(60));

  return {
    timestamp,
    overallSuccess,
    statistics: {
      totalDocs,
      passedDocs,
      failedDocs,
      passRate: (passedDocs / totalDocs) * 100,
    },
    details: results,
  };
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始智能体市场文档验证...\n');

  try {
    // 验证主文档
    const mainDocResults = [];
    for (const doc of CONFIG.MAIN_DOCS) {
      const fullPath = path.join(process.cwd(), doc.path);
      const validation = validateDocument(
        fullPath,
        doc.name,
        doc.requiredSections
      );
      mainDocResults.push({
        doc,
        validation,
      });
    }

    // 验证交叉引用
    const crossRefResults = validateCrossReferences();

    // 生成报告
    const report = generateReport({
      mainDocs: mainDocResults,
      crossRefs: crossRefResults,
    });

    // 保存报告
    const reportPath = path.join(
      process.cwd(),
      'reports',
      'agent-marketplace-docs-validation-report.json'
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 验证报告已保存至: ${reportPath}`);

    // 返回状态码
    process.exit(report.overallSuccess ? 0 : 1);
  } catch (error) {
    console.error(`❌ 验证过程发生严重错误: ${error.message}`);
    process.exit(1);
  }
}

// 执行验证
if (require.main === module) {
  main();
}

module.exports = {
  validateDocument,
  validateCrossReferences,
  generateReport,
};
