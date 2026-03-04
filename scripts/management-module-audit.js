#!/usr/bin/env node

/**
 * 管理模块完整性审计脚本
 * 自动检查管理后台功能覆盖情况
 */

const fs = require('fs');
const path = require('path');

// 配置常量
const PROJECT_ROOT = path.join(__dirname, '..');
const ADMIN_DIR = path.join(PROJECT_ROOT, 'src', 'app', 'admin');
const MODULE_REGISTRY_PATH = path.join(
  PROJECT_ROOT,
  'src',
  'lib',
  'module-registry.ts'
);

// 评分标准权重
const SCORING_WEIGHTS = {
  basic_functions: 40, // 基础功能
  advanced_functions: 30, // 高级功能
  permissions: 15, // 权限控制
  ux: 15, // 用户体验
};

// 预期的管理模块路径映射
const EXPECTED_ADMIN_PATHS = {
  // 业务模块管理
  repair_service: '/admin/repair-service',
  parts_market: '/admin/parts-market',
  device_management: '/admin/devices',
  crowdfunding: '/admin/crowdfunding',
  fcx_alliance: '/admin/fcx',
  valuation_service: '/admin/valuation',

  // 系统管理模块
  system_dashboard: '/admin/dashboard',
  user_management: '/admin/users',
  content_management: '/admin/content',
  shop_management: '/admin/shops',
  financial_management: '/admin/finance',
  procurement_center: '/admin/procurement',
  warehouse_management: '/admin/warehouse',
  agent_workflows: '/admin/agents',
  n8n_integration: '/admin/n8n',

  // 系统模块
  system_audit: '/admin/audit',
  system_monitoring: '/admin/monitoring',
  system_settings: '/admin/settings',
};

class ManagementAudit {
  constructor() {
    this.results = {
      total_modules: 0,
      covered_modules: 0,
      missing_modules: [],
      partial_modules: [],
      coverage_rate: 0,
      average_score: 0,
    };
    this.module_details = {};
  }

  /**
   * 执行完整审计流程
   */
  async runAudit() {
    console.log('🔍 开始管理功能完整性审计...\n');

    // 1. 加载模块注册信息
    await this.loadModuleRegistry();

    // 2. 检查现有管理目录结构
    this.checkAdminStructure();

    // 3. 评估各模块功能完整性
    await this.evaluateModuleCoverage();

    // 4. 生成审计报告
    this.generateReport();

    // 5. 输出详细结果
    this.outputDetailedResults();

    return this.results;
  }

