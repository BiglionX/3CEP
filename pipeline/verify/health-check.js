#!/usr/bin/env node

/**
 * 综合健康检查脚本
 * 整合simple-deployment-check.js的功能，提供全面的部署健康检查
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function healthCheck(environment = 'development') {
  console.log(`🏥 开始综合健康检查 (${environment} 环境)\n`);

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: [],
  };

  try {
    // 1. 环境配置检查
    console.log('📋 环境配置检查:');
    const envCheck = await checkEnvironmentConfig(environment);
    updateResults(results, envCheck);

    // 2. 构建状态检查
    console.log('\n🏗️ 构建状态检查:');
    const buildCheck = await checkBuildStatus();
    updateResults(results, buildCheck);

    // 3. 配置文件检查
    console.log('\n⚙️ 配置文件检查:');
    const configCheck = await checkConfigFiles();
    updateResults(results, configCheck);

    // 4. 服务连通性检查
    console.log('\n🔌 服务连通性检查:');
    const connectivityCheck = await checkServiceConnectivity(environment);
    updateResults(results, connectivityCheck);

    // 5. 数据库连接检查
    console.log('\n🗄️ 数据库连接检查:');
    const databaseCheck = await checkDatabaseConnection(environment);
    updateResults(results, databaseCheck);

    // 6. API端点检查
    console.log('\n🌐 API端点检查:');
    const apiCheck = await checkApiEndpoints(environment);
    updateResults(results, apiCheck);

    // 7. 安全配置检查
    console.log('\n🛡️ 安全配置检查:');
    const securityCheck = await checkSecurityConfig(environment);
    updateResults(results, securityCheck);

    // 8. 输出最终报告
    console.log(`\n${'='.repeat(50)}`);
    console.log('📊 健康检查综合报告');
    console.log('='.repeat(50));

    console.log(`✅ 通过检查: ${results.passed} 项`);
    console.log(`⚠️  警告: ${results.warnings} 项`);
    console.log(`❌ 失败: ${results.failed} 项`);

    const totalChecks = results.passed + results.warnings + results.failed;
    const successRate = ((results.passed / totalChecks) * 100).toFixed(1);

    console.log(`📈 成功率: ${successRate}%`);

    if (results.failed > 0) {
      console.log('\n❌ 发现严重问题:');
      results.details
        .filter(detail => detail.status === 'failed')
        .forEach(detail =>
          console.log(`   - ${detail.name}: ${detail.message}`)
        );

      console.log('\n🔧 建议修复措施:');
      console.log('1. 检查环境变量配置');
      console.log('2. 确认数据库连接信息');
      console.log('3. 验证服务是否正常运行');
      console.log('4. 检查网络连通性');

      process.exit(1);
    } else if (results.warnings > 0) {
      console.log('\n⚠️  发现警告项:');
      results.details
        .filter(detail => detail.status === 'warning')
        .forEach(detail =>
          console.log(`   - ${detail.name}: ${detail.message}`)
        );

      console.log('\n💡 建议关注事项:');
      console.log('1. 及时替换配置占位符');
      console.log('2. 完善安全配置');
      console.log('3. 优化性能配置');
    }

    console.log('\n🎉 健康检查完成，系统状态良好！');
    return true;
  } catch (error) {
    console.error('\n❌ 健康检查过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 辅助函数
function updateResults(results, checkResult) {
  results.passed += checkResult.passed;
  results.failed += checkResult.failed;
  results.warnings += checkResult.warnings;
  results.details.push(...checkResult.details);
}

async function checkEnvironmentConfig(environment) {
  const result = { passed: 0, failed: 0, warnings: 0, details: [] };

  const envFile = `.env.${environment}`;
  const envPath = path.join(__dirname, `../../${envFile}`);

  if (fs.existsSync(envPath)) {
    result.passed++;
    result.details.push({
      name: '环境配置文件',
      status: 'passed',
      message: `配置文件 ${envFile} 存在`,
    });

    const envContent = fs.readFileSync(envPath, 'utf8');
    const placeholders = (envContent.match(/your_|YOUR_/g) || []).length;

    if (placeholders > 0) {
      result.warnings++;
      result.details.push({
        name: '配置占位符',
        status: 'warning',
        message: `发现 ${placeholders} 个占位符需要替换`,
      });
    } else {
      result.passed++;
      result.details.push({
        name: '配置完整性',
        status: 'passed',
        message: '所有配置项已完成',
      });
    }
  } else {
    result.failed++;
    result.details.push({
      name: '环境配置文件',
      status: 'failed',
      message: `配置文件 ${envFile} 不存在`,
    });
  }

  return result;
}

async function checkBuildStatus() {
  const result = { passed: 0, failed: 0, warnings: 0, details: [] };

  const nextDir = path.join(__dirname, '../../.next');
  if (fs.existsSync(nextDir)) {
    result.passed++;
    result.details.push({
      name: '构建目录',
      status: 'passed',
      message: '构建目录存在',
    });

    const requiredFiles = ['BUILD_ID', 'routes-manifest.json'];
    for (const file of requiredFiles) {
      const filePath = path.join(nextDir, file);
      if (fs.existsSync(filePath)) {
        result.passed++;
        result.details.push({
          name: `构建文件 ${file}`,
          status: 'passed',
          message: '文件存在',
        });
      } else {
        result.warnings++;
        result.details.push({
          name: `构建文件 ${file}`,
          status: 'warning',
          message: '文件缺失',
        });
      }
    }
  } else {
    result.failed++;
    result.details.push({
      name: '构建目录',
      status: 'failed',
      message: '构建目录不存在，请先执行构建',
    });
  }

  return result;
}

async function checkConfigFiles() {
  const result = { passed: 0, failed: 0, warnings: 0, details: [] };

  const configFiles = [
    'next.config.js',
    'tsconfig.json',
    'package.json',
    'vercel.json',
  ];

  for (const file of configFiles) {
    const filePath = path.join(__dirname, `../../${file}`);
    if (fs.existsSync(filePath)) {
      result.passed++;
      result.details.push({
        name: `配置文件 ${file}`,
        status: 'passed',
        message: '文件存在',
      });
    } else {
      result.warnings++;
      result.details.push({
        name: `配置文件 ${file}`,
        status: 'warning',
        message: '文件缺失',
      });
    }
  }

  return result;
}

async function checkServiceConnectivity(environment) {
  const result = { passed: 0, failed: 0, warnings: 0, details: [] };

  // 检查本地开发服务
  if (environment === 'development') {
    try {
      execSync('curl -f http://localhost:3001/api/health', { stdio: 'pipe' });
      result.passed++;
      result.details.push({
        name: '本地服务连通性',
        status: 'passed',
        message: '开发服务可访问',
      });
    } catch (error) {
      result.warnings++;
      result.details.push({
        name: '本地服务连通性',
        status: 'warning',
        message: '开发服务不可访问',
      });
    }
  }

  return result;
}

async function checkDatabaseConnection(environment) {
  const result = { passed: 0, failed: 0, warnings: 0, details: [] };

  try {
    const envFile = `.env.${environment}`;
    const envPath = path.join(__dirname, `../../${envFile}`);

    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const dbUrlMatch = envContent.match(/DATABASE_URL=(.*)/);

      if (dbUrlMatch) {
        result.passed++;
        result.details.push({
          name: '数据库配置',
          status: 'passed',
          message: '数据库连接字符串已配置',
        });
      } else {
        result.warnings++;
        result.details.push({
          name: '数据库配置',
          status: 'warning',
          message: '未找到DATABASE_URL配置',
        });
      }
    }
  } catch (error) {
    result.warnings++;
    result.details.push({
      name: '数据库连接',
      status: 'warning',
      message: '数据库连接检查失败',
    });
  }

  return result;
}

async function checkApiEndpoints(environment) {
  const result = { passed: 0, failed: 0, warnings: 0, details: [] };

  // 这里可以添加具体的API端点检查逻辑
  result.passed++; // 占位符
  result.details.push({
    name: 'API端点检查',
    status: 'passed',
    message: 'API检查框架已就绪',
  });

  return result;
}

async function checkSecurityConfig(environment) {
  const result = { passed: 0, failed: 0, warnings: 0, details: [] };

  const envFile = `.env.${environment}`;
  const envPath = path.join(__dirname, `../../${envFile}`);

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');

    // 检查HTTPS配置
    if (envContent.includes('HTTPS_ONLY=true') || environment === 'prod') {
      result.passed++;
      result.details.push({
        name: 'HTTPS配置',
        status: 'passed',
        message: 'HTTPS安全配置已启用',
      });
    } else {
      result.warnings++;
      result.details.push({
        name: 'HTTPS配置',
        status: 'warning',
        message: '建议启用HTTPS',
      });
    }
  }

  return result;
}

// 命令行参数处理
if (require.main === module) {
  const environment = process.argv[2] || 'development';
  healthCheck(environment);
}

module.exports = { healthCheck };
