#!/usr/bin/env node

/**
 * 本地开发环境部署脚本
 * 支持 datacenter 和 n8n-minimal 两种部署模式
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 FixCycle 本地开发环境部署\n');
console.log('=====================================\n');

// 检查 Docker 是否可用
function checkDocker() {
  try {
    const result = spawnSync('docker', ['--version'], {
      stdio: 'pipe',
    });
    return result.status === 0;
  } catch (error) {
    return false;
  }
}

// 检查 Docker Compose 是否可用
function checkDockerCompose() {
  try {
    const result = spawnSync('docker-compose', ['--version'], {
      stdio: 'pipe',
    });
    return result.status === 0;
  } catch (error) {
    return false;
  }
}

// 解析命令行参数
const args = process.argv.slice(2);
const deployMode = args.includes('--datacenter')
  ? 'datacenter'
  : args.includes('--n8n')
    ? 'n8n'
    : 'auto';

console.log('🔧 部署环境检查:\n');

// 检查 Docker 环境
const hasDocker = checkDocker();
const hasDockerCompose = checkDockerCompose();

console.log(`  Docker: ${hasDocker ? '✅ 可用' : '❌ 未安装或不可用'}`);
console.log(
  `  Docker Compose: ${hasDockerCompose ? '✅ 可用' : '❌ 未安装或不可用'}`
);

if (!hasDocker || !hasDockerCompose) {
  console.log('\n❌ 错误: Docker 环境不完整');
  console.log('💡 请先安装 Docker 和 Docker Compose');
  console.log('🔗 下载地址: https://www.docker.com/products/docker-desktop');
  process.exit(1);
}

// 检查配置文件
console.log('\n📄 配置文件检查:');
const configFiles = {
  'docker-compose.datacenter.yml': './docker-compose.datacenter.yml',
  'docker-compose.n8n-minimal.yml': './docker-compose.n8n-minimal.yml',
  '.env': './.env',
};

Object.entries(configFiles).forEach(([fileName, filePath]) => {
  const fullPath = path.join(__dirname, '..', filePath);
  const exists = fs.existsSync(fullPath);
  console.log(`  ${exists ? '✅' : '❌'} ${fileName}`);
});

// 确定部署模式
let selectedMode = deployMode;
if (selectedMode === 'auto') {
  // 自动选择模式：优先选择 datacenter（如果配置存在）
  const datacenterConfig = path.join(
    __dirname,
    '..',
    'docker-compose.datacenter.yml'
  );
  const n8nConfig = path.join(
    __dirname,
    '..',
    'docker-compose.n8n-minimal.yml'
  );

  if (fs.existsSync(datacenterConfig)) {
    selectedMode = 'datacenter';
    console.log('\n🎯 自动选择部署模式: DataCenter (完整版)');
  } else if (fs.existsSync(n8nConfig)) {
    selectedMode = 'n8n';
    console.log('\n🎯 自动选择部署模式: n8n Minimal (轻量版)');
  } else {
    console.log('\n❌ 错误: 未找到有效的部署配置文件');
    process.exit(1);
  }
} else {
  console.log(
    `\n🎯 选定部署模式: ${selectedMode === 'datacenter' ? 'DataCenter' : 'n8n Minimal'}`
  );
}

// 执行部署
console.log('\n🏗️ 开始部署...\n');

let deploySuccess = false;
let deployedServices = [];

try {
  if (selectedMode === 'datacenter') {
    console.log('🐳 部署 DataCenter 环境...');
    const result = spawnSync(
      'docker-compose',
      ['-f', 'docker-compose.datacenter.yml', 'up', '-d'],
      {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit',
      }
    );

    if (result.status === 0) {
      deploySuccess = true;
      deployedServices = [
        'trino-coordinator',
        'trino-worker-1',
        'redis-cache',
        'data-center-ui',
      ];
      console.log('✅ DataCenter 部署成功');
    } else {
      console.log('❌ DataCenter 部署失败');
    }
  } else {
    console.log('🐳 部署 n8n Minimal 环境...');
    const result = spawnSync(
      'docker-compose',
      ['-f', 'docker-compose.n8n-minimal.yml', 'up', '-d'],
      {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit',
      }
    );

    if (result.status === 0) {
      deploySuccess = true;
      deployedServices = ['n8n-postgres', 'n8n'];
      console.log('✅ n8n Minimal 部署成功');
    } else {
      console.log('❌ n8n Minimal 部署失败');
    }
  }
} catch (error) {
  console.log(`❌ 部署过程中发生错误: ${error.message}`);
}

// 显示部署结果
console.log('\n=====================================');
console.log('🏆 部署结果报告\n');

if (deploySuccess) {
  console.log('🎉 部署成功完成！');
  console.log('\nサービース状态:');
  deployedServices.forEach(service => {
    console.log(`  ✅ ${service}`);
  });

  console.log('\n🔗 访问地址:');
  if (selectedMode === 'datacenter') {
    console.log('  DataCenter UI: http://localhost:3002');
    console.log('  Trino 查询引擎: http://localhost:8080');
    console.log('  Redis: localhost:6379');
  } else {
    console.log('  n8n 界面: http://localhost:5678');
    console.log('  PostgreSQL: localhost:5432');
  }

  console.log('\n📝 后续操作建议:');
  console.log('1. 运行 npm run check:health 验证服务状态');
  console.log('2. 运行 npm run seed 初始化数据');
  console.log('3. 启动开发服务器: npm run dev');
  console.log(
    '4. 查看日志: npm run data-center:logs (DataCenter) 或 docker-compose logs n8n (n8n)'
  );

  console.log('\n🛑 停止服务:');
  if (selectedMode === 'datacenter') {
    console.log('  npm run data-center:stop');
  } else {
    console.log('  docker-compose -f docker-compose.n8n-minimal.yml down');
  }
} else {
  console.log('❌ 部署失败');
  console.log('\n🔧 排障建议:');
  console.log('1. 检查 Docker 资源分配是否充足');
  console.log('2. 查看 Docker 日志获取详细错误信息');
  console.log('3. 确保端口未被占用 (8080, 5678, 6379, 3002)');
  console.log('4. 尝试清理并重新部署:');
  console.log('   docker system prune -f');
  console.log('   然后重新运行此脚本');
}

console.log('\n✨ 部署脚本执行完成！');
