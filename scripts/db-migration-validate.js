#!/usr/bin/env node

/**
 * 数据库迁移语法校验脚本
 * 专门用于 CI/CD 流水线中的迁移检查
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 FixCycle 数据库迁移语法校验\n');
console.log('=====================================\n');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');

// 校验规则定义
const VALIDATION_RULES = {
  fileNameFormat: {
    pattern: /^V\d+\.\d+\.\d+__[\w-]+\.sql$/,
    message: '文件名格式应为: V{major}.{minor}.{patch}__{description}.sql',
  },
  versionIncrement: {
    check: true,
    message: '版本号应该递增且不能重复',
  },
  sqlSyntax: {
    check: true,
    message: 'SQL语法基本校验',
  },
  forbiddenStatements: {
    patterns: [
      { regex: /\bDROP\s+DATABASE\b/i, message: '禁止使用 DROP DATABASE' },
      { regex: /\bDROP\s+SCHEMA\b/i, message: '禁止使用 DROP SCHEMA' },
      { regex: /\bTRUNCATE\b/i, message: '禁止使用 TRUNCATE (除非特别标记)' },
    ],
  },
};

function validateFileName(fileName) {
  console.log(`📄 校验文件名: ${fileName}`);

  if (!VALIDATION_RULES.fileNameFormat.pattern.test(fileName)) {
    console.error(`❌ 文件名格式错误: ${fileName}`);
    console.error(`   期望格式: ${VALIDATION_RULES.fileNameFormat.message}`);
    return false;
  }

  // 解析版本号
  const versionMatch = fileName.match(/^V(\d+)\.(\d+)\.(\d+)__/);
  if (versionMatch) {
    const [, major, minor, patch] = versionMatch;
    console.log(`   版本号: ${major}.${minor}.${patch}`);
  }

  console.log('✅ 文件名格式正确\n');
  return true;
}

function validateSqlSyntax(content, fileName) {
  console.log(`🔍 校验SQL语法: ${fileName}`);

  let hasErrors = false;

  // 检查禁止的语句
  VALIDATION_RULES.forbiddenStatements.patterns.forEach(
    ({ regex, message }) => {
      if (regex.test(content)) {
        console.error(`❌ 发现禁止语句: ${message}`);
        console.error(`   在文件: ${fileName}`);
        const matches = content.match(regex);
        if (matches) {
          console.error(`   匹配内容: ${matches[0]}`);
        }
        hasErrors = true;
      }
    }
  );

  // 检查基本语法结构
  const statements = content
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

  if (statements.length === 0) {
    console.error(`❌ 文件为空或只包含注释: ${fileName}`);
    hasErrors = true;
  }

  // 检查CREATE TABLE语句是否有主键
  const createTableMatches = content.match(/CREATE\s+TABLE\s+(\w+)/gi);
  if (createTableMatches) {
    createTableMatches.forEach(match => {
      const tableName = match.split(/\s+/)[2];
      if (!content.includes(`PRIMARY KEY`) && !content.includes(`REFERENCES`)) {
        console.warn(`⚠️  表 ${tableName} 可能缺少主键约束`);
      }
    });
  }

  if (!hasErrors) {
    console.log(`✅ SQL语法校验通过 (${statements.length} 条语句)\n`);
  }

  return !hasErrors;
}

function validateVersionSequence(files) {
  console.log('🔢 校验版本序列...');

  const versions = files
    .map(file => {
      const versionMatch = file.match(/^V(\d+)\.(\d+)\.(\d+)__/);
      if (versionMatch) {
        const [, major, minor, patch] = versionMatch;
        return {
          file,
          version: `${major}.${minor}.${patch}`,
          numeric:
            parseInt(major) * 1000000 +
            parseInt(minor) * 1000 +
            parseInt(patch),
        };
      }
      return null;
    })
    .filter(Boolean);

  // 按数字版本排序
  versions.sort((a, b) => a.numeric - b.numeric);

  let isValid = true;
  const seenVersions = new Set();

  for (let i = 0; i < versions.length; i++) {
    const current = versions[i];

    // 检查重复版本
    if (seenVersions.has(current.version)) {
      console.error(`❌ 重复版本号: ${current.version} (${current.file})`);
      isValid = false;
    }
    seenVersions.add(current.version);

    // 检查版本跳跃（可选警告）
    if (i > 0) {
      const prev = versions[i - 1];
      const versionDiff = current.numeric - prev.numeric;
      if (versionDiff > 1001) {
        // 允许小版本和补丁版本的变化
        console.warn(`⚠️  版本跳跃较大: ${prev.version} -> ${current.version}`);
      }
    }
  }

  if (isValid) {
    console.log(`✅ 版本序列校验通过 (${versions.length} 个迁移文件)`);
    console.log(`   最新版本: ${versions[versions.length - 1]?.version}\n`);
  }

  return isValid;
}

function main() {
  try {
    // 检查迁移目录是否存在
    if (!fs.existsSync(MIGRATIONS_DIR)) {
      console.error(`❌ 迁移目录不存在: ${MIGRATIONS_DIR}`);
      process.exit(1);
    }

    // 获取所有迁移文件
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.sql') && file.startsWith('V'))
      .sort();

    if (files.length === 0) {
      console.log('⚠️  未发现迁移文件');
      process.exit(0);
    }

    console.log(`📁 发现 ${files.length} 个迁移文件\n`);

    let allValid = true;

    // 校验每个文件
    for (const file of files) {
      console.log('─'.repeat(50));

      // 文件名校验
      if (!validateFileName(file)) {
        allValid = false;
        continue;
      }

      // SQL内容校验
      const filePath = path.join(MIGRATIONS_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');

      if (!validateSqlSyntax(content, file)) {
        allValid = false;
      }
    }

    console.log('─'.repeat(50));

    // 版本序列校验
    if (!validateVersionSequence(files)) {
      allValid = false;
    }

    // 输出总结
    console.log('=====================================');
    console.log('📋 校验总结');
    console.log('=====================================');

    if (allValid) {
      console.log('✅ 所有迁移文件校验通过！');
      console.log('🚀 可以安全执行数据库迁移');
      process.exit(0);
    } else {
      console.log('❌ 发现迁移文件问题，请修复后重试');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 校验过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 支持命令行参数
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
数据库迁移语法校验工具

用法: node scripts/db-migration-validate.js [选项]

选项:
  --help, -h    显示帮助信息
  --verbose     详细输出模式
  
示例:
  node scripts/db-migration-validate.js
  npm run db:validate
  `);
  process.exit(0);
}

main();