  /**
   * 加载模块注册表
   */
  async loadModuleRegistry() {
    try {
      const registryContent = fs.readFileSync(MODULE_REGISTRY_PATH, 'utf8');

      // 提取各模块数组
      const businessModules = this.extractModuleArray(
        registryContent,
        'BUSINESS_MODULES'
      );
      const managementModules = this.extractModuleArray(
        registryContent,
        'MANAGEMENT_MODULES'
      );
      const systemModules = this.extractModuleArray(
        registryContent,
        'SYSTEM_MODULES'
      );
      const personalModules = this.extractModuleArray(
        registryContent,
        'PERSONAL_MODULES'
      );

      this.allModules = [
        ...businessModules,
        ...managementModules,
        ...systemModules,
        ...personalModules,
      ];

      this.results.total_modules = this.allModules.length;
      console.log(`📋 检测到 ${this.allModules.length} 个模块需要管理功能`);
    } catch (error) {
      console.error('❌ 读取模块注册表失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 从注册表内容中提取模块数组
   */
  extractModuleArray(content, arrayName) {
    // 更宽松的正则表达式匹配
    const regex = new RegExp(
      `${arrayName}:\\s*ModuleConfig\\[\\]\\s*=\\s*\\[(.*?)\\];`,
      's'
    );
    const match = content.match(regex);

    if (!match) {
      console.log(`⚠️  未找到 ${arrayName}`);
      return [];
    }

    // 解析模块对象
    const modules = [];
    const arrayContent = match[1];

    // 匹配每个模块对象 { id: 'xxx', ... }
    const moduleRegex = /{[^}]*id:\s*'([^']+)'[^}]*}/g;
    let moduleMatch;

    while ((moduleMatch = moduleRegex.exec(arrayContent)) !== null) {
      const moduleId = moduleMatch[1];
      modules.push({
        id: moduleId,
        name: this.getModuleName(moduleId),
        category: this.getModuleCategory(arrayName),
      });
    }

    console.log(`✅ 从 ${arrayName} 解析到 ${modules.length} 个模块`);
    return modules;
  }

  /**
   * 获取模块显示名称
   */
  getModuleName(moduleId) {
    const nameMap = {
      repair_service: '维修服务',
      parts_market: '配件商城',
      device_management: '设备管理',
      crowdfunding: '众筹平台',
      fcx_alliance: 'FCX联盟',
      valuation_service: '估价服务',
      system_dashboard: '系统概览',
      user_management: '用户管理',
      content_management: '内容管理',
      shop_management: '店铺管理',
      financial_management: '财务管理',
      procurement_center: '采购中心',
      warehouse_management: '仓储管理',
      agent_workflows: '智能体工作流',
      n8n_integration: 'n8n集成',
      system_audit: '系统审计',
      system_monitoring: '系统监控',
      system_settings: '系统设置',
    };

    return nameMap[moduleId] || moduleId;
  }

  /**
   * 获取模块分类
   */
  getModuleCategory(arrayName) {
    const categoryMap = {
      BUSINESS_MODULES: 'business',
      MANAGEMENT_MODULES: 'management',
      SYSTEM_MODULES: 'system',
      PERSONAL_MODULES: 'personal',
    };
    return categoryMap[arrayName] || 'unknown';
  }

  /**
   * 检查管理目录结构
   */
  checkAdminStructure() {
    console.log('\n📁 检查管理后台目录结构...');

    if (!fs.existsSync(ADMIN_DIR)) {
      console.log('❌ 管理后台目录不存在');
      return;
    }

    const adminDirs = fs
      .readdirSync(ADMIN_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    console.log(`✅ 检测到 ${adminDirs.length} 个管理子目录:`);
    adminDirs.forEach(dir => {
      console.log(`   • ${dir}`);
    });

    this.existingAdminDirs = adminDirs;
  }

  /**
   * 评估模块功能覆盖情况
   */
  async evaluateModuleCoverage() {
    console.log('\n📊 评估各模块功能覆盖情况...\n');

    for (const module of this.allModules) {
      const evaluation = await this.evaluateSingleModule(module);
      this.module_details[module.id] = evaluation;

      if (evaluation.coverage_status === 'complete') {
        this.results.covered_modules++;
      } else if (evaluation.coverage_status === 'partial') {
        this.results.partial_modules.push(module.id);
      } else {
        this.results.missing_modules.push(module.id);
      }

      console.log(
        `${this.getStatusIcon(evaluation.coverage_status)} ${module.name}: ${evaluation.score}/100分`
      );
    }

    // 计算覆盖率
    this.results.coverage_rate = Math.round(
      (this.results.covered_modules / this.results.total_modules) * 100
    );

    // 计算平均分
    const totalScore = Object.values(this.module_details).reduce(
      (sum, detail) => sum + detail.score,
      0
    );
    this.results.average_score = Math.round(
      totalScore / this.results.total_modules
    );
  }

  /**
   * 评估单个模块的功能完整性
   */
  async evaluateSingleModule(module) {
    const expectedPath = EXPECTED_ADMIN_PATHS[module.id];
    const actualPath = this.findActualAdminPath(module.id);

    // 基础检查
    const hasDirectory = !!actualPath;
    const hasPageFile = hasDirectory && this.checkPageFile(actualPath);
    const hasApiRoutes = hasDirectory && this.checkApiRoutes(actualPath);

    // 功能完整性评分
    let score = 0;
    const details = {
      has_directory: hasDirectory,
      has_page: hasPageFile,
      has_api: hasApiRoutes,
      expected_path: expectedPath,
      actual_path: actualPath,
    };

    // 基础功能 (40分)
    if (hasDirectory) score += 15;
    if (hasPageFile) score += 25;

    // 高级功能 (30分)
    if (hasApiRoutes) score += 20;
    if (this.checkAdvancedFeatures(actualPath)) score += 10;

    // 权限控制 (15分)
    if (this.checkPermissionImplementation(actualPath)) score += 15;

    // 用户体验 (15分)
    if (this.checkUXQuality(actualPath)) score += 15;

    // 确定覆盖状态
    let coverageStatus = 'missing';
    if (score >= 80) {
      coverageStatus = 'complete';
    } else if (score >= 40) {
      coverageStatus = 'partial';
    }

    return {
      ...details,
      score,
      coverage_status: coverageStatus,
      missing_features: this.identifyMissingFeatures(module.id, details),
    };
  }

  /**
   * 查找模块对应的实际管理路径
   */
  findActualAdminPath(moduleId) {
    const pathMappings = {
      repair_service: ['repair-service', 'repair'],
      parts_market: ['parts-market', 'parts'],
      device_management: ['devices', 'device'],
      crowdfunding: ['crowdfunding'],
      fcx_alliance: ['fcx'],
      valuation_service: ['valuation'],
      user_management: ['users', 'user'],
      content_management: ['content'],
      shop_management: ['shops', 'shop'],
      financial_management: ['finance'],
      procurement_center: ['procurement'],
      warehouse_management: ['warehouse'],
      agent_workflows: ['agents', 'agent'],
      n8n_integration: ['n8n'],
      system_audit: ['audit'],
      system_monitoring: ['monitoring'],
      system_settings: ['settings'],
    };

    const possibleNames = pathMappings[moduleId] || [moduleId];

    for (const name of possibleNames) {
      const fullPath = path.join(ADMIN_DIR, name);
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }

    return null;
  }

  /**
   * 检查页面文件是否存在
   */
  checkPageFile(adminPath) {
    if (!adminPath) return false;

    const pagePaths = [
      path.join(adminPath, 'page.tsx'),
      path.join(adminPath, 'index.tsx'),
      path.join(adminPath, 'page.js'),
    ];

    return pagePaths.some(filePath => fs.existsSync(filePath));
  }

  /**
   * 检查API路由是否存在
   */
  checkApiRoutes(adminPath) {
    if (!adminPath) return false;

    const apiDir = path.join(path.dirname(adminPath), 'api');
    return fs.existsSync(apiDir);
  }

  /**
   * 检查高级功能实现
   */
  checkAdvancedFeatures(adminPath) {
    if (!adminPath) return false;

    try {
      const files = fs.readdirSync(adminPath, { recursive: true });
      const hasAdvanced = files.some(
        file =>
          file.includes('import') ||
          file.includes('export') ||
          file.includes('component')
      );
      return hasAdvanced;
    } catch {
      return false;
    }
  }

  /**
   * 检查权限实现
   */
  checkPermissionImplementation(adminPath) {
    if (!adminPath) return false;

    try {
      const content = fs.readFileSync(path.join(adminPath, 'page.tsx'), 'utf8');
      return content.includes('permission') || content.includes('auth');
    } catch {
      return false;
    }
  }

  /**
   * 检查用户体验质量
   */
  checkUXQuality(adminPath) {
    if (!adminPath) return false;

    try {
      const content = fs.readFileSync(path.join(adminPath, 'page.tsx'), 'utf8');
      const uxIndicators = ['loading', 'error', 'pagination', 'search'];
      return uxIndicators.some(indicator => content.includes(indicator));
    } catch {
      return false;
    }
  }

  /**
   * 识别缺失功能
   */
  identifyMissingFeatures(moduleId, details) {
    const missing = [];

    if (!details.has_directory) {
      missing.push('管理目录缺失');
    }
    if (!details.has_page) {
      missing.push('管理页面缺失');
    }
    if (!details.has_api) {
      missing.push('API接口缺失');
    }

    return missing;
  }

  /**
   * 获取状态图标
   */
  getStatusIcon(status) {
    const icons = {
      complete: '✅',
      partial: '⚠️ ',
      missing: '❌',
    };
    return icons[status] || '❓';
  }

  /**
   * 生成审计报告
   */
  generateReport() {
    const report = `
============================================================
管理功能完整性审计报告
============================================================

📅 审计时间: ${new Date().toLocaleString('zh-CN')}
📊 审计范围: ${this.results.total_modules} 个模块

📈 总体覆盖情况:
   • 完全覆盖模块: ${this.results.covered_modules}/${this.results.total_modules}
   • 部分覆盖模块: ${this.results.partial_modules.length} 个
   • 缺失模块: ${this.results.missing_modules.length} 个
   • 功能覆盖率: ${this.results.coverage_rate}%
   • 平均评分: ${this.results.average_score}/100

🎯 缺失模块清单:
${this.results.missing_modules.map(id => `   • ${this.getModuleName(id)} (${id})`).join('\n') || '   无'}

⚠️ 部分覆盖模块:
${this.results.partial_modules.map(id => `   • ${this.getModuleName(id)} (${id})`).join('\n') || '   无'}

============================================================
`;

    // 保存报告到文件
    const reportPath = path.join(
      PROJECT_ROOT,
      'reports',
      'management-audit-report.txt'
    );
    fs.writeFileSync(reportPath, report, 'utf8');
    console.log(`\n📄 审计报告已保存到: ${reportPath}`);
  }

  /**
   * 输出详细结果
   */
  outputDetailedResults() {
    console.log('\n📋 详细评估结果:');
    console.log('='.repeat(60));

    Object.entries(this.module_details).forEach(([moduleId, detail]) => {
      const moduleName = this.getModuleName(moduleId);
      console.log(`\n${moduleName} (${moduleId}):`);
      console.log(`  覆盖状态: ${detail.coverage_status}`);
      console.log(`  完整评分: ${detail.score}/100`);
      console.log(`  实际路径: ${detail.actual_path || '未找到'}`);

      if (detail.missing_features.length > 0) {
        console.log(`  缺失功能: ${detail.missing_features.join(', ')}`);
      }
    });
  }
}

// 执行审计
async function main() {
  try {
    const auditor = new ManagementAudit();
    await auditor.runAudit();

    // 设置退出码
    const exitCode = auditor.results.coverage_rate >= 80 ? 0 : 1;
    process.exit(exitCode);
  } catch (error) {
    console.error('审计执行失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = ManagementAudit;
