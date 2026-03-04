#!/usr/bin/env node

/**
 * 简化版管理模块审计脚本
 * 直接基于已知的模块列表进行审计
 */

const fs = require('fs');
const path = require('path');

// 配置常量
const PROJECT_ROOT = path.join(__dirname, '..');
const ADMIN_DIR = path.join(PROJECT_ROOT, 'src', 'app', 'admin');

// 已知的模块列表（基于module-registry.ts）
const ALL_MODULES = [
  // 业务模块
  {
    id: 'repair_service',
    name: '维修服务',
    category: 'business',
    expectedPath: '/admin/repair-service',
  },
  {
    id: 'parts_market',
    name: '配件商城',
    category: 'business',
    expectedPath: '/admin/parts-market',
  },
  {
    id: 'device_management',
    name: '设备管理',
    category: 'business',
    expectedPath: '/admin/devices',
  },
  {
    id: 'crowdfunding',
    name: '众筹平台',
    category: 'business',
    expectedPath: '/admin/crowdfunding',
  },
  {
    id: 'fcx_alliance',
    name: 'FCX联盟',
    category: 'business',
    expectedPath: '/admin/fcx',
  },
  {
    id: 'valuation_service',
    name: '估价服务',
    category: 'business',
    expectedPath: '/admin/valuation',
  },

  // 管理模块
  {
    id: 'system_dashboard',
    name: '系统概览',
    category: 'management',
    expectedPath: '/admin/dashboard',
  },
  {
    id: 'user_management',
    name: '用户管理',
    category: 'management',
    expectedPath: '/admin/users',
  },
  {
    id: 'content_management',
    name: '内容管理',
    category: 'management',
    expectedPath: '/admin/content',
  },
  {
    id: 'shop_management',
    name: '店铺管理',
    category: 'management',
    expectedPath: '/admin/shops',
  },
  {
    id: 'financial_management',
    name: '财务管理',
    category: 'management',
    expectedPath: '/admin/finance',
  },
  {
    id: 'procurement_center',
    name: '采购中心',
    category: 'management',
    expectedPath: '/admin/procurement',
  },
  {
    id: 'warehouse_management',
    name: '仓储管理',
    category: 'management',
    expectedPath: '/admin/warehouse',
  },
  {
    id: 'agent_workflows',
    name: '智能体工作流',
    category: 'management',
    expectedPath: '/admin/agents',
  },
  {
    id: 'n8n_integration',
    name: 'n8n集成',
    category: 'management',
    expectedPath: '/admin/n8n',
  },

  // 系统模块
  {
    id: 'system_audit',
    name: '系统审计',
    category: 'system',
    expectedPath: '/admin/audit',
  },
  {
    id: 'system_monitoring',
    name: '系统监控',
    category: 'system',
    expectedPath: '/admin/monitoring',
  },
  {
    id: 'system_settings',
    name: '系统设置',
    category: 'system',
    expectedPath: '/admin/settings',
  },
];

class SimpleManagementAudit {
  constructor() {
    this.results = {
      total_modules: ALL_MODULES.length,
      covered_modules: 0,
      missing_modules: [],
      partial_modules: [],
      coverage_rate: 0,
      average_score: 0,
    };
    this.module_details = {};
  }

  /**
   * 执行审计
   */
  async runAudit() {
    console.log('🔍 开始管理功能完整性审计...\n');
    console.log(`📋 审计模块总数: ${this.results.total_modules} 个\n`);

    // 检查管理目录结构
    this.checkAdminStructure();

    // 评估各模块
    await this.evaluateAllModules();

    // 生成报告
    this.generateReport();
    this.outputDetailedResults();

    return this.results;
  }

  /**
   * 检查管理目录结构
   */
  checkAdminStructure() {
    console.log('📁 检查管理后台目录结构...');

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
    console.log('');
  }

