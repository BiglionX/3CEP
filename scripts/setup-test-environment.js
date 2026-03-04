#!/usr/bin/env node

/**
 * 管理后台优化项目测试环境设置脚本
 *
 * 功能包括：
 * 1. 创建专用测试分支
 * 2. 初始化测试数据库
 * 3. 配置测试环境变量
 * 4. 启动测试服务
 * 5. 验证环境准备状态
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TestEnvironmentSetup {
  constructor() {
    this.projectRoot = process.cwd();
    this.testBranch = 'feature/admin-optimization';
    this.testEnvFile = '.env.test';
    this.testDatabaseName = 'prodcycleai_test';
  }

  async run() {
    console.log('🚀 开始设置管理后台优化测试环境...\n');

    try {
      await this.createTestBranch();
      await this.setupTestDatabase();
      await this.configureTestEnvironment();
      await this.installTestDependencies();
      await this.startTestServices();
      await this.validateEnvironment();

      console.log('\n✅ 测试环境设置完成！');
      console.log('\n📋 下一步操作：');
      console.log('1. 运行 npm run test:admin 进行管理后台专项测试');
      console.log('2. 访问 http://localhost:3001 查看测试环境');
      console.log('3. 使用测试账号登录验证功能');
    } catch (error) {
      console.error('\n❌ 测试环境设置失败:', error.message);
      process.exit(1);
    }
  }

  async createTestBranch() {
    console.log('1️⃣ 创建测试分支...');

    try {
      // 检查分支是否已存在
      const branchExists = execSync('git branch --list', { encoding: 'utf8' })
        .split('\n')
        .some(branch => branch.trim() === this.testBranch);

      if (branchExists) {
        console.log(`   分支 ${this.testBranch} 已存在，切换到该分支`);
        execSync(`git checkout ${this.testBranch}`);
      } else {
        console.log(`   创建新分支 ${this.testBranch}`);
        execSync(`git checkout -b ${this.testBranch}`);
      }

      console.log('✅ 测试分支准备完成');
    } catch (error) {
      throw new Error(`创建测试分支失败: ${error.message}`);
    }
  }

  async setupTestDatabase() {
    console.log('2️⃣ 初始化测试数据库...');

    try {
      // 创建测试数据库配置
      const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || '5432',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: this.testDatabaseName,
      };

      // 执行数据库初始化脚本
      const initScript = path.join(
        this.projectRoot,
        'sql',
        'init-test-database.sql'
      );
      if (fs.existsSync(initScript)) {
        console.log('   执行数据库初始化脚本...');
        execSync(
          `psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -f ${initScript}`,
          {
            env: { ...process.env, PGPASSWORD: dbConfig.password },
          }
        );
      } else {
        console.log('   创建测试数据库...');
        execSync(
          `createdb -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} ${this.testDatabaseName}`,
          {
            env: { ...process.env, PGPASSWORD: dbConfig.password },
          }
        );
      }

      console.log('✅ 测试数据库初始化完成');
    } catch (error) {
      console.warn(`⚠️  数据库设置警告: ${error.message}`);
      console.log('   继续使用现有数据库配置...');
    }
  }

  async configureTestEnvironment() {
    console.log('3️⃣ 配置测试环境变量...');

    try {
      const testEnvContent = `
# 管理后台优化测试环境配置
NODE_ENV=test
PORT=3001

# 数据库配置
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/${this.testDatabaseName}
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM9zvKv2JUrRqbsBW8jligu6O2htw7LHiP1vqtOak

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# 测试专用配置
ENABLE_TEST_MODE=true
TEST_ADMIN_EMAIL=admin@test.com
TEST_ADMIN_PASSWORD=Test123456!
MOCK_EXTERNAL_SERVICES=true
DISABLE_RATE_LIMITING=true

# 日志配置
LOG_LEVEL=debug
ENABLE_PERFORMANCE_MONITORING=true
      `.trim();

      fs.writeFileSync(
        path.join(this.projectRoot, this.testEnvFile),
        testEnvContent
      );
      console.log(`✅ 测试环境变量配置完成 (${this.testEnvFile})`);
    } catch (error) {
      throw new Error(`环境变量配置失败: ${error.message}`);
    }
  }

  async installTestDependencies() {
    console.log('4️⃣ 安装测试依赖...');

    try {
      // 检查并安装测试相关依赖
      const packagesToInstall = [
        '@types/supertest@^2.0.12',
        'supertest@^6.3.3',
        'nock@^13.3.0',
        'sinon@^15.0.1',
        'chai@^4.3.7',
      ];

      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const installedDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      const missingPackages = packagesToInstall.filter(pkg => {
        const pkgName = pkg.split('@')[0];
        return !installedDeps[pkgName];
      });

      if (missingPackages.length > 0) {
        console.log('   安装缺失的测试依赖...');
        execSync(`npm install --save-dev ${missingPackages.join(' ')}`, {
          stdio: 'inherit',
        });
      }

      console.log('✅ 测试依赖检查完成');
    } catch (error) {
      console.warn(`⚠️  依赖安装警告: ${error.message}`);
    }
  }

  async startTestServices() {
    console.log('5️⃣ 启动测试服务...');

    try {
      // 启动开发服务器（测试模式）
      console.log('   启动Next.js开发服务器...');

      // 设置环境变量
      process.env.NODE_ENV = 'test';
      process.env.PORT = '3001';

      // 检查端口占用
      try {
        execSync('lsof -ti:3001 | xargs kill -9', { stdio: 'pipe' });
        console.log('   清理占用的端口 3001');
      } catch (e) {
        // 端口未被占用，忽略错误
      }

      // 启动服务（后台运行）
      const serverProcess = execSync('npm run dev', {
        cwd: this.projectRoot,
        stdio: 'ignore',
        detached: true,
      });

      console.log('✅ 测试服务启动完成');
      console.log('   服务地址: http://localhost:3001');
    } catch (error) {
      throw new Error(`服务启动失败: ${error.message}`);
    }
  }

  async validateEnvironment() {
    console.log('6️⃣ 验证环境准备状态...');

    const validationResults = [];

    // 验证1: 端口可用性
    try {
      await this.delay(3000); // 等待服务启动
      const response = await fetch('http://localhost:3001/api/health');
      if (response.ok) {
        validationResults.push({ test: '服务连通性', status: '✅ 通过' });
      } else {
        validationResults.push({ test: '服务连通性', status: '❌ 失败' });
      }
    } catch (error) {
      validationResults.push({ test: '服务连通性', status: '❌ 失败' });
    }

    // 验证2: 环境变量
    const requiredEnvVars = ['NODE_ENV', 'PORT'];
    const missingEnvVars = requiredEnvVars.filter(
      varName => !process.env[varName]
    );
    if (missingEnvVars.length === 0) {
      validationResults.push({ test: '环境变量配置', status: '✅ 通过' });
    } else {
      validationResults.push({
        test: '环境变量配置',
        status: `❌ 缺失: ${missingEnvVars.join(', ')}`,
      });
    }

    // 验证3: 测试文件存在性
    const requiredFiles = [
      'tests/admin-optimization/',
      'src/permissions/',
      this.testEnvFile,
    ];

    requiredFiles.forEach(filePath => {
      const fullPath = path.join(this.projectRoot, filePath);
      const exists = fs.existsSync(fullPath);
      validationResults.push({
        test: `文件/目录存在性: ${filePath}`,
        status: exists ? '✅ 通过' : '❌ 失败',
      });
    });

    // 输出验证结果
    console.log('\n🔍 环境验证结果:');
    validationResults.forEach(result => {
      console.log(`   ${result.status} ${result.test}`);
    });

    const failedTests = validationResults.filter(r =>
      r.status.includes('❌')
    ).length;
    if (failedTests > 0) {
      throw new Error(`环境验证失败，${failedTests} 项检查未通过`);
    }

    console.log('✅ 环境验证通过');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 执行环境设置
if (require.main === module) {
  const setup = new TestEnvironmentSetup();
  setup.run().catch(error => {
    console.error('环境设置过程中发生错误:', error);
    process.exit(1);
  });
}

module.exports = TestEnvironmentSetup;
