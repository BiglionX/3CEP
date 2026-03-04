#!/usr/bin/env node

/**
 * 测试环境修复脚本
 * 解决测试运行时的常见问题
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 正在修复测试环境配置...');

// 1. 检查并创建.env.test文件
const envTestPath = path.join(__dirname, '../.env.test');
const envExamplePath = path.join(__dirname, '../.env.example');

if (!fs.existsSync(envTestPath)) {
  console.log('📝 创建测试环境配置文件...');

  // 从示例文件复制并修改
  let envContent = fs.readFileSync(envExamplePath, 'utf8');

  // 替换占位符值为测试友好的值
  envContent = envContent
    .replace(/your_service_role_key_here/g, 'test-service-role-key')
    .replace(/\[YOUR-PASSWORD\]/g, 'test-password')
    .replace(/sk-your-api-key-here/g, 'test-deepseek-key')
    .replace(/sk-your-qwen-api-key-here/g, 'test-qwen-key')
    .replace(/your_pinecone_api_key_here/g, 'test-pinecone-key')
    .replace(/your_pinecone_environment_here/g, 'test-environment')
    .replace(/your_weaviate_host_here/g, 'http://localhost:8080')
    .replace(/your_weaviate_api_key_here/g, 'test-weaviate-key')
    .replace(/your_n8n_api_token_here/g, 'test-n8n-token')
    .replace(/your_webhook_secret_key_here/g, 'test-webhook-secret')
    .replace(/test-agents-api-key/g, 'test-agents-key')
    .replace(
      /your-super-secret-jwt-key-here-change-in-production/g,
      'test-jwt-secret'
    )
    .replace(/\.\/config\/rbac\.json/g, './tests/mock/rbac.json')
    .replace(/\.\/logs/g, './tests/logs');

  fs.writeFileSync(envTestPath, envContent);
  console.log('✅ 测试环境配置文件创建完成');
}

// 2. 创建测试所需的目录
const requiredDirs = ['tests/logs', 'tests/mock', 'tests/temp'];

requiredDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '../', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`📁 创建目录: ${dir}`);
  }
});

// 3. 创建模拟的RBAC配置文件
const mockRbacPath = path.join(__dirname, '../tests/mock/rbac.json');
if (!fs.existsSync(mockRbacPath)) {
  const mockRbac = {
    roles: {
      admin: {
        permissions: ['*'],
        description: '管理员角色',
      },
      user: {
        permissions: ['read:self', 'write:self'],
        description: '普通用户角色',
      },
    },
    permissions: {
      '*': '所有权限',
      'read:self': '读取自己的数据',
      'write:self': '修改自己的数据',
    },
  };

  fs.writeFileSync(mockRbacPath, JSON.stringify(mockRbac, null, 2));
  console.log('✅ 创建模拟RBAC配置文件');
}

// 4. 更新jest配置以更好地处理测试环境
const jestConfigPath = path.join(__dirname, '../jest.config.js');
let jestConfig = fs.readFileSync(jestConfigPath, 'utf8');

// 添加测试环境变量设置
if (!jestConfig.includes('setupFiles')) {
  const setupFilesSection = `
  // 测试环境变量设置
  setupFiles: ['<rootDir>/tests/setup-env.js'],
`;

  jestConfig = jestConfig.replace(
    '// 测试环境变量设置',
    "// 测试环境变量设置\n  setupFiles: ['<rootDir>/tests/setup-env.js'],"
  );

  fs.writeFileSync(jestConfigPath, jestConfig);
  console.log('✅ 更新Jest配置文件');
}

// 5. 创建测试环境设置文件
const setupEnvPath = path.join(__dirname, '../tests/setup-env.js');
if (!fs.existsSync(setupEnvPath)) {
  const setupEnvContent = `
// 测试环境变量设置
require('dotenv').config({ path: '.env.test' });

// Mock fetch API (for Node.js environments)
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

// Mock other browser APIs that might be needed
if (!global.Headers) {
  global.Headers = require('node-fetch').Headers;
}

if (!global.Request) {
  global.Request = require('node-fetch').Request;
}

if (!global.Response) {
  global.Response = require('node-fetch').Response;
}

// 设置测试环境标识
process.env.NODE_ENV = 'test';
process.env.JEST_WORKER_ID = process.env.JEST_WORKER_ID || '1';

console.log('🧪 测试环境已初始化');
`;

  fs.writeFileSync(setupEnvPath, setupEnvContent);
  console.log('✅ 创建测试环境设置文件');
}

console.log('✨ 测试环境修复完成！');
console.log('现在可以运行: npm test');
