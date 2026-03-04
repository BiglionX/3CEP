#!/usr/bin/env node

/**
 * 统一认证组件自动化迁移工具
 * 用于批量迁移现有登录页面到统一认证组件
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 统一认证组件自动化迁移工具');
console.log('=====================================\n');

// 迁移配置
const migrationConfig = {
  // 需要迁移的页面列表
  pagesToMigrate: [
    {
      path: 'src/app/admin/login/page.tsx',
      type: 'admin',
      priority: 'high',
      backup: true,
    },
    {
      path: 'src/app/brand/login/page.tsx',
      type: 'brand',
      priority: 'medium',
      backup: true,
    },
    {
      path: 'src/app/repair-shop/login/page.tsx',
      type: 'repair',
      priority: 'medium',
      backup: true,
    },
    {
      path: 'src/app/importer/login/page.tsx',
      type: 'trade',
      priority: 'medium',
      backup: true,
    },
    {
      path: 'src/app/exporter/login/page.tsx',
      type: 'trade',
      priority: 'medium',
      backup: true,
    },
    {
      path: 'src/modules/auth/app/page.tsx',
      type: 'default',
      priority: 'low',
      backup: false,
    },
    {
      path: 'src/modules/admin-panel/app/login/page.tsx',
      type: 'admin',
      priority: 'medium',
      backup: true,
    },
  ],

  // 主题配置映射
  themeMapping: {
    admin: {
      theme: 'admin',
      title: '管理后台登录',
      subtitle: '请输入您的管理员凭证',
      primaryColor: '#3b82f6',
      backgroundColor: 'from-blue-50 to-indigo-100',
    },
    brand: {
      theme: 'brand',
      title: '品牌商平台',
      subtitle: '专业的电子产品回收解决方案',
      primaryColor: '#0ea5e9',
      backgroundColor: 'from-cyan-50 to-sky-100',
    },
    repair: {
      theme: 'repair',
      title: '维修师平台',
      subtitle: '一站式设备维修服务管理',
      primaryColor: '#10b981',
      backgroundColor: 'from-emerald-50 to-green-100',
    },
    trade: {
      theme: 'trade',
      title: '贸易平台',
      subtitle: '高效的进出口业务管理系统',
      primaryColor: '#8b5cf6',
      backgroundColor: 'from-purple-50 to-violet-100',
    },
    default: {
      theme: 'default',
      title: '欢迎登录',
      subtitle: '请输入您的账户信息',
      primaryColor: '#6366f1',
      backgroundColor: 'from-indigo-50 to-purple-100',
    },
  },
};

// 工具函数
const utils = {
  // 创建备份文件
  createBackup: filePath => {
    const backupPath = `${filePath}.backup.${Date.now()}`;
    try {
      fs.copyFileSync(filePath, backupPath);
      console.log(`✅ 已创建备份: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.log(`❌ 备份失败: ${error.message}`);
      return null;
    }
  },

  // 读取文件内容
  readFile: filePath => {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      console.log(`❌ 读取文件失败: ${error.message}`);
      return null;
    }
  },

  // 写入文件内容
  writeFile: (filePath, content) => {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 已更新文件: ${filePath}`);
      return true;
    } catch (error) {
      console.log(`❌ 写入文件失败: ${error.message}`);
      return false;
    }
  },

  // 检查文件是否存在
  fileExists: filePath => {
    return fs.existsSync(filePath);
  },

  // 获取相对路径
  getRelativePath: absolutePath => {
    return path.relative(process.cwd(), absolutePath);
  },
};

// 迁移处理器
class MigrationProcessor {
  constructor(config) {
    this.config = config;
    this.results = {
      total: config.pagesToMigrate.length,
      success: 0,
      failed: 0,
      skipped: 0,
      details: [],
    };
  }

  // 生成新的登录页面内容
  generateNewLoginPage(pageConfig, themeConfig) {
    const imports = `'use client'

import { UnifiedLogin } from '@/components/auth/UnifiedLogin'
import { useSearchParams, useRouter } from 'next/navigation'
`;

    const component = `export default function LoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const redirect = searchParams.get('redirect') || '${this.getDefaultRedirect(pageConfig.type)}'

  const handleLoginSuccess = (user: any) => {
    // 登录成功处理逻辑
    console.log('登录成功:', user)
    
    if (redirect?.startsWith('/admin') && !user?.is_admin) {
      router.push('/unauthorized')
      return
    }
    
    router.push(redirect)
  }

  return (
    <UnifiedLogin 
      isOpen={true}
      onClose={() => router.push('/')}
      onLoginSuccess={handleLoginSuccess}
      redirectUrl={redirect}
      mode="page"
      theme="${themeConfig.theme}"
    />
  )
}`;

    return `${imports}\n${component}`;
  }

  // 获取默认重定向路径
  getDefaultRedirect(type) {
    const redirects = {
      admin: '/admin/dashboard',
      brand: '/brand/dashboard',
      repair: '/repair-shop/dashboard',
      trade: '/dashboard',
      default: '/',
    };
    return redirects[type] || '/';
  }

  // 迁移单个页面
  async migratePage(pageConfig) {
    const fullPath = path.join(process.cwd(), pageConfig.path);
    const relativePath = utils.getRelativePath(fullPath);

    console.log(`\n📝 处理页面: ${relativePath}`);
    console.log(`   类型: ${pageConfig.type} (${pageConfig.priority} 优先级)`);

    // 检查文件是否存在
    if (!utils.fileExists(fullPath)) {
      console.log(`⚠️  文件不存在，跳过迁移`);
      this.results.skipped++;
      this.results.details.push({
        page: relativePath,
        status: 'skipped',
        reason: 'file_not_found',
      });
      return;
    }

    // 创建备份
    let backupPath = null;
    if (pageConfig.backup) {
      backupPath = utils.createBackup(fullPath);
      if (!backupPath) {
        console.log(`❌ 备份失败，跳过迁移`);
        this.results.failed++;
        this.results.details.push({
          page: relativePath,
          status: 'failed',
          reason: 'backup_failed',
        });
        return;
      }
    }

    try {
      // 获取主题配置
      const themeConfig = this.config.themeMapping[pageConfig.type];

      // 生成新内容
      const newContent = this.generateNewLoginPage(pageConfig, themeConfig);

      // 写入新文件
      if (utils.writeFile(fullPath, newContent)) {
        console.log(`✅ 迁移成功`);
        this.results.success++;
        this.results.details.push({
          page: relativePath,
          status: 'success',
          backup: backupPath,
          theme: themeConfig.theme,
        });
      } else {
        throw new Error('写入文件失败');
      }
    } catch (error) {
      console.log(`❌ 迁移失败: ${error.message}`);
      this.results.failed++;
      this.results.details.push({
        page: relativePath,
        status: 'failed',
        reason: error.message,
        backup: backupPath,
      });

      // 如果有备份，尝试恢复
      if (backupPath && utils.fileExists(backupPath)) {
        try {
          fs.copyFileSync(backupPath, fullPath);
          console.log(`🔄 已恢复原始文件`);
        } catch (restoreError) {
          console.log(`❌ 恢复失败: ${restoreError.message}`);
        }
      }
    }
  }

  // 执行完整迁移
  async executeMigration() {
    console.log('开始执行迁移...\n');

    // 按优先级排序
    const sortedPages = [...this.config.pagesToMigrate].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // 逐个迁移页面
    for (const pageConfig of sortedPages) {
      await this.migratePage(pageConfig);
    }

    // 输出结果摘要
    this.printSummary();
  }

  // 打印迁移结果摘要
  printSummary() {
    console.log(`\n${'='.repeat(50)}`);
    console.log('📊 迁移结果摘要');
    console.log('='.repeat(50));
    console.log(`总计页面: ${this.results.total}`);
    console.log(`✅ 成功: ${this.results.success}`);
    console.log(`❌ 失败: ${this.results.failed}`);
    console.log(`⚠️  跳过: ${this.results.skipped}`);
    console.log(
      `成功率: ${((this.results.success / this.results.total) * 100).toFixed(1)}%`
    );

    if (this.results.details.length > 0) {
      console.log('\n📋 详细结果:');
      this.results.details.forEach((detail, index) => {
        const statusIcon =
          {
            success: '✅',
            failed: '❌',
            skipped: '⚠️',
          }[detail.status] || '❓';

        console.log(`${index + 1}. ${statusIcon} ${detail.page}`);
        if (detail.reason) {
          console.log(`   原因: ${detail.reason}`);
        }
        if (detail.backup) {
          console.log(`   备份: ${utils.getRelativePath(detail.backup)}`);
        }
      });
    }

    // 生成报告文件
    this.generateReport();
  }

  // 生成详细报告
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      config: this.config,
      results: this.results,
      summary: {
        total: this.results.total,
        success: this.results.success,
        failed: this.results.failed,
        skipped: this.results.skipped,
        successRate: `${((this.results.success / this.results.total) * 100).toFixed(2)}%`,
      },
    };

    const reportPath = path.join(process.cwd(), 'migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 详细报告已保存至: ${utils.getRelativePath(reportPath)}`);
  }
}

// 验证工具
class MigrationValidator {
  constructor() {
    this.validationResults = [];
  }

  // 验证迁移后的页面
  async validateMigration() {
    console.log('\n🔍 开始验证迁移结果...\n');

    const validationTests = [
      {
        name: '文件存在性检查',
        test: () => this.checkFileExistence(),
      },
      {
        name: '组件导入检查',
        test: () => this.checkComponentImports(),
      },
      {
        name: '语法正确性检查',
        test: () => this.checkSyntax(),
      },
      {
        name: '功能完整性检查',
        test: () => this.checkFunctionality(),
      },
    ];

    for (const { name, test } of validationTests) {
      console.log(`🧪 ${name}`);
      try {
        const result = await test();
        this.validationResults.push({
          test: name,
          passed: result.passed,
          details: result.details,
        });

        const status = result.passed ? '✅ 通过' : '❌ 失败';
        console.log(`   ${status} (${result.details.length} 项检查)`);
      } catch (error) {
        console.log(`   ❌ 执行失败: ${error.message}`);
        this.validationResults.push({
          test: name,
          passed: false,
          details: [`执行错误: ${error.message}`],
        });
      }
      console.log('');
    }

    this.printValidationSummary();
  }

  checkFileExistence() {
    const results = [];
    const pages = migrationConfig.pagesToMigrate;

    for (const page of pages) {
      const fullPath = path.join(process.cwd(), page.path);
      const exists = utils.fileExists(fullPath);
      results.push({
        item: page.path,
        status: exists ? '存在' : '缺失',
        passed: exists,
      });
    }

    return {
      passed: results.every(r => r.passed),
      details: results,
    };
  }

  checkComponentImports() {
    const results = [];
    const pages = migrationConfig.pagesToMigrate;

    for (const page of pages) {
      const fullPath = path.join(process.cwd(), page.path);
      if (!utils.fileExists(fullPath)) continue;

      const content = utils.readFile(fullPath);
      const hasUnifiedLoginImport = content.includes('import { UnifiedLogin }');
      const hasRequiredHooks =
        content.includes('useSearchParams') && content.includes('useRouter');

      results.push({
        item: page.path,
        checks: {
          UnifiedLogin导入: hasUnifiedLoginImport,
          必要Hook导入: hasRequiredHooks,
        },
        passed: hasUnifiedLoginImport && hasRequiredHooks,
      });
    }

    return {
      passed: results.every(r => r.passed),
      details: results,
    };
  }

  checkSyntax() {
    const results = [];

    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      results.push({
        item: 'TypeScript编译',
        status: '通过',
        passed: true,
      });
    } catch (error) {
      results.push({
        item: 'TypeScript编译',
        status: '失败',
        details: error.stdout?.toString() || error.message,
        passed: false,
      });
    }

    return {
      passed: results.every(r => r.passed),
      details: results,
    };
  }

  checkFunctionality() {
    const results = [];

    // 检查统一组件是否存在
    const unifiedComponentPath = path.join(
      process.cwd(),
      'src/components/auth/UnifiedLogin.tsx'
    );
    const componentExists = utils.fileExists(unifiedComponentPath);

    results.push({
      item: '统一登录组件',
      status: componentExists ? '存在' : '缺失',
      passed: componentExists,
    });

    // 检查Hook是否存在
    const hookPath = path.join(process.cwd(), 'src/hooks/use-unified-auth.ts');
    const hookExists = utils.fileExists(hookPath);

    results.push({
      item: '统一认证Hook',
      status: hookExists ? '存在' : '缺失',
      passed: hookExists,
    });

    return {
      passed: results.every(r => r.passed),
      details: results,
    };
  }

  printValidationSummary() {
    console.log('🔍 验证结果摘要');
    console.log('='.repeat(30));

    const passedTests = this.validationResults.filter(r => r.passed).length;
    const totalTests = this.validationResults.length;

    console.log(`通过测试: ${passedTests}/${totalTests}`);

    this.validationResults.forEach((result, index) => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.test}`);

      if (!result.passed) {
        result.details.forEach(detail => {
          if (typeof detail === 'object' && detail.item) {
            console.log(`   - ${detail.item}: ${detail.status}`);
          } else {
            console.log(`   - ${detail}`);
          }
        });
      }
    });
  }
}

// 主执行函数
async function main() {
  try {
    // 创建迁移处理器
    const processor = new MigrationProcessor(migrationConfig);

    // 执行迁移
    await processor.executeMigration();

    // 执行验证
    const validator = new MigrationValidator();
    await validator.validateMigration();

    console.log('\n🎉 迁移和验证完成！');
    console.log('建议下一步:');
    console.log('1. 运行 npm run dev 启动开发服务器');
    console.log('2. 访问各个登录页面进行手动测试');
    console.log('3. 检查控制台是否有错误信息');
    console.log('4. 验证登录功能是否正常工作');
  } catch (error) {
    console.error('\n❌ 执行过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 执行主函数
if (require.main === module) {
  main();
}

module.exports = { MigrationProcessor, MigrationValidator, migrationConfig };
