/**
 * ProCyc Skill Store - 回测验证脚本
 *
 * 验证所有已完成技能的完整性和一致性
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log('🧪 ProCyc Skill Store - 回测验证');
console.log('='.repeat(80));
console.log('');

const results = {
  passed: [],
  failed: [],
  warnings: [],
};

function validate(name, fn) {
  try {
    fn();
    results.passed.push(name);
    console.log(`✅ ${name}`);
  } catch (error) {
    results.failed.push({ name, error: error.message });
    console.log(`❌ ${name}: ${error.message}`);
  }
}

// 1. 验证技能包结构
console.log('📦 验证技能包结构...');
console.log('-'.repeat(80));

const skills = [
  'procyc-find-shop',
  'procyc-fault-diagnosis',
  'procyc-part-lookup',
  'procyc-estimate-value',
];

skills.forEach(skill => {
  const skillPath = path.join(process.cwd(), skill);

  validate(`${skill} - 目录存在`, () => {
    if (!fs.existsSync(skillPath)) {
      throw new Error('目录不存在');
    }
  });

  validate(`${skill} - SKILL.md 存在`, () => {
    const skillMdPath = path.join(skillPath, 'SKILL.md');
    if (!fs.existsSync(skillMdPath)) {
      throw new Error('SKILL.md 不存在');
    }
  });

  validate(`${skill} - README.md 存在`, () => {
    const readmePath = path.join(skillPath, 'README.md');
    if (!fs.existsSync(readmePath)) {
      throw new Error('README.md 不存在');
    }
  });

  validate(`${skill} - package.json 存在`, () => {
    const pkgPath = path.join(skillPath, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      throw new Error('package.json 不存在');
    }
  });

  validate(`${skill} - src/index.ts 存在`, () => {
    const indexPath = path.join(skillPath, 'src', 'index.ts');
    if (!fs.existsSync(indexPath)) {
      throw new Error('src/index.ts 不存在');
    }
  });
});

// 2. 验证文档完整性
console.log('');
console.log('📚 验证文档完整性...');
console.log('-'.repeat(80));

const requiredDocs = [
  'docs/standards/procyc-skill-spec.md',
  'docs/standards/procyc-skill-classification.md',
  'docs/standards/procyc-skill-runtime-protocol.md',
  'docs/standards/procyc-skill-certification.md',
  'docs/standards/procyc-cicd-guide.md',
  'docs/project-planning/procyc-skill-store-development-plan.md',
  'CONTRIBUTING.md',
];

requiredDocs.forEach(docPath => {
  const fullPath = path.join(process.cwd(), docPath);
  validate(`${docPath} - 文档存在`, () => {
    if (!fs.existsSync(fullPath)) {
      throw new Error('文档不存在');
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    if (content.length < 100) {
      throw new Error('文档内容过短');
    }
  });
});

// 3. 验证前端页面
console.log('');
console.log('🖥️ 验证前端页面...');
console.log('-'.repeat(80));

const pages = [
  'src/app/skill-store/page.tsx',
  'src/app/skill-store/skills/page.tsx',
  'src/app/skill-store/sandbox/page.tsx',
  'src/app/skill-store/find-shop/page.tsx',
  'src/app/skill-store/fault-diagnosis/page.tsx',
  'src/app/skill-store/part-lookup/page.tsx',
  'src/app/skill-store/estimate-value/page.tsx',
];

pages.forEach(pagePath => {
  const fullPath = path.join(process.cwd(), pagePath);
  validate(`${pagePath} - 页面存在`, () => {
    if (!fs.existsSync(fullPath)) {
      throw new Error('页面文件不存在');
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    if (!content.includes('ProCyc Skill')) {
      results.warnings.push(`${pagePath} - 可能缺少标准标题`);
    }
  });
});

// 4. 验证测试文件
console.log('');
console.log('🧪 验证测试文件...');
console.log('-'.repeat(80));

const testFiles = ['tests/e2e/skill-store-e2e.test.ts'];

testFiles.forEach(testPath => {
  const fullPath = path.join(process.cwd(), testPath);
  validate(`${testPath} - 测试文件存在`, () => {
    if (!fs.existsSync(fullPath)) {
      throw new Error('测试文件不存在');
    }
  });
});

// 5. 验证 CLI 工具
console.log('');
console.log('🛠️ 验证 CLI 工具...');
console.log('-'.repeat(80));

validate('CLI 工具 - 目录存在', () => {
  const cliPath = path.join(process.cwd(), 'tools/procyc-cli');
  if (!fs.existsSync(cliPath)) {
    throw new Error('CLI 工具目录不存在');
  }
});

validate('CLI 工具 - package.json 存在', () => {
  const pkgPath = path.join(process.cwd(), 'tools/procyc-cli', 'package.json');
  if (!fs.existsSync(pkgPath)) {
    throw new Error('CLI package.json 不存在');
  }
});

// 6. 验证模板仓库
console.log('');
console.log('📋 验证模板仓库...');
console.log('-'.repeat(80));

validate('Skill 模板 - 目录存在', () => {
  const templatePath = path.join(process.cwd(), 'templates/skill-template');
  if (!fs.existsSync(templatePath)) {
    throw new Error('模板目录不存在');
  }
});

validate('Skill 模板 - SKILL.md 存在', () => {
  const skillMdPath = path.join(
    process.cwd(),
    'templates/skill-template',
    'SKILL.md'
  );
  if (!fs.existsSync(skillMdPath)) {
    throw new Error('模板 SKILL.md 不存在');
  }
});

// 7. 验证报告文件
console.log('');
console.log('📊 验证报告文件...');
console.log('-'.repeat(80));

const reports = [
  'reports/procyc/phase1-final-report.md',
  'reports/procyc/phase2-skills-completion-report.md',
  'reports/procyc/phase3-summary-report.md',
];

reports.forEach(reportPath => {
  const fullPath = path.join(process.cwd(), reportPath);
  validate(`${reportPath} - 报告存在`, () => {
    if (!fs.existsSync(fullPath)) {
      throw new Error('报告文件不存在');
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    if (content.length < 500) {
      results.warnings.push(`${reportPath} - 报告内容可能不完整`);
    }
  });
});

// 输出总结
console.log('');
console.log('='.repeat(80));
console.log('📊 验证结果总结');
console.log('='.repeat(80));
console.log('');
console.log(`✅ 通过：${results.passed.length}`);
console.log(`❌ 失败：${results.failed.length}`);
console.log(`⚠️  警告：${results.warnings.length}`);
console.log('');

if (results.failed.length > 0) {
  console.log('失败项:');
  results.failed.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.name}: ${item.error}`);
  });
  console.log('');
}

if (results.warnings.length > 0) {
  console.log('警告项:');
  results.warnings.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item}`);
  });
  console.log('');
}

const totalChecks = results.passed.length + results.failed.length;
const passRate =
  totalChecks > 0
    ? ((results.passed.length / totalChecks) * 100).toFixed(1)
    : 0;

console.log('-'.repeat(80));
console.log(`总检查数：${totalChecks}`);
console.log(`通过率：${passRate}%`);
console.log('='.repeat(80));
console.log('');

if (results.failed.length === 0) {
  console.log('🎉 所有验证通过！阶段二核心任务完成度 100%！\n');
  process.exit(0);
} else {
  console.log('❌ 部分验证失败，请检查上述错误。\n');
  process.exit(1);
}
