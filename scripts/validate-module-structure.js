#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 验证项目模块结构...\n');

// 配置文件路径
const configPath = 'project-structure-config.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// 验证函数
function validateModuleStructure() {
  const results = {
    businessModules: [],
    techModules: [],
    overall: { valid: 0, total: 0, issues: [] }
  };

  // 验证业务模块
  console.log('📋 验证业务模块...');
  config.moduleStructure.businessModules.forEach(module => {
    const modulePath = module.path;
    const exists = fs.existsSync(modulePath);
    
    const moduleResult = {
      name: module.name,
      path: modulePath,
      exists,
      dependencies: module.dependencies,
      exports: module.exports,
      routes: module.routes
    };

    if (exists) {
      console.log(`✅ ${module.name} - 存在`);
      results.overall.valid++;
    } else {
      console.log(`❌ ${module.name} - 缺失 (${modulePath})`);
      results.overall.issues.push(`模块缺失: ${module.name}`);
    }
    
    results.businessModules.push(moduleResult);
    results.overall.total++;
  });

  // 验证技术模块
  console.log('\n🔧 验证技术模块...');
  config.moduleStructure.techModules.forEach(module => {
    const modulePath = module.path;
    const exists = fs.existsSync(modulePath);
    
    const moduleResult = {
      name: module.name,
      path: modulePath,
      exists,
      dependencies: module.dependencies,
      exports: module.exports
    };

    if (exists) {
      console.log(`✅ ${module.name} - 存在`);
      results.overall.valid++;
    } else {
      console.log(`❌ ${module.name} - 缺失 (${modulePath})`);
      results.overall.issues.push(`技术模块缺失: ${module.name}`);
    }
    
    results.techModules.push(moduleResult);
    results.overall.total++;
  });

  return results;
}

// 验证依赖关系
function validateDependencies(results) {
  console.log('\n🔗 验证模块依赖关系...');
  const issues = [];

  Object.entries(config.dependencyGraph).forEach(([moduleName, dependencies]) => {
    const moduleExists = results.businessModules.some(m => m.name === moduleName && m.exists) ||
                        results.techModules.some(m => m.name === moduleName && m.exists);
    
    if (!moduleExists) {
      issues.push(`依赖验证跳过: 模块 ${moduleName} 不存在`);
      return;
    }

    dependencies.forEach(dep => {
      const depExists = results.businessModules.some(m => m.name === dep && m.exists) ||
                       results.techModules.some(m => m.name === dep && m.exists);
      
      if (!depExists) {
        issues.push(`依赖问题: ${moduleName} 依赖的模块 ${dep} 不存在`);
      }
    });
  });

  return issues;
}

// 验证路由配置
function validateRouting() {
  console.log('\n🌐 验证路由配置...');
  const routingIssues = [];

  // 检查基本路由文件是否存在
  const appDir = 'src/app';
  if (!fs.existsSync(appDir)) {
    routingIssues.push('主应用目录不存在');
  } else {
    // 检查关键路由是否存在
    const keyRoutes = ['page.tsx', 'layout.tsx'];
    keyRoutes.forEach(route => {
      const routePath = path.join(appDir, route);
      if (!fs.existsSync(routePath)) {
        routingIssues.push(`关键路由文件缺失: ${route}`);
      }
    });
  }

  return routingIssues;
}

// 执行验证
const structureResults = validateModuleStructure();
const dependencyIssues = validateDependencies(structureResults);
const routingIssues = validateRouting();

// 生成报告
const finalReport = {
  timestamp: new Date().toISOString(),
  projectInfo: config.projectInfo,
  structureValidation: structureResults,
  dependencyValidation: {
    issues: dependencyIssues
  },
  routingValidation: {
    issues: routingIssues
  },
  summary: {
    structureComplete: structureResults.overall.valid === structureResults.overall.total,
    dependencyIssues: dependencyIssues.length,
    routingIssues: routingIssues.length,
    overallStatus: (structureResults.overall.valid === structureResults.overall.total && 
                   dependencyIssues.length === 0 && 
                   routingIssues.length === 0) ? 'PASS' : 'FAIL'
  }
};

// 输出结果
console.log('\n📊 验证结果汇总:');
console.log(`   模块结构: ${structureResults.overall.valid}/${structureResults.overall.total} 通过`);
console.log(`   依赖关系: ${dependencyIssues.length} 个问题`);
console.log(`   路由配置: ${routingIssues.length} 个问题`);
console.log(`   整体状态: ${finalReport.summary.overallStatus}`);

if (finalReport.summary.overallStatus === 'PASS') {
  console.log('\n🎉 模块结构验证通过！');
} else {
  console.log('\n⚠️  存在以下问题需要解决:');
  if (dependencyIssues.length > 0) {
    console.log('   依赖问题:');
    dependencyIssues.forEach(issue => console.log(`     • ${issue}`));
  }
  if (routingIssues.length > 0) {
    console.log('   路由问题:');
    routingIssues.forEach(issue => console.log(`     • ${issue}`));
  }
}

// 保存详细报告
fs.writeFileSync(
  'structure-validation-report.json',
  JSON.stringify(finalReport, null, 2)
);

console.log('\n📝 详细验证报告已生成: structure-validation-report.json');