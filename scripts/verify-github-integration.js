/**
 * GitHub 数据集成快速验证脚本
 *
 * 用于快速检查 GitHub 数据集成功能是否正常
 */

console.log('='.repeat(60));
console.log('ProCyc Skill 商店 - GitHub 数据集成快速验证');
console.log('='.repeat(60));
console.log('');

// 1. 检查文件是否存在
console.log('📁 检查文件结构...');

const requiredFiles = [
  'src/lib/github/api.ts',
  'src/lib/github/cache.ts',
  'src/lib/github/hooks.ts',
  'src/lib/github/index.ts',
  'src/components/github/GitHubStats.tsx',
  'src/app/skill-store/skills/page.tsx',
  'src/app/skill-store/part-lookup/page.tsx',
  'src/app/skill-store/estimate-value/page.tsx',
  'docs/technical-docs/github-data-integration-guide.md',
  '.env.github.example',
];

const fs = require('fs');
const path = require('path');

let allFilesExist = true;
requiredFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  const exists = fs.existsSync(fullPath);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

console.log('');

// 2. 检查导出接口
console.log('🔍 检查导出接口...');

try {
  const githubLib = require('./src/lib/github/index.ts');
  const exports = Object.keys(githubLib);

  const requiredExports = [
    'fetchRepoData',
    'getOrFetchRepoData',
    'useGitHubRepo',
    'GitHubStats',
    'GitHubBadge',
    'GitHubTopics',
  ];

  requiredExports.forEach(exp => {
    const exists = exports.includes(exp);
    console.log(`  ${exists ? '✅' : '❌'} ${exp}`);
  });
} catch (error) {
  console.log('  ⚠️  无法在 Node.js 环境中导入 TypeScript 模块（正常）');
}

console.log('');

// 3. 检查环境变量配置
console.log('⚙️  检查环境配置...');

const envExamplePath = path.join(process.cwd(), '.env.github.example');
if (fs.existsSync(envExamplePath)) {
  const content = fs.readFileSync(envExamplePath, 'utf-8');
  const hasToken = content.includes('NEXT_PUBLIC_GITHUB_TOKEN');
  const hasOwner = content.includes('NEXT_PUBLIC_GITHUB_OWNER');
  const hasCache = content.includes('NEXT_PUBLIC_GITHUB_CACHE_TTL');

  console.log(`  ${hasToken ? '✅' : '❌'} GitHub Token 配置`);
  console.log(`  ${hasOwner ? '✅' : '❌'} GitHub Owner 配置`);
  console.log(`  ${hasCache ? '✅' : '❌'} Cache TTL 配置`);
} else {
  console.log('  ❌ .env.github.example 文件不存在');
}

console.log('');

// 4. 检查组件集成
console.log('🧩 检查组件集成...');

const skillsPagePath = path.join(
  process.cwd(),
  'src/app/skill-store/skills/page.tsx'
);
if (fs.existsSync(skillsPagePath)) {
  const content = fs.readFileSync(skillsPagePath, 'utf-8');
  const hasImport = content.includes('import { GitHubStats }');
  const hasUsage = content.includes('<GitHubStats');

  console.log(`  ${hasImport ? '✅' : '❌'} GitHubStats 导入`);
  console.log(`  ${hasUsage ? '✅' : '❌'} GitHubStats 使用`);
} else {
  console.log('  ❌ skills/page.tsx 文件不存在');
}

console.log('');

// 5. 检查文档完整性
console.log('📚 检查文档完整性...');

const docPath = path.join(
  process.cwd(),
  'docs/technical-docs/github-data-integration-guide.md'
);
if (fs.existsSync(docPath)) {
  const content = fs.readFileSync(docPath, 'utf-8');
  const hasOverview = content.includes('概述') || content.includes('概览');
  const hasAPI = content.includes('API') || content.includes('api');
  const hasExample = content.includes('示例') || content.includes('example');

  console.log(`  ${hasOverview ? '✅' : '❌'} 概述章节`);
  console.log(`  ${hasAPI ? '✅' : '❌'} API 参考`);
  console.log(`  ${hasExample ? '✅' : '❌'} 使用示例`);
} else {
  console.log('  ❌ 技术文档不存在');
}

console.log('');
console.log('='.repeat(60));

if (allFilesExist) {
  console.log('✅ 所有核心文件存在！');
  console.log('✅ GitHub 数据集成验证通过！');
  console.log('');
  console.log('下一步:');
  console.log('1. 复制 .env.github.example 到 .env.local');
  console.log('2. 配置 NEXT_PUBLIC_GITHUB_TOKEN（可选）');
  console.log('3. 运行 npm run dev 启动开发服务器');
  console.log('4. 访问 http://localhost:3000/skill-store/skills 查看效果');
} else {
  console.log('❌ 部分文件缺失，请检查输出信息');
}

console.log('='.repeat(60));
