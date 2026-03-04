const fs = require('fs');
const path = require('path');

console.log('⚡ 开始性能优化检查...\n');

let optimizedFiles = 0;
let importOptimizations = 0;

// 跳过的目录
const skipDirs = ['node_modules', '.next', 'out', '.git', 'tests', '__tests__'];

// 优化大型库的导入
const largeLibraries = {
  lodash: '_',
  moment: 'moment',
  rxjs: 'rxjs',
  axios: 'axios',
};

// 递归处理文件
function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);

    try {
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (skipDirs.includes(file)) {
          return;
        }
        processDirectory(filePath);
      } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        // 优化 1: 将全量导入改为按需导入（针对特定库）
        Object.keys(largeLibraries).forEach(lib => {
          const importAs = largeLibraries[lib];

          // 查找全量导入
          const fullImportRegex = new RegExp(
            `import\\s+${importAs}\\s+from\\s+['"]${lib}['"];?`,
            'g'
          );
          if (fullImportRegex.test(content)) {
            // 检查是否使用了 _.xxx 或 moment() 等
            const usageRegex = new RegExp(`${importAs}\\.(\\w+)`, 'g');
            const usages = [...content.matchAll(usageRegex)];

            if (usages.length > 0 && usages.length <= 5) {
              // 如果使用的方法较少，建议按需导入
              const methods = [...new Set(usages.map(u => u[1]))];
              console.log(
                `💡 ${path.relative(path.join(__dirname, '..'), filePath)}:`
              );
              console.log(
                `   建议：将 \`import ${importAs} from '${lib}'\` 改为按需导入`
              );
              console.log(`   使用的方法：${methods.join(', ')}`);
              console.log();
              importOptimizations++;
            }
          }
        });

        // 优化 2: 移除重复的 React 导入
        const reactImports = content.match(
          /import\s+React\s+from\s+['"]react['"];?/g
        );
        if (reactImports && reactImports.length > 1) {
          content = content.replace(
            /import\s+React\s+from\s+['"]react['"];?\s*/g,
            ''
          );
          content = `import React from 'react';\n${content}`;
          optimizedFiles++;
        }

        // 优化 3: 合并同一文件的多个导入
        const importLines = content
          .split('\n')
          .filter(
            line => line.trim().startsWith('import') && !line.includes('from')
          );

        if (importLines.length > 0) {
          // 有侧导入需要手动检查
        }

        // 保存修改
        if (content !== originalContent && optimizedFiles <= 10) {
          fs.writeFileSync(filePath, content, 'utf8');
          if (optimizedFiles < 5) {
            console.log(
              `✓ 已优化：${path.relative(path.join(__dirname, '..'), filePath)}`
            );
          }
        }
      }
    } catch (error) {
      // 忽略错误
    }
  });
}

// 扫描 src 目录
const srcDir = path.join(__dirname, '..', 'src');
processDirectory(srcDir);

console.log('\n===================================');
console.log('⚡ 性能优化检查报告');
console.log('===================================\n');

console.log(`优化文件数：${optimizedFiles}`);
console.log(`导入优化建议：${importOptimizations} 处`);

console.log('\n\n💡 性能优化建议:');
console.log('-----------------------------------');
console.log('1. 按需导入大型库（lodash, moment 等）');
console.log('2. 使用动态导入实现代码分割');
console.log('3. 优化图片和静态资源加载');
console.log('4. 使用 React.memo 和 useMemo 优化渲染');

console.log('\n\n🔧 下一步优化:');
console.log('-----------------------------------');
console.log('运行构建分析查看 bundle 大小:');
console.log('  npm run build');
console.log('  npx webpack-bundle-analyzer dist/stats.json');
console.log('\n或使用 Next.js 内置分析:');
console.log('  ANALYZE=true npm run build\n');

console.log('===================================\n');
