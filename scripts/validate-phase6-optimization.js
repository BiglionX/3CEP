#!/usr/bin/env node

/**
 * 阶段 6 优化验证脚本
 * 验证代码健康与结构优化的完成情况
 */

const fs = require('fs');
const path = require('path');

class Phase6Validator {
  constructor() {
    this.results = {
      scriptsOptimization: false,
      demoSeparation: false,
      codeQualityTools: false,
      preCommitHooks: false
    };
  }

  async validate() {
    console.log('🚀 阶段 6：代码健康与结构优化验证\n');
    console.log('=' .repeat(50));

    await this.validateScriptsOptimization();
    await this.validateDemoSeparation();
    await this.validateCodeQualityTools();
    await this.validatePreCommitHooks();

    this.printSummary();
  }

  async validateScriptsOptimization() {
    console.log('\n1️⃣ 脚本优化验证');
    console.log('-'.repeat(30));

    // 检查统一部署框架是否存在
    const frameworkPath = path.join(__dirname, 'shared', 'deployment-framework.js');
    const unifiedDeployPath = path.join(__dirname, 'unified-deploy.js');
    
    if (fs.existsSync(frameworkPath) && fs.existsSync(unifiedDeployPath)) {
      console.log('✅ 统一部署框架已创建');
      this.results.scriptsOptimization = true;
    } else {
      console.log('❌ 统一部署框架缺失');
    }

    // 检查重复脚本的重构
    const deployScripts = fs.readdirSync(__dirname)
      .filter(file => file.startsWith('deploy-') && (file.endsWith('.sh') || file.endsWith('.bat')));
    
    let refactoredCount = 0;
    for (const script of deployScripts) {
      const scriptPath = path.join(__dirname, script);
      const content = fs.readFileSync(scriptPath, 'utf8');
      if (content.includes('unified-deploy.js')) {
        refactoredCount++;
      }
    }

    console.log(`✅ ${refactoredCount}/${deployScripts.length} 个部署脚本已重构使用统一框架`);
  }

  async validateDemoSeparation() {
    console.log('\n2️⃣ 演示脚本分离验证');
    console.log('-'.repeat(30));

    const demosDir = path.join(__dirname, 'demos');
    if (fs.existsSync(demosDir)) {
      const demoFiles = fs.readdirSync(demosDir)
        .filter(file => file.startsWith('demonstrate-') || file.startsWith('demo-'));
      
      console.log(`✅ 演示脚本目录已创建，包含 ${demoFiles.length} 个演示脚本`);
      
      // 检查演示入口文件
      const demoIndex = path.join(demosDir, 'index.js');
      if (fs.existsSync(demoIndex)) {
        console.log('✅ 演示脚本入口文件已创建');
        this.results.demoSeparation = true;
      }
    } else {
      console.log('❌ 演示脚本目录不存在');
    }
  }

  async validateCodeQualityTools() {
    console.log('\n3️⃣ 代码质量工具验证');
    console.log('-'.repeat(30));

    // 检查配置文件
    const eslintConfig = fs.existsSync(path.join(__dirname, '..', '.eslintrc.json'));
    const prettierConfig = fs.existsSync(path.join(__dirname, '..', '.prettierrc'));
    const prettierIgnore = fs.existsSync(path.join(__dirname, '..', '.prettierignore'));
    
    console.log(`✅ ESLint 配置: ${eslintConfig ? '存在' : '缺失'}`);
    console.log(`✅ Prettier 配置: ${prettierConfig ? '存在' : '缺失'}`);
    console.log(`✅ Prettier 忽略文件: ${prettierIgnore ? '存在' : '缺失'}`);

    // 检查 package.json 脚本
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
    const requiredScripts = ['lint:fix', 'lint:check', 'format', 'format:check'];
    const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
    
    if (missingScripts.length === 0) {
      console.log('✅ 代码质量相关 npm 脚本已添加');
      this.results.codeQualityTools = true;
    } else {
      console.log(`❌ 缺失 npm 脚本: ${missingScripts.join(', ')}`);
    }
  }

  async validatePreCommitHooks() {
    console.log('\n4️⃣ Pre-commit Hook 验证');
    console.log('-'.repeat(30));

    const huskyDir = path.join(__dirname, '..', '.husky');
    const preCommitHook = path.join(huskyDir, 'pre-commit');
    const lintStagedConfig = path.join(__dirname, '..', '.lintstagedrc.json');
    
    console.log(`✅ Husky 目录: ${fs.existsSync(huskyDir) ? '存在' : '缺失'}`);
    console.log(`✅ Pre-commit hook: ${fs.existsSync(preCommitHook) ? '存在' : '缺失'}`);
    console.log(`✅ Lint-staged 配置: ${fs.existsSync(lintStagedConfig) ? '存在' : '缺失'}`);

    if (fs.existsSync(huskyDir) && fs.existsSync(preCommitHook)) {
      this.results.preCommitHooks = true;
      console.log('✅ Pre-commit hook 已配置');
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📋 阶段 6 验证总结');
    console.log('='.repeat(50));
    
    const totalChecks = Object.keys(this.results).length;
    const passedChecks = Object.values(this.results).filter(result => result).length;
    
    console.log(`总检查项: ${totalChecks}`);
    console.log(`通过项: ${passedChecks}`);
    console.log(`通过率: ${Math.round((passedChecks / totalChecks) * 100)}%`);
    
    console.log('\n详细结果:');
    Object.entries(this.results).forEach(([check, result]) => {
      const status = result ? '✅ 通过' : '❌ 失败';
      const checkNames = {
        scriptsOptimization: '脚本优化',
        demoSeparation: '演示脚本分离',
        codeQualityTools: '代码质量工具',
        preCommitHooks: 'Pre-commit Hooks'
      };
      console.log(`  ${status} ${checkNames[check]}`);
    });
    
    if (passedChecks === totalChecks) {
      console.log('\n🎉 阶段 6 优化完成！所有检查项均已通过。');
    } else {
      console.log('\n⚠️  阶段 6 优化部分完成，建议修复失败项。');
    }
  }
}

// 执行验证
if (require.main === module) {
  const validator = new Phase6Validator();
  validator.validate().catch(console.error);
}

module.exports = { Phase6Validator };