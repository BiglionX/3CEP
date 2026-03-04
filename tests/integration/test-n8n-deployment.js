/**
 * n8n部署验证脚本
 * 验证n8n服务是否正确部署并可访问
 */

const http = require('http');
const https = require('https');

// 配置参数
const CONFIG = {
  host: 'localhost',
  port: 5678,
  protocol: 'http',
  timeout: 10000,
  maxRetries: 10,
  retryDelay: 5000,
};

/**
 * 发送HTTP请求
 */
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const client = options.protocol === 'https:' ? https : http;

    const req = client.request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });

    req.setTimeout(CONFIG.timeout);
    req.end();
  });
}

/**
 * 检查n8n健康状态
 */
async function checkHealth() {
  console.log('🔍 检查n8n健康状态...');

  const options = {
    hostname: CONFIG.host,
    port: CONFIG.port,
    path: '/healthz',
    method: 'GET',
    protocol: `${CONFIG.protocol}:`,
  };

  try {
    const response = await makeRequest(options);
    if (response.statusCode === 200) {
      console.log('✅ n8n健康检查通过');
      return true;
    } else {
      console.log(`❌ 健康检查失败，状态码: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 健康检查失败: ${error.message}`);
    return false;
  }
}

/**
 * 检查n8n主页面
 */
async function checkMainPage() {
  console.log('🌐 检查n8n主页面访问...');

  const options = {
    hostname: CONFIG.host,
    port: CONFIG.port,
    path: '/',
    method: 'GET',
    protocol: `${CONFIG.protocol}:`,
  };

  try {
    const response = await makeRequest(options);
    if (response.statusCode === 200 && response.data.includes('n8n')) {
      console.log('✅ n8n主页面访问正常');
      return true;
    } else {
      console.log(`❌ 主页面访问异常，状态码: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 主页面访问失败: ${error.message}`);
    return false;
  }
}

/**
 * 检查API端点
 */
async function checkAPI() {
  console.log('🔌 检查n8n API端点...');

  const options = {
    hostname: CONFIG.host,
    port: CONFIG.port,
    path: '/api/v1/workflows',
    method: 'GET',
    protocol: `${CONFIG.protocol}:`,
  };

  try {
    const response = await makeRequest(options);
    // API可能返回401(需要认证)或200，只要能连接就算成功
    if (response.statusCode === 200 || response.statusCode === 401) {
      console.log('✅ n8n API端点可访问');
      return true;
    } else {
      console.log(`❌ API端点访问异常，状态码: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ API端点访问失败: ${error.message}`);
    return false;
  }
}

/**
 * 检查Docker容器状态
 */
function checkDockerContainers() {
  console.log('🐳 检查Docker容器状态...');

  const { spawn } = require('child_process');

  return new Promise(resolve => {
    const docker = spawn('docker-compose', [
      '-f',
      'docker-compose.n8n.yml',
      'ps',
    ]);

    let output = '';
    docker.stdout.on('data', data => {
      output += data.toString();
    });

    docker.on('close', code => {
      if (code === 0 && output.includes('n8n') && output.includes('Up')) {
        console.log('✅ Docker容器运行正常');
        console.log(output);
        resolve(true);
      } else {
        console.log('❌ Docker容器状态异常');
        console.log(output);
        resolve(false);
      }
    });

    docker.on('error', error => {
      console.log(`❌ Docker命令执行失败: ${error.message}`);
      resolve(false);
    });
  });
}

/**
 * 等待服务启动
 */
async function waitForService() {
  console.log('⏳ 等待n8n服务启动...');

  for (let i = 1; i <= CONFIG.maxRetries; i++) {
    console.log(`尝试连接 (${i}/${CONFIG.maxRetries})...`);

    if (await checkHealth()) {
      return true;
    }

    if (i < CONFIG.maxRetries) {
      console.log(`等待 ${CONFIG.retryDelay / 1000} 秒后重试...`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay));
    }
  }

  return false;
}

/**
 * 主验证函数
 */
async function main() {
  console.log('🧪 开始验证n8n部署...');
  console.log('================================');

  try {
    // 检查Docker容器
    const dockerOk = await checkDockerContainers();
    if (!dockerOk) {
      console.log('\n❌ Docker容器检查失败');
      process.exit(1);
    }

    // 等待服务启动
    const serviceReady = await waitForService();
    if (!serviceReady) {
      console.log('\n❌ n8n服务启动超时');
      process.exit(1);
    }

    // 执行各项检查
    const healthOk = await checkHealth();
    const pageOk = await checkMainPage();
    const apiOk = await checkAPI();

    console.log('\n📋 验证结果汇总:');
    console.log('================================');
    console.log(`健康检查: ${healthOk ? '✅ 通过' : '❌ 失败'}`);
    console.log(`页面访问: ${pageOk ? '✅ 通过' : '❌ 失败'}`);
    console.log(`API访问: ${apiOk ? '✅ 通过' : '❌ 失败'}`);

    const allPassed = healthOk && pageOk && apiOk;

    if (allPassed) {
      console.log('\n🎉 n8n部署验证成功！');
      console.log('================================');
      console.log(
        `访问地址: ${CONFIG.protocol}://${CONFIG.host}:${CONFIG.port}`
      );
      console.log('现在可以开始创建您的第一个工作流了！');
    } else {
      console.log('\n❌ n8n部署验证部分失败');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ 验证过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 执行验证
if (require.main === module) {
  main();
}

module.exports = {
  checkHealth,
  checkMainPage,
  checkAPI,
  waitForService,
};
