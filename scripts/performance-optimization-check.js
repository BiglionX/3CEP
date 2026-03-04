#!/usr/bin/env node

/**
 * 性能优化检查脚本
 * 检查页面加载性能、图片优化、代码分割等
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始性能优化检查...\n');

// 检查关键性能指标
const performanceChecks = {
  // 图片优化检查
  imageOptimization: () => {
    console.log('🖼️  图片优化检查:');
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    let imageCount = 0;
    const largeImages = [];

    function scanDirectory(dir) {
      try {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);

          if (
            stat.isDirectory() &&
            !['node_modules', '.next', '.git'].includes(file)
          ) {
            scanDirectory(filePath);
          } else if (stat.isFile()) {
            const ext = path.extname(file).toLowerCase();
            if (imageExtensions.includes(ext)) {
              imageCount++;
              if (stat.size > 100 * 1024) {
                // 大于100KB的图片
                largeImages.push({
                  path: filePath.replace(process.cwd(), ''),
                  size: `${Math.round(stat.size / 1024)}KB`,
                });
              }
            }
          }
        });
      } catch (error) {
        // 忽略无法访问的目录
      }
    }

    scanDirectory('./public');
    scanDirectory('./src');

    console.log(`   发现 ${imageCount} 张图片`);
    if (largeImages.length > 0) {
      console.log(`   ⚠️  发现 ${largeImages.length} 张大尺寸图片:`);
      largeImages.slice(0, 5).forEach(img => {
        console.log(`     - ${img.path} (${img.size})`);
      });
      if (largeImages.length > 5) {
        console.log(`     ... 还有 ${largeImages.length - 5} 张`);
      }
    } else {
      console.log('   ✅ 所有图片尺寸合理');
    }
    console.log('');
  },

  // 代码分割检查
  codeSplitting: () => {
    console.log('✂️  代码分割检查:');
    const dynamicImports = [];

    function scanFiles(dir) {
      try {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);

          if (
            stat.isDirectory() &&
            !['node_modules', '.next', '.git'].includes(file)
          ) {
            scanFiles(filePath);
          } else if (
            stat.isFile() &&
            (file.endsWith('.tsx') || file.endsWith('.jsx'))
          ) {
            try {
              const content = fs.readFileSync(filePath, 'utf8');
              const dynamicImportMatches = content.match(/import\([^)]+\)/g);
              if (dynamicImportMatches) {
                dynamicImports.push({
                  file: filePath.replace(process.cwd(), ''),
                  count: dynamicImportMatches.length,
                });
              }
            } catch (error) {
              // 忽略无法读取的文件
            }
          }
        });
      } catch (error) {
        // 忽略无法访问的目录
      }
    }

    scanFiles('./src');

    if (dynamicImports.length > 0) {
      console.log(`   发现 ${dynamicImports.length} 个使用动态导入的文件:`);
      dynamicImports.forEach(item => {
        console.log(`     - ${item.file} (${item.count} 处)`);
      });
    } else {
      console.log('   ⚠️  建议在大型组件中使用动态导入优化加载速度');
    }
    console.log('');
  },

  // 第三方库检查
  thirdPartyLibraries: () => {
    console.log('📦 第三方库检查:');

    try {
      const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      const largeLibraries = [
        'lodash',
        'moment',
        'rxjs',
        'three',
        'd3',
        'chart.js',
      ];

      const heavyLibs = Object.keys(dependencies).filter(lib =>
        largeLibraries.includes(lib.split('/')[0])
      );

      if (heavyLibs.length > 0) {
        console.log(`   ⚠️  检测到可能较重的第三方库:`);
        heavyLibs.forEach(lib => {
          console.log(`     - ${lib}: ${dependencies[lib]}`);
        });
        console.log('   建议考虑轻量级替代方案或按需引入');
      } else {
        console.log('   ✅ 第三方库使用合理');
      }
    } catch (error) {
      console.log('   ⚠️  无法读取 package.json 文件');
    }
    console.log('');
  },

  // SEO优化检查
  seoOptimization: () => {
    console.log('🔍 SEO优化检查:');

    const metaTags = [];
    const pagesDir = './src/app';

    function checkMetaTags(dir) {
      try {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);

          if (stat.isDirectory()) {
            checkMetaTags(filePath);
          } else if (file === 'page.tsx' || file === 'page.jsx') {
            try {
              const content = fs.readFileSync(filePath, 'utf8');
              const hasTitle = /<title>|useMetadata|metadata/g.test(content);
              const hasDescription = /description/g.test(content);

              metaTags.push({
                path:
                  filePath
                    .replace(pagesDir, '')
                    .replace('/page.tsx', '')
                    .replace('/page.jsx', '') || '/',
                hasTitle,
                hasDescription,
              });
            } catch (error) {
              // 忽略无法读取的文件
            }
          }
        });
      } catch (error) {
        // 忽略无法访问的目录
      }
    }

    checkMetaTags(pagesDir);

    const missingMeta = metaTags.filter(
      page => !page.hasTitle || !page.hasDescription
    );

    if (missingMeta.length > 0) {
      console.log(`   ⚠️  ${missingMeta.length} 个页面缺少SEO元数据:`);
      missingMeta.slice(0, 5).forEach(page => {
        console.log(`     - ${page.path}`);
      });
    } else {
      console.log('   ✅ 所有页面都有基本的SEO元数据');
    }
    console.log('');
  },

  // 用户体验优化建议
  uxImprovements: () => {
    console.log('✨ 用户体验优化建议:');

    const suggestions = [
      '✅ 添加骨架屏(Skeleton Screen)提升加载体验',
      '✅ 实现图片懒加载(Lazy Loading)',
      '✅ 添加页面过渡动画',
      '✅ 优化移动端触摸体验',
      '✅ 添加键盘快捷键支持',
      '✅ 实现离线缓存(Service Worker)',
      '✅ 添加加载状态指示器',
      '✅ 优化表单验证反馈',
      '✅ 添加错误边界(Error Boundary)',
      '✅ 实现自动保存草稿功能',
    ];

    suggestions.forEach(suggestion => {
      console.log(`   ${suggestion}`);
    });
    console.log('');
  },
};

// 执行所有检查
Object.values(performanceChecks).forEach(check => {
  try {
    check();
  } catch (error) {
    console.log(`⚠️  检查过程中出现错误: ${error.message}\n`);
  }
});

console.log('✅ 性能优化检查完成！');
console.log('\n📋 建议优先级:');
console.log('1. 🔴 立即处理: 大尺寸图片压缩、关键SEO优化');
console.log('2. 🟡 尽快处理: 代码分割、用户体验改进');
console.log('3. 🟢 后续优化: 第三方库优化、高级性能特性');

process.exit(0);
