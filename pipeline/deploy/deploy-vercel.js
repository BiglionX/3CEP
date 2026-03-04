#!/usr/bin/env node

/**
 * Vercel前端部署脚本
 * 负责将Next.js应用部署到Vercel
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function deployVercel(environment = 'development') {
  console.log(`🌐 开始Vercel前端部署 (${environment} 环境)\n`);

  try {
    // 1. 验证Vercel CLI安装
    console.log('🔍 验证Vercel CLI...');
    try {
      execSync('vercel --version', { stdio: 'pipe' });
      console.log('✅ Vercel CLI已安装');
    } catch (error) {
      console.log('⚠️  Vercel CLI未安装，正在安装...');
      execSync('npm install -g vercel', { stdio: 'inherit' });
      console.log('✅ Vercel CLI安装完成');
    }

    // 2. 验证构建产物
    console.log('\n🔍 验证构建产物...');
    const nextDir = path.join(__dirname, '../../.next');
    if (!fs.existsSync(nextDir)) {
      throw new Error('未找到构建产物，请先执行构建步骤');
    }

    const buildIdPath = path.join(nextDir, 'BUILD_ID');
    if (!fs.existsSync(buildIdPath)) {
      throw new Error('BUILD_ID文件不存在');
    }

    const buildId = fs.readFileSync(buildIdPath, 'utf8').trim();
    console.log(`✅ 构建ID: ${buildId}`);
    console.log('✅ 构建产物验证通过');

    // 3. 配置环境变量
    console.log('\n⚙️ 配置环境变量...');
    const envFile = `.env.${environment}`;
    const envPath = path.join(__dirname, `../../${envFile}`);

    if (!fs.existsSync(envPath)) {
      throw new Error(`环境配置文件不存在: ${envFile}`);
    }

    // 读取环境变量
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};

    envContent.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          envVars[key.trim()] = value.trim();
        }
      }
    });

    console.log(`✅ 加载了 ${Object.keys(envVars).length} 个环境变量`);

    // 4. 确定部署目标
    console.log('\n🎯 确定部署目标...');
    let deployTarget = '';
    let projectName = '';

    switch (environment) {
      case 'development':
        deployTarget = '--dev';
        projectName = 'fixcycle-dev';
        break;
      case 'stage':
        deployTarget = '--prod'; // Vercel的预发布通常也是prod，通过项目区分
        projectName = 'fixcycle-stage';
        break;
      case 'prod':
        deployTarget = '--prod';
        projectName = 'fixcycle';
        break;
      default:
        throw new Error(`不支持的环境: ${environment}`);
    }

    console.log(`✅ 部署目标: ${projectName} (${environment})`);

    // 5. 执行部署前检查
    console.log('\n✅ 执行部署前检查...');

    // 检查是否有敏感信息占位符
    const placeholders = envContent.match(/your_[a-zA-Z0-9_-]+|[A-Z_]+_HERE/gi);
    if (placeholders && placeholders.length > 0) {
      console.warn(
        `⚠️  发现 ${placeholders.length} 个配置占位符，请确认已正确配置`
      );
    }

    // 6. 执行部署
    console.log('\n🚀 执行Vercel部署...');

    // 设置项目名称（如果需要）
    if (projectName) {
      try {
        execSync(`vercel link --project ${projectName}`, {
          stdio: 'inherit',
          cwd: path.join(__dirname, '../..'),
        });
      } catch (error) {
        console.log('💡 项目链接可能已存在或需要手动配置');
      }
    }

    // 执行部署命令
    const deployCommand = `vercel ${deployTarget} --confirm`;
    console.log(`执行命令: ${deployCommand}`);

    const deployOutput = execSync(deployCommand, {
      stdio: 'pipe',
      cwd: path.join(__dirname, '../..'),
      encoding: 'utf8',
    });

    console.log('✅ 部署命令执行完成');

    // 7. 提取部署URL
    console.log('\n🔗 提取部署信息...');
    const urlMatch = deployOutput.match(/https?:\/\/[^\s]+/);
    let deployedUrl = '';

    if (urlMatch) {
      deployedUrl = urlMatch[0];
      console.log(`✅ 部署URL: ${deployedUrl}`);
    } else {
      console.log('⚠️  无法提取部署URL，请检查部署输出');
    }

    // 8. 配置环境变量（生产环境）
    if (environment === 'prod' || environment === 'stage') {
      console.log('\n🔐 配置远程环境变量...');

      // 这里可以批量设置环境变量
      // 注意：实际使用时需要更安全的方式处理敏感信息
      console.log('💡 环境变量配置需要在Vercel控制台手动完成或使用API');
    }

    // 9. 输出部署报告
    console.log(`\n📊 Vercel部署报告:`);
    console.log(`   部署时间: ${new Date().toLocaleString()}`);
    console.log(`   环境: ${environment}`);
    console.log(`   项目名称: ${projectName}`);
    console.log(`   构建ID: ${buildId}`);
    console.log(`   部署URL: ${deployedUrl || '请查看上方输出'}`);

    console.log('\n🎉 Vercel前端部署成功完成！');
    return { url: deployedUrl, buildId };
  } catch (error) {
    console.error('\n❌ Vercel部署失败:', error.message);
    process.exit(1);
  }
}

// 命令行参数处理
if (require.main === module) {
  const environment = process.argv[2] || 'development';
  deployVercel(environment);
}

module.exports = { deployVercel };
