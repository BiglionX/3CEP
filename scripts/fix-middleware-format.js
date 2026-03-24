#!/usr/bin/env node

/**
 * 修复中间件应用后的格式问题
 */

const fs = require('fs');
const path = require('path');

const ADMIN_API_ROOT = path.join(__dirname, '../src/app/api/admin');

function findRouteFiles(dir) {
  const files = fs.readdirSync(dir);
  const result = [];

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      result.push(...findRouteFiles(fullPath));
    } else if (file === 'route.ts' && !fullPath.includes('[...path]')) {
      result.push(fullPath);
    }
  }

  return result;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 1. 移除 BOM 字符
  if (content.startsWith('\uFEFF')) {
    content = content.replace(/^\uFEFF/, '');
    modified = true;
  }

  // 2. 修复重复的 import
  const importLines = content.match(/^import\s+.*?;/gm) || [];
  if (importLines.length > 0) {
    const uniqueImports = [...new Set(importLines)];
    if (uniqueImports.length < importLines.length) {
      // 有重复的 import
      let newContent = content;
      uniqueImports.forEach(imp => {
        const regex = new RegExp(
          imp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          'gm'
        );
        const matches = newContent.match(regex);
        if (matches && matches.length > 1) {
          // 保留第一个，删除其他的
          let count = 0;
          newContent = newContent.replace(regex, match => {
            count++;
            return count === 1 ? match : '';
          });
          modified = true;
        }
      });
      content = newContent;
    }
  }

  // 3. 确保 NextRequest 被使用而不是 arguments[0]
  if (content.includes('arguments[0]')) {
    // 这是正常的中间件调用方式，不需要修改
  }

  // 4. 清理多余的空行
  content = content.replace(/\n{3,}/g, '\n\n');

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ 已修复`);
    return true;
  }

  console.log(`  ✓ 无需修复`);
  return false;
}

async function main() {
  console.log('🔧 开始修复中间件格式问题...\n');

  const routeFiles = findRouteFiles(ADMIN_API_ROOT);
  console.log(`📋 发现 ${routeFiles.length} 个路由文件\n`);

  let fixedCount = 0;

  for (const filePath of routeFiles) {
    const relativePath = path.relative(path.join(__dirname, '..'), filePath);
    console.log(`处理：${relativePath}`);

    if (fixFile(filePath)) {
      fixedCount++;
    }
  }

  console.log(`\n✅ 完成！修复了 ${fixedCount} 个文件`);
}

main().catch(console.error);
