const fs = require('fs');
const path = require('path');

console.log('🔍 开始检测未使用的导入和死代码...\n');

let filesWithIssues = 0;
let unusedImports = 0;
let deadCodeBlocks = 0;

// 跳过的目录
const skipDirs = [
  'node_modules',
  '.next',
  'out',
  'public',
  '.git',
  'tests',
  '__tests__',
  'coverage',
];

// 检测未使用的导入
function checkUnusedImports(filePath, content) {
  const importRegex =
    /(?:import\s+(?:type\s+)?(?:\w+|\{[^}]+\}|\*\s+as\s+\w+)\s+from\s+['"]([^'"]+)['"];?)/g;
  const matches = [...content.matchAll(importRegex)];

  const issues = [];

  matches.forEach(match => {
    const importPath = match[1];
    const fullImportLine = match[0];

    // 跳过 node_modules 和类型导入
    if (
      importPath.startsWith('node_modules') ||
      fullImportLine.includes('import type')
    ) {
      return;
    }

    // 简单检查：如果导入后从未使用（变量名未出现）
    const varNameMatch = fullImportLine.match(
      /import\s+(?:type\s+)?(\w+)|(?:from\s+['"][^'"]+['"];?\s*(\w+))/
    );
    if (varNameMatch) {
      const varName = varNameMatch[1] || varNameMatch[2];
      if (varName && !content.includes(varName)) {
        issues.push({
          type: 'unused-import',
          line: content.substring(0, match.index).split('\n').length,
          detail: fullImportLine.trim(),
        });
        unusedImports++;
      }
    }
  });

  return issues;
}

// 检测被注释的代码块
function checkDeadCode(content) {
  const lines = content.split('\n');
  const issues = [];
  let inCommentBlock = false;
  let commentStartLine = 0;
  let commentLines = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 检测多行注释开始
    if (line.includes('/*') && !line.includes('*/')) {
      inCommentBlock = true;
      commentStartLine = i + 1;
      commentLines = 1;
    } else if (inCommentBlock) {
      commentLines++;
      if (line.includes('*/')) {
        // 检测是否是大段注释（超过 5 行）
        if (commentLines > 5) {
          issues.push({
            type: 'dead-code-block',
            startLine: commentStartLine,
            endLine: i + 1,
            lines: commentLines,
          });
          deadCodeBlocks++;
        }
        inCommentBlock = false;
      }
    }

    // 检测单行注释的代码（简单的启发式）
    if (
      line.trim().startsWith('//') &&
      (line.includes('=') ||
        line.includes('function') ||
        line.includes('const') ||
        line.includes('let'))
    ) {
      // 可能是被注释的代码
      if (commentLines < 5) {
        // 避免重复计数
        issues.push({
          type: 'commented-code',
          line: i + 1,
          detail: line.trim(),
        });
      }
    }
  }

  return issues;
}

// 递归扫描目录
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);

    try {
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (skipDirs.includes(file)) {
          return;
        }
        scanDirectory(filePath);
      } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
        const content = fs.readFileSync(filePath, 'utf8');

        const importIssues = checkUnusedImports(filePath, content);
        const deadCodeIssues = checkDeadCode(content);

        const allIssues = [...importIssues, ...deadCodeIssues];

        if (allIssues.length > 0) {
          filesWithIssues++;

          if (filesWithIssues <= 15) {
            console.log(
              `\n📄 ${path.relative(path.join(__dirname, '..'), filePath)}:`
            );
            allIssues.slice(0, 3).forEach(issue => {
              if (issue.type === 'unused-import') {
                console.log(
                  `   ⚠️  未使用导入 (L${issue.line}): ${issue.detail.substring(0, 60)}...`
                );
              } else if (issue.type === 'dead-code-block') {
                console.log(
                  `   🗑️  大段注释代码 (L${issue.startLine}-L${issue.endLine}): ${issue.lines}行`
                );
              } else if (issue.type === 'commented-code') {
                console.log(
                  `   💬 注释代码 (L${issue.line}): ${issue.detail.substring(0, 50)}...`
                );
              }
            });
            if (allIssues.length > 3) {
              console.log(`   ...还有 ${allIssues.length - 3} 个问题`);
            }
          }
        }
      }
    } catch (error) {
      // 忽略读取错误
    }
  });
}

// 扫描 src 目录
const srcDir = path.join(__dirname, '..', 'src');
scanDirectory(srcDir);

console.log('\n===================================');
console.log('📊 死代码检测报告');
console.log('===================================\n');

console.log(`扫描发现 ${filesWithIssues} 个文件存在问题`);
console.log(`未使用的导入：${unusedImports} 处`);
console.log(`大段注释代码块：${deadCodeBlocks} 处`);

console.log('\n\n💡 建议处理方式:');
console.log('-----------------------------------');
console.log('1. 未使用导入：可以直接删除，或保留用于未来扩展');
console.log('2. 大段注释代码（>5 行）：如确认无用，建议删除');
console.log('3. 注释代码：如是调试代码可删除，如是说明需转换为文档');

console.log('\n\n🔧 自动化清理建议:');
console.log('-----------------------------------');
console.log('可以使用以下工具自动清理:');
console.log('  - TypeScript: --noUnusedLocals --noUnusedParameters');
console.log('  - ESLint: no-unused-vars, no-unused-imports');
console.log('  - depcheck: 检测未使用的依赖包');

console.log('\n===================================\n');
