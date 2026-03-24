#!/usr/bin/env node

/**
 * 批量为管理后台 API 路由添加权限中间件
 *
 * 使用方法:
 * node scripts/apply-middleware-to-admin-routes.js
 */

const fs = require('fs');
const path = require('path');

// 配置
const ADMIN_API_ROOT = path.join(__dirname, '../src/app/api/admin');
const MIDDLEWARE_IMPORT =
  "import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';";

// 资源类型与权限映射
const RESOURCE_PERMISSION_MAP = {
  users: 'users_read',
  shops: 'shops_read',
  devices: 'devices_read',
  content: 'content_read',
  articles: 'content_read',
  tutorials: 'content_read',
  manuals: 'content_read',
  parts: 'parts_read',
  inventory: 'inventory_read',
  procurement: 'procurement_read',
  finance: 'payments_read',
  diagnostics: 'diagnostics_read',
  valuation: 'valuation_read',
  links: 'links_read',
  tenants: 'tenants_read',
  'user-management': 'users_read',
  system: 'settings_read',
};

// 需要跳过的文件或目录
const SKIP_PATTERNS = [
  '[...path]', // 动态路由
];

/**
 * 获取文件路径对应的权限标识
 */
function getPermissionForPath(filePath) {
  const relativePath = path.relative(ADMIN_API_ROOT, filePath);
  const parts = relativePath.split(path.sep);

  // 查找第一个匹配的资源类型
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part !== 'route.ts' && !part.startsWith('[')) {
      const permission = RESOURCE_PERMISSION_MAP[part];
      if (permission) {
        return permission;
      }
    }
  }

  // 默认返回 settings_read
  return 'settings_read';
}

/**
 * 检查文件是否已经应用了中间件
 */
function hasMiddleware(content) {
  return content.includes('apiPermissionMiddleware');
}

/**
 * 检查文件是否应该被跳过
 */
function shouldSkip(filePath) {
  return SKIP_PATTERNS.some(pattern => filePath.includes(pattern));
}

/**
 * 为路由函数添加中间件包装
 */
function wrapHandlerWithMiddleware(content, permission) {
  const lines = content.split('\n');
  const result = [];
  let inExportFunction = false;
  let braceCount = 0;
  let handlerStartLine = -1;
  let handlerEndLine = -1;

  // 查找所有导出的 HTTP 方法函数
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 检测 export async function GET/POST/PUT/DELETE/PATCH
    const match = line.match(
      /^(export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\([^)]*\)\s*\{?)$/
    );

    if (match && line.trim().startsWith('export')) {
      inExportFunction = true;
      handlerStartLine = i;
      braceCount =
        (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;

      // 如果行末已经有 {，直接在这一行后面添加中间件
      if (line.includes('{')) {
        result.push(
          line.replace(
            /\{/,
            ` {\n  return apiPermissionMiddleware(\n    arguments[0],\n    async () => {`
          )
        );
      } else {
        result.push(line);
      }
      continue;
    }

    if (inExportFunction) {
      // 计算大括号数量
      braceCount += (line.match(/\{/g) || []).length;
      braceCount -= (line.match(/\}/g) || []).length;

      // 找到函数结束位置
      if (braceCount === 0 && line.trim().includes('}')) {
        // 在最后一行之前插入中间件的闭合部分
        const indent = line.match(/^(\s*)/)[1];
        result.push(`${indent}},`);
        result.push(`${indent}'${permission}'`);
        result.push(`${indent});`);
        inExportFunction = false;
        handlerEndLine = i;
        continue;
      }
    }

    result.push(line);
  }

  return result.join('\n');
}

/**
 * 更简单的替换方法：直接找到函数体并包装
 */
function applyMiddlewareToFile(filePath, content) {
  const permission = getPermissionForPath(filePath);

  // 如果已经有中间件，跳过
  if (hasMiddleware(content)) {
    console.log(`  ⚠️  已存在中间件，跳过`);
    return null;
  }

  let newContent = content;

  // 添加导入语句（如果没有）
  if (
    !newContent.includes("from '@/tech/middleware/api-permission.middleware'")
  ) {
    // 在第一个 import 语句之后添加
    const firstImportMatch = newContent.match(/^(import\s+.*?;)/m);
    if (firstImportMatch) {
      const insertPos = firstImportMatch.index + firstImportMatch[0].length;
      newContent =
        newContent.substring(0, insertPos) +
        '\n' +
        MIDDLEWARE_IMPORT +
        newContent.substring(insertPos);
    } else {
      // 没有 import 语句，在文件开头添加
      newContent = MIDDLEWARE_IMPORT + '\n\n' + newContent;
    }
  }

  // 包装所有的导出函数
  const exportFunctionRegex =
    /(export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(([^)]*)\)\s*\{)([\s\S]*?)(^\})/gm;

  newContent = newContent.replace(
    exportFunctionRegex,
    (match, header, method, params, body) => {
      const indent = '  ';
      return `${header}
${indent}return apiPermissionMiddleware(
${indent}  arguments[0],
${indent}  async () => {${body}
${indent}  },
${indent}  '${permission}'
${indent});`;
    }
  );

  return newContent;
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 开始扫描管理后台 API 路由...\n');

  const routeFiles = [];

  // 递归查找所有 route.ts 文件
  function findRouteFiles(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        findRouteFiles(fullPath);
      } else if (file === 'route.ts') {
        routeFiles.push(fullPath);
      }
    }
  }

  findRouteFiles(ADMIN_API_ROOT);

  console.log(`📋 发现 ${routeFiles.length} 个路由文件\n`);

  let appliedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  // 处理每个文件
  for (const filePath of routeFiles) {
    const relativePath = path.relative(path.join(__dirname, '..'), filePath);

    console.log(`处理：${relativePath}`);

    // 检查是否应该跳过
    if (shouldSkip(filePath)) {
      console.log(`  ⚠️  跳过动态路由\n`);
      skippedCount++;
      continue;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const newContent = applyMiddlewareToFile(filePath, content);

      if (newContent) {
        // 备份原文件
        const backupPath = filePath + '.backup';
        fs.writeFileSync(backupPath, content, 'utf8');

        // 写入新内容
        fs.writeFileSync(filePath, newContent, 'utf8');

        console.log(`  ✅ 已应用中间件\n`);
        appliedCount++;
      } else {
        console.log(`  ⚠️  无需修改\n`);
        skippedCount++;
      }
    } catch (error) {
      console.error(`  ❌ 错误：${error.message}\n`);
      errorCount++;
    }
  }

  // 输出统计
  console.log('\n' + '='.repeat(50));
  console.log('📊 处理完成统计:');
  console.log(`  ✅ 成功应用：${appliedCount} 个文件`);
  console.log(`  ⚠️  已跳过：${skippedCount} 个文件`);
  console.log(`  ❌ 发生错误：${errorCount} 个文件`);
  console.log(`  📁 总计：${routeFiles.length} 个文件`);
  console.log('='.repeat(50));

  if (appliedCount > 0) {
    console.log('\n💡 提示:');
    console.log('  1. 请检查修改后的文件确保语法正确');
    console.log('  2. 运行 ESLint 检查代码质量');
    console.log('  3. 测试关键 API 端点确保功能正常');
    console.log('  4. 如需恢复备份，删除 .backup 后缀即可\n');
  }
}

// 执行
main().catch(console.error);
