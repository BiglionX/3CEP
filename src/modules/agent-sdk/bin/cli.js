#!/usr/bin/env node

/**
 * FixCycle Agent SDK CLI 工具
 * 提供本地开发、测试和调试功能
 */

import { Command } from 'commander';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { execSync } from 'child_process';

const program = new Command();

program
  .name('fixcycle-agent')
  .description('FixCycle智能体开发工具')
  .version('1.0.0');

// 初始化项目命令
program
  .command('init')
  .description('初始化一个新的智能体项目')
  .option('-n, --name <name>', '项目名称')
  .option('-c, --category <category>', '智能体类别')
  .option('-d, --dir <directory>', '项目目录', '.')
  .action(async options => {
    try {
      await initProject(options);
    } catch (error) {
      console.error('初始化失败:', error);
      process.exit(1);
    }
  });

// 测试命令
program
  .command('test')
  .description('测试智能体')
  .option('-f, --file <file>', '指定测试文件')
  .option('--watch', '监视模式')
  .action(async options => {
    try {
      await runTests(options);
    } catch (error) {
      console.error('测试失败:', error);
      process.exit(1);
    }
  });

// 调试命令
program
  .command('debug')
  .description('调试智能体')
  .option('-f, --file <file>', '要调试的智能体文件')
  .option('-i, --input <input>', '测试输入')
  .action(async options => {
    try {
      await debugAgent(options);
    } catch (error) {
      console.error('调试失败:', error);
      process.exit(1);
    }
  });

// 构建命令
program
  .command('build')
  .description('构建智能体项目')
  .option('--clean', '清理构建目录')
  .action(async options => {
    try {
      await buildProject(options);
    } catch (error) {
      console.error('构建失败:', error);
      process.exit(1);
    }
  });

// 部署命令
program
  .command('deploy')
  .description('部署智能体到FixCycle市场')
  .option('-k, --api-key <key>', 'API密钥')
  .option('--dry-run', '预演模式，不实际部署')
  .action(async options => {
    try {
      await deployAgent(options);
    } catch (error) {
      console.error('部署失败:', error);
      process.exit(1);
    }
  });

// 信息命令
program
  .command('info')
  .description('显示SDK信息')
  .action(() => {
    showSdkInfo();
  });

program.parse(process.argv);

