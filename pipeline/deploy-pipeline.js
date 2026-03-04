#!/usr/bin/env node

/**
 * 主部署流水线脚本
 * 实现完整的构建→迁移→部署→验证流程
 */

const path = require('path');

// 导入各阶段模块
const { buildApp } = require('./build/build-app.js');
const { buildDockerImages } = require('./build/build-docker-images.js');
const { runMigrations } = require('./migrate/run-migrations.js');
const { seedData } = require('./migrate/seed-data.js');
const { deployVercel } = require('./deploy/deploy-vercel.js');
const { healthCheck } = require('./verify/health-check.js');

async function deployPipeline(environment = 'development', options = {}) {
  console.log(`🚀 启动部署流水线 (${environment} 环境)`);
  console.log('='.repeat(60));

  const startTime = new Date();
  const results = {
    build: null,
    migrate: null,
    deploy: null,
    verify: null,
  };

  try {
    // 阶段1: 构建阶段
    if (!options.skipBuild) {
      console.log('\n	stage 1/4: 构建阶段');
      console.log('-'.repeat(40));

      try {
        await buildApp(environment);
        if (options.buildDocker) {
          await buildDockerImages(environment);
        }
        results.build = 'success';
        console.log('✅ 构建阶段完成\n');
      } catch (error) {
        results.build = 'failed';
        console.error('❌ 构建阶段失败:', error.message);
        if (!options.continueOnError) {
          throw error;
        }
      }
    }

    // 阶段2: 迁移阶段
    if (!options.skipMigrate) {
      console.log('\n	stage 2/4: 数据库迁移阶段');
      console.log('-'.repeat(40));

      try {
        await runMigrations(environment);
        await seedData(environment);
        results.migrate = 'success';
        console.log('✅ 迁移阶段完成\n');
      } catch (error) {
        results.migrate = 'failed';
        console.error('❌ 迁移阶段失败:', error.message);
        if (!options.continueOnError) {
          throw error;
        }
      }
    }

    // 阶段3: 部署阶段
    if (!options.skipDeploy) {
      console.log('\n	stage 3/4: 部署阶段');
      console.log('-'.repeat(40));

      try {
        await deployVercel(environment);
        results.deploy = 'success';
        console.log('✅ 部署阶段完成\n');
      } catch (error) {
        results.deploy = 'failed';
        console.error('❌ 部署阶段失败:', error.message);
        if (!options.continueOnError) {
          throw error;
        }
      }
    }

    // 阶段4: 验证阶段
    if (!options.skipVerify) {
      console.log('\n	stage 4/4: 验证阶段');
      console.log('-'.repeat(40));

      try {
        await healthCheck(environment);
        results.verify = 'success';
        console.log('✅ 验证阶段完成\n');
      } catch (error) {
        results.verify = 'failed';
        console.error('❌ 验证阶段失败:', error.message);
        if (!options.continueOnError) {
          throw error;
        }
      }
    }

    // 输出部署总结
    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 1000);

    console.log('='.repeat(60));
    console.log('📊 部署流水线执行报告');
    console.log('='.repeat(60));

    console.log(`🕒 开始时间: ${startTime.toLocaleString()}`);
    console.log(`🕒 结束时间: ${endTime.toLocaleString()}`);
    console.log(`⏱️  总耗时: ${duration} 秒`);
    console.log(`🌍 部署环境: ${environment}`);

    console.log('\n📋 阶段执行状态:');
    console.log(`   构建阶段: ${getStatusEmoji(results.build)}`);
    console.log(`   迁移阶段: ${getStatusEmoji(results.migrate)}`);
    console.log(`   部署阶段: ${getStatusEmoji(results.deploy)}`);
    console.log(`   验证阶段: ${getStatusEmoji(results.verify)}`);

    const successfulStages = Object.values(results).filter(
      r => r === 'success'
    ).length;
    const totalStages = Object.values(results).filter(r => r !== null).length;

    console.log(
      `\n📈 成功率: ${successfulStages}/${totalStages} (${Math.round((successfulStages / totalStages) * 100)}%)`
    );

    if (successfulStages === totalStages) {
      console.log('\n🎉 部署流水线执行成功！');

      // 输出部署后的建议操作
      console.log('\n💡 后续建议:');
      console.log('1. 在浏览器中访问部署的应用');
      console.log('2. 执行端到端测试验证功能');
      console.log('3. 监控应用性能和错误日志');
      console.log('4. 配置监控告警（如需要）');

      return { success: true, results, duration };
    } else {
      console.log('\n⚠️  部署流水线部分成功');
      console.log('请检查失败阶段的日志并手动处理');

      if (options.continueOnError) {
        return { success: false, partial: true, results, duration };
      } else {
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('\n💥 部署流水线执行异常:', error.message);

    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 1000);

    console.log(`\n📊 异常终止报告:`);
    console.log(`   执行时间: ${duration} 秒`);
    console.log(`   错误信息: ${error.message}`);

    if (options.continueOnError) {
      return { success: false, error: error.message, duration };
    } else {
      process.exit(1);
    }
  }
}

function getStatusEmoji(status) {
  switch (status) {
    case 'success':
      return '✅ 成功';
    case 'failed':
      return '❌ 失败';
    case null:
      return '⏭️  跳过';
    default:
      return '❓ 未知';
  }
}

// 命令行接口
if (require.main === module) {
  const args = process.argv.slice(2);
  const environment = args[0] || 'development';

  // 解析选项参数
  const options = {
    skipBuild: args.includes('--skip-build'),
    skipMigrate: args.includes('--skip-migrate'),
    skipDeploy: args.includes('--skip-deploy'),
    skipVerify: args.includes('--skip-verify'),
    buildDocker: args.includes('--build-docker'),
    continueOnError: args.includes('--continue-on-error'),
  };

  console.log('🔧 部署选项:');
  console.log(`   环境: ${environment}`);
  console.log(`   跳过构建: ${options.skipBuild}`);
  console.log(`   跳过迁移: ${options.skipMigrate}`);
  console.log(`   跳过部署: ${options.skipDeploy}`);
  console.log(`   跳过验证: ${options.skipVerify}`);
  console.log(`   构建Docker: ${options.buildDocker}`);
  console.log(`   继续执行: ${options.continueOnError}\n`);

  deployPipeline(environment, options);
}

module.exports = { deployPipeline };
