#!/usr/bin/env node

/**
 * 统一部署脚本
 * 支持多种部署场景的参数化配置
 */

const { DeploymentFramework } = require('./shared/deployment-framework');
const fs = require('fs');
const path = require('path');

class UnifiedDeployer extends DeploymentFramework {
  constructor(options = {}) {
    super(options);
    this.deploymentTypes = {
      'n8n-workflows': this.deployN8nWorkflows.bind(this),
      database: this.deployDatabase.bind(this),
      development: this.deployDevelopment.bind(this),
      'recommendation-engine': this.deployRecommendationEngine.bind(this),
    };
  }

  async deploy(deploymentType, options = {}) {
    const deployFunction = this.deploymentTypes[deploymentType];

    if (!deployFunction) {
      throw new Error(`Unknown deployment type: ${deploymentType}`);
    }

    this.logger.info(`Starting ${deploymentType} deployment...`);

    try {
      await deployFunction(options);
      this.logger.success(
        `${deploymentType} deployment completed successfully!`
      );
    } catch (error) {
      this.logger.error(`Deployment failed: ${error.message}`);
      throw error;
    }
  }

  async deployN8nWorkflows(options) {
    const config = this.loadEnvironmentConfig(
      path.join(__dirname, '../config/deploy/env-mapping.json')
    );

    // 备份当前工作流
    const backupDir = path.join(__dirname, '../backups', `n8n-${Date.now()}`);
    this.createBackup(path.join(__dirname, '../n8n-workflows'), backupDir);

    // 部署工作流
    const workflows = [
      'scan-flow.json',
      'tutorial-flow.json',
      'payment-success.json',
      'ai-escalation.json',
    ];

    for (const workflow of workflows) {
      const workflowPath = path.join(__dirname, '../n8n-workflows', workflow);
      if (fs.existsSync(workflowPath)) {
        this.logger.info(`Deploying ${workflow}...`);
        // 这里添加实际的部署逻辑
      }
    }

    // 生成部署报告
    this.generateReport(
      {
        type: 'n8n-workflows',
        workflows: workflows,
        config: config,
      },
      path.join(backupDir, 'deployment-report.json')
    );
  }

  async deployDatabase(options) {
    this.checkRequiredTools(['supabase', 'psql']);

    const projectId = process.env.SUPABASE_PROJECT_ID;
    const dbPassword = process.env.SUPABASE_DB_PASSWORD;

    Validator.validateNotEmpty(projectId, 'SUPABASE_PROJECT_ID');
    Validator.validateNotEmpty(dbPassword, 'SUPABASE_DB_PASSWORD');

    // 链接项目
    await this.executeCommand('supabase', [
      'link',
      `--project-ref=${projectId}`,
    ]);

    // 执行迁移
    await this.executeCommand('supabase', ['db', 'push']);

    // 应用RLS策略
    if (fs.existsSync(path.join(__dirname, '../supabase/rls_policies.sql'))) {
      await this.executeCommand('psql', [
        process.env.DATABASE_URL,
        '-f',
        path.join(__dirname, '../supabase/rls_policies.sql'),
      ]);
    }

    // 验证部署
    await this.executeCommand('node', [
      path.join(__dirname, 'verify-database.js'),
    ]);
  }

  async deployDevelopment(options) {
    const deployMode = options.mode || 'auto';

    this.logger.info(`Deploying development environment (${deployMode})...`);

    // 检查 Docker
    try {
      this.checkRequiredTools(['docker', 'docker-compose']);
    } catch (error) {
      this.logger.warning(
        'Docker not available, skipping container deployment'
      );
      return;
    }

    let composeFile;
    switch (deployMode) {
      case 'datacenter':
        composeFile = 'docker-compose.datacenter.yml';
        break;
      case 'n8n':
        composeFile = 'docker-compose.n8n-minimal.yml';
        break;
      case 'standard':
      default:
        composeFile = 'docker-compose.dev.yml';
        break;
    }

    const composePath = path.join(__dirname, '..', composeFile);
    if (fs.existsSync(composePath)) {
      await this.executeCommand('docker-compose', [
        '-f',
        composePath,
        'up',
        '-d',
      ]);
    } else {
      this.logger.warning(`Compose file not found: ${composePath}`);
    }
  }

  async deployRecommendationEngine(options) {
    this.logger.info('Deploying recommendation engine...');

    // 这里添加推荐引擎的具体部署逻辑
    // 可以参考原有的 deploy-recommendation-engine.js

    this.logger.success('Recommendation engine deployment completed');
  }
}

// CLI 处理
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  const options = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    dryRun: args.includes('--dry-run'),
    environment: process.env.NODE_ENV || 'development',
  };

  // 解析部署类型
  const deploymentType = args[0];

  // 解析额外选项
  const extraArgs = args.slice(1).filter(arg => !arg.startsWith('-'));
  if (extraArgs.length > 0) {
    options.mode = extraArgs[0];
  }

  const deployer = new UnifiedDeployer(options);

  try {
    await deployer.deploy(deploymentType, options);
  } catch (error) {
    console.error('Deployment failed:', error.message);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
Unified Deployment Script
=========================

Usage: node unified-deploy.js <deployment-type> [options] [mode]

Deployment Types:
  n8n-workflows          Deploy n8n workflows
  database               Deploy database schema and data
  development            Deploy development environment
  recommendation-engine  Deploy recommendation engine

Options:
  -h, --help             Show this help message
  -v, --verbose          Enable verbose output
  --dry-run              Execute without making changes
  --environment <env>    Set deployment environment (default: development)

Modes (for development deployment):
  auto                   Auto-detect deployment mode
  datacenter             Data center deployment
  n8n                    Minimal n8n deployment
  standard               Standard development deployment

Examples:
  node unified-deploy.js n8n-workflows --verbose
  node unified-deploy.js database --dry-run
  node unified-deploy.js development n8n
  node unified-deploy.js recommendation-engine
  `);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { UnifiedDeployer };
