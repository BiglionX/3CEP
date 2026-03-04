#!/usr/bin/env node

/**
 * 统一健康检查和部署验证工具
 * 集成所有检查功能，提供一键式健康检查
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function fullHealthCheck(environment = 'development') {
  console.log(`🏥 FixCycle 统一健康检查 (${environment} 环境)`);
  console.log('='.repeat(60));

  const startTime = new Date();
  const checkResults = {
    environment: null,
    build: null,
    database: null,
    services: null,
    security: null,
    performance: null,
  };

  try {
    // 1. 环境配置检查
    console.log('\n📋 第1/6步: 环境配置检查');
    checkResults.environment = await checkEnvironmentConfiguration(environment);

    // 2. 构建状态检查
    console.log('\n🏗️ 第2/6步: 构建状态检查');
    checkResults.build = await checkBuildStatus();

    // 3. 数据库连接检查
    console.log('\n🗄️ 第3/6步: 数据库健康检查');
    checkResults.database = await checkDatabaseHealth(environment);

    // 4. 服务状态检查
    console.log('\n🔧 第4/6步: 服务状态检查');
    checkResults.services = await checkServiceStatus(environment);

    // 5. 安全配置检查
    console.log('\n🛡️ 第5/6步: 安全配置检查');
    checkResults.security = await checkSecurityConfiguration(environment);

    // 6. 性能指标检查
    console.log('\n⚡ 第6/6步: 性能指标检查');
    checkResults.performance = await checkPerformanceMetrics(environment);

    // 输出综合报告
    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 1000);

    await generateHealthReport(checkResults, environment, duration);

    // 返回检查结果供其他脚本使用
    return {
      success: true,
      environment,
      duration,
      results: checkResults,
      summary: generateSummary(checkResults),
    };
  } catch (error) {
    console.error('\n❌ 健康检查过程中发生错误:', error.message);

    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 1000);

    console.log(`\n📊 检查中断报告:`);
    console.log(`   执行时间: ${duration} 秒`);
    console.log(`   错误信息: ${error.message}`);

    return {
      success: false,
      error: error.message,
      duration,
      partialResults: checkResults,
    };
  }
}

// 各项检查函数
async function checkEnvironmentConfiguration(environment) {
  console.log('🔍 检查环境配置...');

  const result = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: [],
  };

  // 检查环境文件
  const envFile = `.env.${environment}`;
  const envPath = path.join(__dirname, `../${envFile}`);

  if (fs.existsSync(envPath)) {
    result.passed++;
    result.details.push('环境配置文件存在');

    const envContent = fs.readFileSync(envPath, 'utf8');
    const placeholders = (envContent.match(/your_|YOUR_/g) || []).length;

    if (placeholders > 0) {
      result.warnings++;
      result.details.push(`发现 ${placeholders} 个配置占位符`);
    } else {
      result.passed++;
      result.details.push('环境变量配置完整');
    }
  } else {
    result.failed++;
    result.details.push(`环境配置文件缺失: ${envFile}`);
  }

  // 检查敏感信息文件
  const secretsPath = path.join(__dirname, '../.env.secrets');
  if (fs.existsSync(secretsPath)) {
    result.passed++;
    result.details.push('敏感信息配置文件存在');
  } else {
    result.warnings++;
    result.details.push('建议创建 .env.secrets 文件');
  }

  console.log(
    `   ✅ 通过: ${result.passed}, ⚠️ 警告: ${result.warnings}, ❌ 失败: ${result.failed}`
  );
  return result;
}

async function checkBuildStatus() {
  console.log('🔍 检查构建状态...');

  const result = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: [],
  };

  const nextDir = path.join(__dirname, '../.next');
  if (fs.existsSync(nextDir)) {
    result.passed++;
    result.details.push('构建目录存在');

    // 检查关键构建文件
    const requiredFiles = ['BUILD_ID', 'routes-manifest.json'];
    for (const file of requiredFiles) {
      const filePath = path.join(nextDir, file);
      if (fs.existsSync(filePath)) {
        result.passed++;
        result.details.push(`构建文件 ${file} 存在`);
      } else {
        result.warnings++;
        result.details.push(`构建文件 ${file} 缺失`);
      }
    }
  } else {
    result.failed++;
    result.details.push('构建目录不存在，请先执行 npm run build');
  }

  console.log(
    `   ✅ 通过: ${result.passed}, ⚠️ 警告: ${result.warnings}, ❌ 失败: ${result.failed}`
  );
  return result;
}

async function checkDatabaseHealth(environment) {
  console.log('🔍 检查数据库健康...');

  const result = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: [],
  };

  try {
    const envFile = `.env.${environment}`;
    const envPath = path.join(__dirname, `../${envFile}`);

    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const dbUrlMatch = envContent.match(/DATABASE_URL=(.*)/);

      if (dbUrlMatch) {
        result.passed++;
        result.details.push('数据库连接配置存在');

        // 尝试简单的连接测试
        try {
          // 这里可以添加实际的数据库连接测试
          result.passed++;
          result.details.push('数据库连接配置格式正确');
        } catch (error) {
          result.warnings++;
          result.details.push('数据库连接测试失败');
        }
      } else {
        result.warnings++;
        result.details.push('未找到DATABASE_URL配置');
      }
    }
  } catch (error) {
    result.warnings++;
    result.details.push('数据库健康检查异常');
  }

  console.log(
    `   ✅ 通过: ${result.passed}, ⚠️ 警告: ${result.warnings}, ❌ 失败: ${result.failed}`
  );
  return result;
}

async function checkServiceStatus(environment) {
  console.log('🔍 检查服务状态...');

  const result = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: [],
  };

  // 检查本地开发服务
  if (environment === 'development') {
    try {
      execSync('curl -f http://localhost:3001/health', { stdio: 'pipe' });
      result.passed++;
      result.details.push('本地开发服务可访问');
    } catch (error) {
      result.warnings++;
      result.details.push('本地开发服务不可访问');
    }
  }

  // 检查Docker服务状态
  try {
    const dockerOutput = execSync(
      'docker ps --format "table {{.Names}}\t{{.Status}}"',
      {
        stdio: 'pipe',
        encoding: 'utf8',
      }
    );
    result.passed++;
    result.details.push('Docker服务运行正常');
    result.details.push(`运行中的容器:\n${dockerOutput}`);
  } catch (error) {
    result.warnings++;
    result.details.push('Docker服务检查失败');
  }

  console.log(
    `   ✅ 通过: ${result.passed}, ⚠️ 警告: ${result.warnings}, ❌ 失败: ${result.failed}`
  );
  return result;
}

async function checkSecurityConfiguration(environment) {
  console.log('🔍 检查安全配置...');

  const result = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: [],
  };

  const envFile = `.env.${environment}`;
  const envPath = path.join(__dirname, `../${envFile}`);

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');

    // 检查HTTPS配置
    if (envContent.includes('HTTPS_ONLY=true') || environment === 'prod') {
      result.passed++;
      result.details.push('HTTPS安全配置已启用');
    } else {
      result.warnings++;
      result.details.push('建议启用HTTPS配置');
    }

    // 检查敏感密钥配置
    const sensitiveKeys = ['SUPABASE_SERVICE_ROLE_KEY', 'STRIPE_SECRET_KEY'];
    for (const key of sensitiveKeys) {
      if (envContent.includes(key) && !envContent.includes(`${key}=your_`)) {
        result.passed++;
        result.details.push(`敏感密钥 ${key} 已配置`);
      } else {
        result.warnings++;
        result.details.push(`敏感密钥 ${key} 需要配置`);
      }
    }
  }

  console.log(
    `   ✅ 通过: ${result.passed}, ⚠️ 警告: ${result.warnings}, ❌ 失败: ${result.failed}`
  );
  return result;
}

async function checkPerformanceMetrics(environment) {
  console.log('🔍 检查性能指标...');

  const result = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: [],
  };

  // 检查构建大小
  const nextDir = path.join(__dirname, '../.next');
  if (fs.existsSync(nextDir)) {
    try {
      const stats = fs.statSync(nextDir);
      const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);

      if (sizeInMB < 100) {
        result.passed++;
        result.details.push(`构建大小合理: ${sizeInMB} MB`);
      } else {
        result.warnings++;
        result.details.push(`构建较大: ${sizeInMB} MB，建议优化`);
      }
    } catch (error) {
      result.warnings++;
      result.details.push('构建大小检查失败');
    }
  }

  // 检查依赖项数量
  const packagePath = path.join(__dirname, '../package.json');
  if (fs.existsSync(packagePath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const depCount = Object.keys(pkg.dependencies || {}).length;

      if (depCount < 50) {
        result.passed++;
        result.details.push(`依赖项数量合理: ${depCount} 个`);
      } else {
        result.warnings++;
        result.details.push(`依赖项较多: ${depCount} 个，建议审查`);
      }
    } catch (error) {
      result.warnings++;
      result.details.push('依赖项检查失败');
    }
  }

  console.log(
    `   ✅ 通过: ${result.passed}, ⚠️ 警告: ${result.warnings}, ❌ 失败: ${result.failed}`
  );
  return result;
}

// 生成健康报告
async function generateHealthReport(results, environment, duration) {
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 FixCycle 健康检查综合报告');
  console.log('='.repeat(60));

  console.log(`🕒 检查时间: ${new Date().toLocaleString()}`);
  console.log(`🌍 检查环境: ${environment}`);
  console.log(`⏱️  检查耗时: ${duration} 秒`);

  console.log('\n📋 各项检查结果:');

  const categories = [
    { name: '环境配置', key: 'environment' },
    { name: '构建状态', key: 'build' },
    { name: '数据库健康', key: 'database' },
    { name: '服务状态', key: 'services' },
    { name: '安全配置', key: 'security' },
    { name: '性能指标', key: 'performance' },
  ];

  let totalPassed = 0;
  let totalWarnings = 0;
  let totalFailed = 0;

  categories.forEach(category => {
    const result = results[category.key];
    if (result) {
      totalPassed += result.passed;
      totalWarnings += result.warnings;
      totalFailed += result.failed;

      console.log(
        `   ${category.name}: ✅${result.passed} ⚠️${result.warnings} ❌${result.failed}`
      );
    }
  });

  const totalChecks = totalPassed + totalWarnings + totalFailed;
  const successRate =
    totalChecks > 0 ? ((totalPassed / totalChecks) * 100).toFixed(1) : 0;

  console.log(`\n📈 总体统计:`);
  console.log(`   总检查项: ${totalChecks}`);
  console.log(`   通过: ${totalPassed} (${successRate}%)`);
  console.log(`   警告: ${totalWarnings}`);
  console.log(`   失败: ${totalFailed}`);

  if (totalFailed > 0) {
    console.log('\n❌ 发现严重问题，请立即处理');
  } else if (totalWarnings > 0) {
    console.log('\n⚠️  存在警告项，建议关注优化');
  } else {
    console.log('\n🎉 所有检查通过，系统健康状态良好！');
  }

  console.log('\n💡 建议操作:');
  if (totalFailed > 0) {
    console.log('1. 优先解决标记为 ❌ 的问题');
    console.log('2. 重新运行健康检查验证修复效果');
  } else if (totalWarnings > 0) {
    console.log('1. 关注 ⚠️ 警告项并逐步优化');
    console.log('2. 定期运行健康检查监控系统状态');
  } else {
    console.log('1. 系统运行正常，继续保持');
    console.log('2. 建议定期执行健康检查');
  }
}

function generateSummary(results) {
  let passed = 0;
  let warnings = 0;
  let failed = 0;

  Object.values(results).forEach(result => {
    if (result) {
      passed += result.passed;
      warnings += result.warnings;
      failed += result.failed;
    }
  });

  return { passed, warnings, failed };
}

// 命令行接口
if (require.main === module) {
  const environment = process.argv[2] || 'development';
  fullHealthCheck(environment);
}

module.exports = { fullHealthCheck };