async function initProject(options) {
  const projectName = options.name || 'my-agent';
  const category = options.category || 'utility';
  const projectDir = resolve(options.dir, projectName);

  console.log(`🚀 初始化智能体项目: ${projectName}`);
  console.log(`📁 项目目录: ${projectDir}`);
  console.log(`🏷️  智能体类别: ${category}`);

  // 创建项目目录
  if (!existsSync(projectDir)) {
    execSync(`mkdir "${projectDir}"`, { stdio: 'inherit' });
  }

  process.chdir(projectDir);

  // 初始化package.json
  const packageJson = {
    name: projectName,
    version: '1.0.0',
    description: `FixCycle ${category}智能体`,
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    scripts: {
      build: 'tsc',
      test: 'jest',
      start: 'node dist/index.js',
    },
    dependencies: {
      '@fixcycle/agent-sdk': '^1.0.0',
    },
    devDependencies: {
      '@types/node': '^20.0.0',
      typescript: '^5.0.0',
      jest: '^29.0.0',
    },
  };

  writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

  // 创建tsconfig.json
  const tsconfig = {
    compilerOptions: {
      target: 'ES2022',
      module: 'commonjs',
      lib: ['ES2022'],
      declaration: true,
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist'],
  };

  writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2));

  // 创建源码目录
  execSync('mkdir src', { stdio: 'inherit' });

  // 创建示例智能体
  const agentCode = `import { BaseAgent, Agent } from '@fixcycle/agent-sdk';
import { AgentInput, AgentOutput, AgentConfig, AgentInfo } from '@fixcycle/agent-sdk/types';

@Agent({
  name: '${projectName}',
  version: '1.0.0',
  description: '我的第一个FixCycle智能体',
  category: '${category}'
})
export class MyAgent extends BaseAgent {

  constructor(config: AgentConfig) {
    const info: AgentInfo = {
      id: '${projectName}',
      name: '${projectName}',
      description: '我的第一个FixCycle智能体',
      version: '1.0.0',
      category: '${category}',
      tags: ['示例'],
      author: 'Developer'
    };

    super(info, config);
  }

  protected async onInitialize(): Promise<void> {
    console.log('${projectName} 初始化完成');
  }

  protected async onProcess(input: AgentInput): Promise<AgentOutput> {
    return {
      content: \`收到消息: \${input.content}\`,
      metadata: { processed: true }
    };
  }

  protected async onDestroy(): Promise<void> {
    console.log('${projectName} 清理完成');
  }
}`;

  writeFileSync('src/index.ts', agentCode);

  // 创建测试文件
  const testCode = `import { MyAgent } from '../src/index';

describe('${projectName} Tests', () => {
  let agent: MyAgent;

  beforeEach(async () => {
    agent = new MyAgent({ apiKey: 'test-key' });
    await agent.initialize();
  });

  afterEach(async () => {
    await agent.destroy();
  });

  test('应该正确处理输入', async () => {
    const result = await agent.process({
      content: 'Hello World'
    });

    expect(result.content).toContain('Hello World');
    expect(result.metadata?.processed).toBe(true);
  });
});`;

  execSync('mkdir __tests__', { stdio: 'inherit' });
  writeFileSync('__tests__/agent.test.ts', testCode);

  console.log('✅ 项目初始化完成！');
  console.log('\n下一步:');
  console.log('1. 运行 `npm install` 安装依赖');
  console.log('2. 运行 `npm run build` 构建项目');
  console.log('3. 运行 `npm test` 运行测试');
}

async function runTests(options) {
  console.log('🧪 运行测试...');

  let testCommand = 'npx jest';

  if (options.file) {
    testCommand += ` ${options.file}`;
  }

  if (options.watch) {
    testCommand += ' --watch';
  }

  execSync(testCommand, { stdio: 'inherit' });
}

async function debugAgent(options) {
  if (!options.file) {
    console.error('请指定要调试的智能体文件: --file <file>');
    process.exit(1);
  }

  if (!options.input) {
    console.error('请提供测试输入: --input <input>');
    process.exit(1);
  }

  console.log(`🔍 调试智能体: ${options.file}`);
  console.log(`📥 输入: ${options.input}`);

  // 这里可以实现更复杂的调试逻辑
  // 比如启动调试服务器、提供交互式调试等
  console.log('调试功能正在开发中...');
}

async function buildProject(options) {
  console.log('🏗️  构建项目...');

  if (options.clean) {
    console.log('🧹 清理构建目录...');
    execSync('rm -rf dist', { stdio: 'inherit' });
  }

  execSync('npx tsc', { stdio: 'inherit' });
  console.log('✅ 构建完成！');
}

async function deployAgent(options) {
  console.log('🚀 部署智能体...');

  if (options.dryRun) {
    console.log('🎭 预演模式 - 不会实际部署');
  }

  if (!options.apiKey) {
    console.error('请提供API密钥: --api-key <key>');
    process.exit(1);
  }

  // 这里实现实际的部署逻辑
  console.log('部署功能正在开发中...');
}

function showSdkInfo() {
  console.log('📦 FixCycle Agent SDK 信息');
  console.log('========================');
  console.log('版本: 1.0.0');
  console.log('描述: FixCycle智能体开发工具包');
  console.log('官网: https://fixcycle.com/sdk');
  console.log('文档: https://docs.fixcycle.com/sdk');
  console.log('');
  console.log('可用命令:');
  console.log('  init    - 初始化新项目');
  console.log('  test    - 运行测试');
  console.log('  debug   - 调试智能体');
  console.log('  build   - 构建项目');
  console.log('  deploy  - 部署到市场');
  console.log('  info    - 显示信息');
}
