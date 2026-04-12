#!/usr/bin/env node

/**
 * 开源前敏感信息清理检查脚本
 *
 * 检查项目:
 * 1. .env文件中的真实密钥
 * 2. 源代码中的硬编码密钥
 * 3. 测试数据中的敏感信息
 * 4. 配置文件中的私人信息
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  rootDir: path.join(__dirname, '..'),
  excludeDirs: ['node_modules', '.next', '.git', 'coverage', 'test-results'],
  excludeFiles: ['.env.example', '.env.*.example'],
};

// 敏感信息模式
const SENSITIVE_PATTERNS = [
  // API密钥
  { pattern: /sk-[a-zA-Z0-9]{20,}/g, name: 'OpenAI/Similar API Key' },
  { pattern: /AIza[a-zA-Z0-9_-]{35}/g, name: 'Google API Key' },
  { pattern: /AKIA[0-9A-Z]{16}/g, name: 'AWS Access Key' },

  // 私钥
  {
    pattern: /-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/g,
    name: 'Private Key',
  },

  // 密码
  {
    pattern: /password\s*[:=]\s*['"][^'"]{8,}['"]/gi,
    name: 'Hardcoded Password',
  },

  // Token
  {
    pattern: /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g,
    name: 'JWT Token',
  },

  // Supabase密钥
  { pattern: /sbp_[a-zA-Z0-9]{40}/g, name: 'Supabase Service Role Key' },

  // 数据库连接字符串(含密码)
  {
    pattern: /postgresql:\/\/[^:]+:[^@]+@/g,
    name: 'Database Connection String with Password',
  },
];

// 检查结果
const results = {
  filesScanned: 0,
  issuesFound: 0,
  issues: [],
  cleanFiles: [],
};

/**
 * 检查文件是否应该被排除
 */
function shouldExclude(filePath) {
  const relativePath = path.relative(CONFIG.rootDir, filePath);

  // 检查目录排除
  for (const dir of CONFIG.excludeDirs) {
    if (relativePath.includes(dir)) {
      return true;
    }
  }

  // 检查文件排除
  const fileName = path.basename(filePath);
  for (const pattern of CONFIG.excludeFiles) {
    const regex = new RegExp(pattern.replace('.', '\\.').replace('*', '.*'));
    if (regex.test(fileName)) {
      return true;
    }
  }

  return false;
}

/**
 * 扫描文件内容
 */
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];

    for (const { pattern, name } of SENSITIVE_PATTERNS) {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        issues.push({
          file: path.relative(CONFIG.rootDir, filePath),
          type: name,
          count: matches.length,
          line: getLineNumber(content, matches[0]),
        });
      }
    }

    return issues;
  } catch (error) {
    // 跳过无法读取的文件(二进制文件等)
    return [];
  }
}

/**
 * 获取匹配内容的行号
 */
function getLineNumber(content, match) {
  const index = content.indexOf(match);
  const lines = content.substring(0, index).split('\n');
  return lines.length;
}

/**
 * 递归扫描目录
 */
function scanDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (!shouldExclude(fullPath)) {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile()) {
      if (!shouldExclude(fullPath)) {
        results.filesScanned++;

        const issues = scanFile(fullPath);
        if (issues.length > 0) {
          results.issuesFound += issues.length;
          results.issues.push(...issues);
        } else {
          results.cleanFiles.push(path.relative(CONFIG.rootDir, fullPath));
        }
      }
    }
  }
}

/**
 * 检查.env文件
 */