  /**
   * 评估所有模块
   */
  async evaluateAllModules() {
    console.log('📊 评估各模块功能覆盖情况...\n');

    for (const module of ALL_MODULES) {
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

    // 计算统计数据
    this.results.coverage_rate = Math.round(
      (this.results.covered_modules / this.results.total_modules) * 100
    );
    const totalScore = Object.values(this.module_details).reduce(
      (sum, detail) => sum + detail.score,
      0
    );
    this.results.average_score = Math.round(
      totalScore / this.results.total_modules
    );
  }

  /**
   * 评估单个模块
   */
  async evaluateSingleModule(module) {
    const actualPath = this.findActualAdminPath(module.id);

    // 基础检查
    const hasDirectory = !!actualPath;
    const hasPageFile = hasDirectory && this.checkPageFile(actualPath);
    const hasApiRoutes = hasDirectory && this.checkApiRoutes(actualPath);

    // 评分计算
    let score = 0;
    const details = {
      has_directory: hasDirectory,
      has_page: hasPageFile,
      has_api: hasApiRoutes,
      expected_path: module.expectedPath,
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
      missing_features: this.identifyMissingFeatures(details),
    };
  }

  /**
   * 查找实际管理路径
   */
  findActualAdminPath(moduleId) {
    const pathMappings = {
      repair_service: ['repair-service', 'repair'],
      parts_market: ['parts-market', 'parts'],
      device_management: ['devices', 'device'],
      crowdfunding: ['crowdfunding'],
      fcx_alliance: ['fcx'],
      valuation_service: ['valuation'],
      system_dashboard: ['dashboard'],
      user_management: ['users', 'user'],
      content_management: ['content'],
      shop_management: ['shops', 'shop'],
      financial_management: ['finance'],
      procurement_center: ['procurement'],
      warehouse_management: ['warehouse'],
      agent_workflows: ['agents', 'agent'],
      n8n_integration: ['n8n'],
      system_audit: ['audit-logs', 'audit'],
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
   * 检查页面文件
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
   * 检查API路由
   */
  checkApiRoutes(adminPath) {
    if (!adminPath) return false;

    // 检查同级api目录
    const apiDir = path.join(path.dirname(adminPath), 'api');
    return fs.existsSync(apiDir);
  }

  /**
   * 检查高级功能
   */
  checkAdvancedFeatures(adminPath) {
    if (!adminPath) return false;
    // 简单检查：目录下文件数量
    try {
      const files = fs.readdirSync(adminPath);
      return files.length > 2; // 除了page.tsx还有其他文件
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
      const pagePath = path.join(adminPath, 'page.tsx');
      if (!fs.existsSync(pagePath)) return false;

      const content = fs.readFileSync(pagePath, 'utf8');
      return (
        content.includes('useRBAC') ||
        content.includes('permission') ||
        content.includes('auth') ||
        content.includes('Protected')
      );
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
      const pagePath = path.join(adminPath, 'page.tsx');
      if (!fs.existsSync(pagePath)) return false;

      const content = fs.readFileSync(pagePath, 'utf8');
      const uxIndicators = [
        'useState',
        'useEffect',
        'loading',
        'error',
        'Card',
        'Table',
      ];
      return uxIndicators.some(indicator => content.includes(indicator));
    } catch {
      return false;
    }
  }

  /**
   * 识别缺失功能
   */
  identifyMissingFeatures(details) {
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
   * 生成报告
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
${
  this.results.missing_modules
    .map(id => {
      const module = ALL_MODULES.find(m => m.id === id);
      return `   • ${module?.name || id} (${id})`;
    })
    .join('\n') || '   无'
}

⚠️ 部分覆盖模块:
${
  this.results.partial_modules
    .map(id => {
      const module = ALL_MODULES.find(m => m.id === id);
      return `   • ${module?.name || id} (${id})`;
    })
    .join('\n') || '   无'
}

============================================================
`;

    // 保存报告
    const reportsDir = path.join(PROJECT_ROOT, 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.join(reportsDir, 'management-audit-report.txt');
    fs.writeFileSync(reportPath, report, 'utf8');
    console.log(`\n📄 审计报告已保存到: ${reportPath}`);
  }

  /**
   * 输出详细结果
   */
  outputDetailedResults() {
    console.log('\n📋 详细评估结果:');
    console.log('='.repeat(60));

    ALL_MODULES.forEach(module => {
      const detail = this.module_details[module.id];
      if (detail) {
        console.log(`\n${module.name} (${module.id}):`);
        console.log(`  覆盖状态: ${detail.coverage_status}`);
        console.log(`  完整评分: ${detail.score}/100`);
        console.log(`  实际路径: ${detail.actual_path || '未找到'}`);

        if (detail.missing_features.length > 0) {
          console.log(`  缺失功能: ${detail.missing_features.join(', ')}`);
        }
      }
    });
  }
}

// 执行审计
async function main() {
  try {
    const auditor = new SimpleManagementAudit();
    await auditor.runAudit();

    // 根据覆盖率决定退出码
    const exitCode = auditor.results.coverage_rate >= 80 ? 0 : 1;
    console.log(`\n🏁 审计完成! 覆盖率: ${auditor.results.coverage_rate}%`);
    process.exit(exitCode);
  } catch (error) {
    console.error('审计执行失败:', error);
    process.exit(1);
  }
}

// 直接运行
if (require.main === module) {
  main();
}

module.exports = SimpleManagementAudit;
