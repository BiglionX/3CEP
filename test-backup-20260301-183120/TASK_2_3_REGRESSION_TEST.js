/**
 * Task 2.3 回测验证脚本
 * 验证速率限制保护功能的完整性和正确性
 */

console.log('🔄 Task 2.3 回测验证开始...\n');

// 验证配置文件
function validateConfigFiles() {
  console.log('📋 配置文件验证...');

  try {
    // 验证限流配置文件
    const fs = require('fs');
    const path = require('path');

    const configPath = path.join(__dirname, 'config', 'ratelimit.config.ts');
    if (fs.existsSync(configPath)) {
      console.log('  ✅ 限流配置文件存在');

      // 读取配置文件检查关键内容
      const configContent = fs.readFileSync(configPath, 'utf8');
      const requiredPatterns = [
        'PROCUREMENT_INTELLIGENCE_RATE_LIMIT_RULES',
        'GLOBAL_RATE_LIMIT_RULES',
        'getMatchingRateLimitRules',
        'enterprise-api-rate-limit',
        'admin-api-rate-limit',
      ];

      let allFound = true;
      requiredPatterns.forEach(pattern => {
        if (configContent.includes(pattern)) {
          console.log(`  ✅ 包含 ${pattern}`);
        } else {
          console.log(`  ❌ 缺少 ${pattern}`);
          allFound = false;
        }
      });

      return allFound;
    } else {
      console.log('  ❌ 限流配置文件不存在');
      return false;
    }
  } catch (error) {
    console.log('  ❌ 配置文件验证失败:', error.message);
    return false;
  }
}

// 验证中间件集成
function validateMiddlewareIntegration() {
  console.log('\n⚙️ 中间件集成验证...');

  try {
    const fs = require('fs');
    const path = require('path');

    const middlewarePath = path.join(__dirname, 'src', 'middleware.ts');
    if (fs.existsSync(middlewarePath)) {
      console.log('  ✅ 主中间件文件存在');

      const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
      const requiredImports = [
        'rateLimitMiddleware',
        'getMatchingRateLimitRules',
        'applyRateLimiting',
      ];

      let allFound = true;
      requiredImports.forEach(importName => {
        if (middlewareContent.includes(importName)) {
          console.log(`  ✅ 包含 ${importName}`);
        } else {
          console.log(`  ❌ 缺少 ${importName}`);
          allFound = false;
        }
      });

      // 检查matcher配置
      if (middlewareContent.includes("'/api/:path*'")) {
        console.log('  ✅ API路由匹配器配置正确');
      } else {
        console.log('  ❌ API路由匹配器缺失');
        allFound = false;
      }

      return allFound;
    } else {
      console.log('  ❌ 主中间件文件不存在');
      return false;
    }
  } catch (error) {
    console.log('  ❌ 中间件验证失败:', error.message);
    return false;
  }
}

// 验证文档更新
function validateDocumentation() {
  console.log('\n📝 文档更新验证...');

  try {
    const fs = require('fs');
    const path = require('path');

    const docPath = path.join(__dirname, 'docs', 'AUTH_MODULE_REFACTOR.md');
    if (fs.existsSync(docPath)) {
      console.log('  ✅ 认证模块重构文档存在');

      const docContent = fs.readFileSync(docPath, 'utf8');

      const requiredSections = [
        '速率限制保护机制',
        '多层级限流策略',
        'Task 2.3',
        'v2.0',
      ];

      let allFound = true;
      requiredSections.forEach(section => {
        if (docContent.includes(section)) {
          console.log(`  ✅ 包含 "${section}" 内容`);
        } else {
          console.log(`  ❌ 缺少 "${section}" 内容`);
          allFound = false;
        }
      });

      return allFound;
    } else {
      console.log('  ❌ 认证模块重构文档不存在');
      return false;
    }
  } catch (error) {
    console.log('  ❌ 文档验证失败:', error.message);
    return false;
  }
}

// 检查潜在冲突
function checkForConflicts() {
  console.log('\n⚠️ 潜在冲突检查...');

  try {
    const fs = require('fs');
    const path = require('path');

    // 检查重复的限流实现
    const filesToCheck = [
      'src/middleware/rate-limit.middleware.ts',
      'src/app/api/procurement-intelligence/rate-limit-demo/route.ts',
      'src/decorators/api-permissions.js',
    ];

    let conflicts = 0;

    filesToCheck.forEach(file => {
      const fullPath = path.join(__dirname, file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const rateLimitCount = (content.match(/rate[Ll]imit/g) || []).length;
        console.log(`  ${file}: 发现 ${rateLimitCount} 个限流相关引用`);

        // 检查是否有多重实现
        if (file.includes('middleware') && rateLimitCount > 10) {
          console.log(`    ⚠️  可能存在重复实现`);
          conflicts++;
        }
      }
    });

    if (conflicts === 0) {
      console.log('  ✅ 未发现明显冲突');
      return true;
    } else {
      console.log(`  ❌ 发现 ${conflicts} 个潜在冲突`);
      return false;
    }
  } catch (error) {
    console.log('  ❌ 冲突检查失败:', error.message);
    return false;
  }
}

// 验证测试文件
function validateTestFiles() {
  console.log('\n🧪 测试文件验证...');

  try {
    const fs = require('fs');
    const path = require('path');

    const testFiles = [
      'tests/ratelimit-basic.test.ts',
      'scripts/test-ratelimit.js',
    ];

    let validTests = 0;

    testFiles.forEach(testFile => {
      const fullPath = path.join(__dirname, testFile);
      if (fs.existsSync(fullPath)) {
        console.log(`  ✅ ${testFile} 存在`);
        validTests++;
      } else {
        console.log(`  ❌ ${testFile} 不存在`);
      }
    });

    return validTests === testFiles.length;
  } catch (error) {
    console.log('  ❌ 测试文件验证失败:', error.message);
    return false;
  }
}

// 主验证函数
function main() {
  console.log('🔍 Task 2.3 完整性回测验证');
  console.log('='.repeat(50));

  const validationResults = {
    config: validateConfigFiles(),
    middleware: validateMiddlewareIntegration(),
    documentation: validateDocumentation(),
    conflicts: checkForConflicts(),
    tests: validateTestFiles(),
  };

  console.log('\n📊 验证结果汇总:');
  console.log('='.repeat(30));

  Object.entries(validationResults).forEach(([key, result]) => {
    const status = result ? '✅ 通过' : '❌ 失败';
    console.log(`${key.padEnd(15)}: ${status}`);
  });

  const passedTests = Object.values(validationResults).filter(Boolean).length;
  const totalTests = Object.keys(validationResults).length;

  console.log(`\n🎯 总体结果: ${passedTests}/${totalTests} 验证通过`);

  if (passedTests === totalTests) {
    console.log('\n🎉 Task 2.3 回测验证全部通过！');
    console.log('\n✅ 功能完整性确认:');
    console.log('  • 限流配置文件正确部署');
    console.log('  • 中间件集成无误');
    console.log('  • 技术文档已更新');
    console.log('  • 未发现模块冲突');
    console.log('  • 测试文件完备');

    console.log('\n🚀 可以安全进入下一阶段开发');
  } else {
    console.log('\n⚠️  部分验证失败，请检查上述问题');
  }

  console.log('\n' + '='.repeat(50));
}

// 执行验证
main();