function checkEnvFiles() {
  console.log('\n🔍 检查环境变量文件...\n');

  const envPattern = /\.env(\..+)?$/;
  const envFiles = [];

  function findEnvFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && !shouldExclude(fullPath)) {
        findEnvFiles(fullPath);
      } else if (entry.isFile() && envPattern.test(entry.name)) {
        envFiles.push(fullPath);
      }
    }
  }

  findEnvFiles(CONFIG.rootDir);

  for (const envFile of envFiles) {
    const relativePath = path.relative(CONFIG.rootDir, envFile);
    const content = fs.readFileSync(envFile, 'utf8');

    // 检查是否包含占位符
    const hasPlaceholders = /YOUR_|CHANGE_ME|EXAMPLE|xxx/i.test(content);
    const hasRealValues = !hasPlaceholders && content.length > 50;

    if (hasRealValues && !envFile.includes('.example')) {
      console.log(`⚠️  ${relativePath}: 可能包含真实配置`);

      // 检查具体字段
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.trim() && !line.startsWith('#')) {
          const [key, value] = line.split('=');
          if (
            value &&
            value.length > 10 &&
            !/^(http|localhost|true|false|\d+)$/i.test(value.trim())
          ) {
            console.log(`   - ${key}: ${value.substring(0, 20)}...`);
          }
        }
      }
    } else {
      console.log(`✅ ${relativePath}: 安全(使用占位符或示例)`);
    }
  }
}

/**
 * 检查.gitignore配置
 */
function checkGitignore() {
  console.log('\n📝 检查.gitignore配置...\n');

  const gitignorePath = path.join(CONFIG.rootDir, '.gitignore');

  if (!fs.existsSync(gitignorePath)) {
    console.log('❌ 未找到 .gitignore 文件');
    return;
  }

  const content = fs.readFileSync(gitignorePath, 'utf8');
  const requiredPatterns = [
    '.env.local',
    '.env.*.local',
    '*.key',
    '*.pem',
    '*.secret',
    'test-data/',
    'reports/*.log',
  ];

  let allPresent = true;

  for (const pattern of requiredPatterns) {
    if (content.includes(pattern)) {
      console.log(`✅ ${pattern}`);
    } else {
      console.log(`❌ 缺少: ${pattern}`);
      allPresent = false;
    }
  }

  if (allPresent) {
    console.log('\n✅ .gitignore配置完整');
  } else {
    console.log('\n⚠️  建议添加缺失的模式到.gitignore');
  }
}

/**
 * 生成报告
 */
function generateReport() {
  console.log(`\n${'='.repeat(70)}`);
  console.log('📊 敏感信息检查报告');
  console.log('='.repeat(70));

  console.log(`\n扫描文件数: ${results.filesScanned}`);
  console.log(`发现问题: ${results.issuesFound}`);

  if (results.issues.length > 0) {
    console.log('\n❌ 发现的问题:\n');

    for (const issue of results.issues) {
      console.log(`文件: ${issue.file}`);
      console.log(`类型: ${issue.type}`);
      console.log(`数量: ${issue.count}`);
      console.log(`行号: ~${issue.line}`);
      console.log('-'.repeat(70));
    }

    console.log('\n⚠️  建议在提交前修复以上问题!');
  } else {
    console.log('\n✅ 未发现敏感信息泄露!');
  }

  console.log(`\n${'='.repeat(70)}`);
}

/**
 * 主函数
 */
function main() {
  console.log('🔒 开源前敏感信息清理检查');
  console.log('开始时间:', new Date().toISOString());
  console.log('扫描目录:', CONFIG.rootDir);

  const startTime = Date.now();

  try {
    // 扫描代码文件
    console.log('\n🔍 扫描源代码文件...\n');
    scanDirectory(CONFIG.rootDir);

    // 检查.env文件
    checkEnvFiles();

    // 检查.gitignore
    checkGitignore();

    // 生成报告
    generateReport();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`\n⏱️  扫描耗时: ${duration}秒`);

    // 保存详细报告
    const reportPath = path.join(CONFIG.rootDir, 'reports/security-audit.json');
    const reportDir = path.dirname(reportPath);

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          summary: {
            filesScanned: results.filesScanned,
            issuesFound: results.issuesFound,
          },
          issues: results.issues,
        },
        null,
        2
      )
    );

    console.log(`\n📄 详细报告已保存至: ${reportPath}`);

    // 退出码
    process.exit(results.issuesFound > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ 检查过程出错:', error);
    process.exit(1);
  }
}

// 运行检查
main();
