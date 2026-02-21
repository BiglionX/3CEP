#!/usr/bin/env node

/**
 * 数据库迁移脚本验证工具
 * 验证迁移脚本语法、依赖关系和完整性
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 FixCycle 数据库迁移验证\n');
console.log('=====================================\n');

// 迁移目录配置
const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');

// SQL关键字检查列表
const REQUIRED_KEYWORDS = ['CREATE', 'ALTER', 'DROP', 'INSERT', 'UPDATE'];
const DANGEROUS_KEYWORDS = ['DELETE', 'TRUNCATE', 'DROP DATABASE', 'DROP SCHEMA'];

function getAllMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error(`❌ 迁移目录不存在: ${MIGRATIONS_DIR}`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  const migrations = [];
  const rollbacks = [];
  
  files.forEach(file => {
    if (file.startsWith('V')) {
      const version = file.split('__')[0].substring(1);
      const description = file.split('__')[1]?.replace('.sql', '') || '';
      migrations.push({ file, version, description, type: 'forward' });
    } else if (file.startsWith('U')) {
      const version = file.split('__')[0].substring(1);
      const description = file.split('__')[1]?.replace('.sql', '') || '';
      rollbacks.push({ file, version, description, type: 'rollback' });
    }
  });
  
  return { migrations, rollbacks };
}

function parseVersion(version) {
  const parts = version.split('.');
  return {
    major: parseInt(parts[0] || 0),
    minor: parseInt(parts[1] || 0),
    patch: parseInt(parts[2] || 0)
  };
}

function validateNamingConvention(files) {
  console.log('📄 命名规范检查:');
  let validCount = 0;
  let invalidCount = 0;
  
  files.forEach(fileObj => {
    const { file, version, description } = fileObj;
    let isValid = true;
    const issues = [];
    
    // 检查版本格式
    if (!/^\d+\.\d+(\.\d+)?$/.test(version)) {
      issues.push('版本号格式不正确');
      isValid = false;
    }
    
    // 检查描述部分
    if (!description || description.length === 0) {
      issues.push('缺少描述信息');
      isValid = false;
    }
    
    // 检查文件名格式
    const expectedPattern = file.startsWith('V') 
      ? `V${version}__${description}.sql`
      : `U${version}__${description}.sql`;
    
    if (file !== expectedPattern) {
      issues.push('文件名不符合命名约定');
      isValid = false;
    }
    
    if (isValid) {
      console.log(`  ✅ ${file}`);
      validCount++;
    } else {
      console.log(`  ❌ ${file}`);
      issues.forEach(issue => console.log(`     - ${issue}`));
      invalidCount++;
    }
  });
  
  return { validCount, invalidCount };
}

function validateVersionSequence(migrations) {
  console.log('\n🔢 版本序列检查:');
  
  if (migrations.length === 0) {
    console.log('  ℹ️  没有迁移文件');
    return true;
  }
  
  let isValid = true;
  const versions = migrations.map(m => m.version);
  
  // 检查版本是否连续（允许跳过版本）
  for (let i = 1; i < versions.length; i++) {
    const prevVer = parseVersion(versions[i-1]);
    const currVer = parseVersion(versions[i]);
    
    // 检查版本是否递增
    if (currVer.major < prevVer.major || 
        (currVer.major === prevVer.major && currVer.minor < prevVer.minor) ||
        (currVer.major === prevVer.major && currVer.minor === prevVer.minor && currVer.patch < prevVer.patch)) {
      console.log(`  ❌ 版本顺序错误: ${versions[i-1]} -> ${versions[i]}`);
      isValid = false;
    }
  }
  
  if (isValid) {
    console.log('  ✅ 版本序列正确');
  }
  
  return isValid;
}

function validateSqlSyntax(content, fileName) {
  const issues = [];
  
  // 检查基本SQL语法
  const lines = content.split('\n');
  
  // 检查是否有内容
  if (content.trim().length === 0) {
    issues.push('文件为空');
    return issues;
  }
  
  // 检查危险操作
  const upperContent = content.toUpperCase();
  DANGEROUS_KEYWORDS.forEach(keyword => {
    if (upperContent.includes(keyword)) {
      issues.push(`包含危险操作: ${keyword}`);
    }
  });
  
  // 检查语句结束符
  const statements = content.split(';');
  const incompleteStatements = statements.filter(stmt => 
    stmt.trim().length > 0 && !stmt.trim().endsWith(';') && stmt !== statements[statements.length - 1]
  );
  
  if (incompleteStatements.length > 0) {
    issues.push(`发现 ${incompleteStatements.length} 个不完整的SQL语句`);
  }
  
  // 检查注释格式
  lines.forEach((line, index) => {
    if (line.includes('--') && !line.trim().startsWith('--')) {
      // 行内注释检查
      const beforeComment = line.split('--')[0];
      if (beforeComment.trim().length > 0 && !beforeComment.trim().endsWith(';')) {
        issues.push(`第 ${index + 1} 行: 注释前缺少语句结束符`);
      }
    }
  });
  
  return issues;
}

function validateContentQuality(content, fileName) {
  const issues = [];
  
  // 检查幂等性操作
  const idempotentPatterns = [
    'IF NOT EXISTS',
    'CREATE TABLE IF NOT EXISTS',
    'CREATE INDEX IF NOT EXISTS',
    'INSERT INTO.*ON CONFLICT',
    'ALTER TABLE.*ADD COLUMN IF NOT EXISTS'
  ];
  
  let hasIdempotentOps = false;
  idempotentPatterns.forEach(pattern => {
    const regex = new RegExp(pattern, 'i');
    if (regex.test(content)) {
      hasIdempotentOps = true;
    }
  });
  
  if (!hasIdempotentOps && content.toUpperCase().includes('CREATE')) {
    issues.push('建议使用幂等性操作 (IF NOT EXISTS)');
  }
  
  // 检查是否有适当的注释
  const commentLines = content.split('\n').filter(line => 
    line.trim().startsWith('--') && line.trim().length > 2
  );
  
  if (commentLines.length === 0) {
    issues.push('缺少必要的注释说明');
  }
  
  // 检查RLS策略
  const hasRLS = content.toUpperCase().includes('ROW LEVEL SECURITY') || 
                 content.toUpperCase().includes('CREATE POLICY');
  
  if (content.toUpperCase().includes('CREATE TABLE') && !hasRLS) {
    issues.push('新建表建议添加RLS策略');
  }
  
  return issues;
}

function validatePairing(migrations, rollbacks) {
  console.log('\n🔁 迁移-回滚配对检查:');
  
  const migrationVersions = new Set(migrations.map(m => m.version));
  const rollbackVersions = new Set(rollbacks.map(r => r.version));
  
  let validPairs = 0;
  let missingRollbacks = 0;
  let orphanedRollbacks = 0;
  
  // 检查每个迁移是否有对应的回滚
  migrations.forEach(migration => {
    if (rollbackVersions.has(migration.version)) {
      console.log(`  ✅ V${migration.version} - ${migration.description}`);
      validPairs++;
    } else {
      console.log(`  ⚠️  V${migration.version} - 缺少回滚脚本`);
      missingRollbacks++;
    }
  });
  
  // 检查孤立的回滚脚本
  rollbacks.forEach(rollback => {
    if (!migrationVersions.has(rollback.version)) {
      console.log(`  ❌ U${rollback.version} - 孤立的回滚脚本`);
      orphanedRollbacks++;
    }
  });
  
  return { validPairs, missingRollbacks, orphanedRollbacks };
}

function analyzeMigrationComplexity(content, fileName) {
  const analysis = {
    statementCount: 0,
    tableCreations: 0,
    indexCreations: 0,
    dataModifications: 0,
    complexity: 'low'
  };
  
  const statements = content.split(';').filter(stmt => stmt.trim().length > 0);
  analysis.statementCount = statements.length;
  
  const upperContent = content.toUpperCase();
  analysis.tableCreations = (upperContent.match(/CREATE TABLE/g) || []).length;
  analysis.indexCreations = (upperContent.match(/CREATE INDEX/g) || []).length;
  analysis.dataModifications = (upperContent.match(/INSERT INTO/g) || []).length +
                              (upperContent.match(/UPDATE.*SET/g) || []).length +
                              (upperContent.match(/DELETE FROM/g) || []).length;
  
  // 计算复杂度
  const complexityScore = analysis.tableCreations * 3 + 
                         analysis.indexCreations * 2 + 
                         analysis.dataModifications * 1 +
                         analysis.statementCount * 0.1;
  
  if (complexityScore > 20) {
    analysis.complexity = 'high';
  } else if (complexityScore > 10) {
    analysis.complexity = 'medium';
  }
  
  return analysis;
}

async function main() {
  try {
    console.log('🔍 开始迁移脚本验证...\n');
    
    // 获取所有迁移文件
    const { migrations, rollbacks } = getAllMigrationFiles();
    
    console.log(`📁 发现 ${migrations.length} 个正向迁移文件`);
    console.log(`📁 发现 ${rollbacks.length} 个回滚文件\n`);
    
    // 1. 命名规范验证
    const namingResult = validateNamingConvention([...migrations, ...rollbacks]);
    
    // 2. 版本序列验证
    const sequenceValid = validateVersionSequence(migrations);
    
    // 3. 内容验证
    console.log('\n📝 内容质量检查:');
    let contentIssues = 0;
    let syntaxIssues = 0;
    
    [...migrations, ...rollbacks].forEach(fileObj => {
      const filePath = path.join(MIGRATIONS_DIR, fileObj.file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 语法检查
      const syntaxProblems = validateSqlSyntax(content, fileObj.file);
      // 内容质量检查
      const qualityIssues = validateContentQuality(content, fileObj.file);
      
      if (syntaxProblems.length > 0 || qualityIssues.length > 0) {
        console.log(`  ⚠️  ${fileObj.file}:`);
        syntaxProblems.forEach(problem => {
          console.log(`     - 语法问题: ${problem}`);
          syntaxIssues++;
        });
        qualityIssues.forEach(issue => {
          console.log(`     - 质量建议: ${issue}`);
          contentIssues++;
        });
      } else {
        console.log(`  ✅ ${fileObj.file}`);
      }
      
      // 复杂度分析
      const complexity = analyzeMigrationComplexity(content, fileObj.file);
      if (complexity.complexity !== 'low') {
        console.log(`     📊 复杂度: ${complexity.complexity} (${complexity.statementCount} 语句)`);
      }
    });
    
    // 4. 配对验证
    const pairingResult = validatePairing(migrations, rollbacks);
    
    // 5. 总结报告
    console.log('\n=====================================');
    console.log('🏆 验证总结报告');
    console.log('=====================================');
    
    const totalFiles = migrations.length + rollbacks.length;
    const passedChecks = namingResult.validCount + (sequenceValid ? 1 : 0) + 
                        (pairingResult.validPairs * 2); // 每个有效配对算2分
    const totalChecks = totalFiles + 1 + (migrations.length * 2); // 文件数 + 序列检查 + 配对检查
    
    console.log(`📊 命名规范: ${namingResult.validCount}/${totalFiles} 通过`);
    console.log(`📊 版本序列: ${sequenceValid ? '通过' : '失败'}`);
    console.log(`📊 语法检查: ${syntaxIssues === 0 ? '通过' : `${syntaxIssues} 个问题`}`);
    console.log(`📊 内容质量: ${contentIssues === 0 ? '良好' : `${contentIssues} 个建议`}`);
    console.log(`📊 迁移配对: ${pairingResult.validPairs}/${migrations.length} 完整`);
    
    if (pairingResult.missingRollbacks > 0) {
      console.log(`   ⚠️  缺少 ${pairingResult.missingRollbacks} 个回滚脚本`);
    }
    if (pairingResult.orphanedRollbacks > 0) {
      console.log(`   ⚠️  存在 ${pairingResult.orphanedRollbacks} 个孤立回滚脚本`);
    }
    
    const passRate = Math.round((passedChecks / totalChecks) * 100);
    console.log(`\n📈 总体通过率: ${passRate}%`);
    
    if (passRate >= 90) {
      console.log('🎉 迁移脚本质量优秀！');
    } else if (passRate >= 75) {
      console.log('👍 迁移脚本质量良好');
    } else {
      console.log('⚠️  迁移脚本需要改进');
    }
    
    // 建议
    console.log('\n💡 改进建议:');
    if (syntaxIssues > 0) {
      console.log('1. 修复发现的语法问题');
    }
    if (contentIssues > 0) {
      console.log('2. 考虑采纳内容质量建议');
    }
    if (pairingResult.missingRollbacks > 0) {
      console.log('3. 为缺少的迁移创建回滚脚本');
    }
    if (pairingResult.orphanedRollbacks > 0) {
      console.log('4. 清理孤立的回滚脚本');
    }
    
    console.log('\n✨ 验证完成！');
    
    // 返回适当的退出码
    process.exit(passRate >= 75 ? 0 : 1);
    
  } catch (error) {
    console.error('\n❌ 验证过程发生错误:', error.message);
    process.exit(1);
  }
}

// 执行主函数
main().catch(error => {
  console.error('❌ 未处理的错误:', error);
  process.exit(1);
});