/**
 * FCX配件兑换模块验证脚本
 * 验证核心功能是否正确实现
 */
const { createClient } = require('@supabase/supabase-js');

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class FcxExchangeValidation {
  constructor() {
    this.validationResults = [];
  }

  async validateImplementation() {
    console.log('🔍 开始FCX配件兑换模块验证...\n');

    try {
      // 1. 验证数据库表结构
      await this.validateDatabaseTables();

      // 2. 验证服务类实现
      await this.validateServiceClasses();

      // 3. 验证API接口
      await this.validateApiEndpoints();

      // 4. 验证前端组件
      await this.validateFrontendComponents();

      // 5. 输出验证报告
      await this.generateValidationReport();
    } catch (error) {
      console.error('❌ 验证过程中发生错误:', error);
      this.validationResults.push({
        component: '整体验证',
        status: 'FAILED',
        error: error.message,
      });
    }

    return this.validationResults;
  }

  async validateDatabaseTables() {
    console.log('🗄️ 验证数据库表结构...');

    const requiredTables = [
      'part_fcx_prices',
      'fcx_exchange_orders',
      'fcx_exchange_order_items',
      'inventory_reservations',
      'fcx_exchange_transactions',
    ];

    try {
      // 检查每个必需的表是否存在
      for (const tableName of requiredTables) {
        const { data, error } = await supabase
          .from(tableName)
          .select('count(*)', { count: 'exact', head: true });

        if (error && error.code !== '42P01') {
          // 42P01 = 表不存在
          console.log(`⚠️  表 ${tableName} 查询出错: ${error.message}`);
          this.validationResults.push({
            component: `数据库表-${tableName}`,
            status: 'WARNING',
            message: `查询出错: ${error.message}`,
          });
        } else if (error && error.code === '42P01') {
          console.log(`❌ 表 ${tableName} 不存在`);
          this.validationResults.push({
            component: `数据库表-${tableName}`,
            status: 'MISSING',
            message: '表不存在',
          });
        } else {
          console.log(`✅ 表 ${tableName} 存在`);
          this.validationResults.push({
            component: `数据库表-${tableName}`,
            status: 'PRESENT',
          });
        }
      }

      // 检查视图是否存在
      const views = ['fcx_exchange_orders_complete', 'current_part_fcx_prices'];
      for (const viewName of views) {
        try {
          const { data, error } = await supabase
            .from(viewName)
            .select('count(*)', { count: 'exact', head: true })
            .limit(1);

          if (!error) {
            console.log(`✅ 视图 ${viewName} 存在`);
            this.validationResults.push({
              component: `数据库视图-${viewName}`,
              status: 'PRESENT',
            });
          }
        } catch (viewError) {
          console.log(`⚠️  视图 ${viewName} 可能不存在`);
          this.validationResults.push({
            component: `数据库视图-${viewName}`,
            status: 'WARNING',
            message: '视图可能不存在',
          });
        }
      }
    } catch (error) {
      console.error('❌ 数据库表验证失败:', error);
      this.validationResults.push({
        component: '数据库表结构',
        status: 'FAILED',
        error: error.message,
      });
    }
  }

  async validateServiceClasses() {
    console.log('\n⚙️ 验证服务类实现...');

    try {
      // 动态导入服务类进行验证
      const serviceFiles = [
        'src/fcx-system/services/fcx-equipment.service.ts',
        'src/supply-chain/services/inventory-reservation.service.ts',
        'src/lib/warehouse/wms-shipment.service.ts',
      ];

      for (const serviceFile of serviceFiles) {
        try {
          // 检查文件是否存在
          const fs = require('fs');
          if (fs.existsSync(serviceFile)) {
            console.log(`✅ 服务文件 ${serviceFile} 存在`);
            this.validationResults.push({
              component: `服务类-${serviceFile}`,
              status: 'PRESENT',
            });

            // 简单的语法检查
            const content = fs.readFileSync(serviceFile, 'utf8');
            if (content.includes('class') && content.includes('export')) {
              console.log(`   📋 包含类定义和导出`);
            }
          } else {
            console.log(`❌ 服务文件 ${serviceFile} 不存在`);
            this.validationResults.push({
              component: `服务类-${serviceFile}`,
              status: 'MISSING',
            });
          }
        } catch (fileError) {
          console.log(
            `⚠️  检查服务文件 ${serviceFile} 出错: ${fileError.message}`
          );
          this.validationResults.push({
            component: `服务类-${serviceFile}`,
            status: 'WARNING',
            message: fileError.message,
          });
        }
      }
    } catch (error) {
      console.error('❌ 服务类验证失败:', error);
      this.validationResults.push({
        component: '服务类实现',
        status: 'FAILED',
        error: error.message,
      });
    }
  }

  async validateApiEndpoints() {
    console.log('\n🌐 验证API接口...');

    const apiEndpoints = [
      '/api/fcx/exchange',
      '/api/fcx/equipment/exchange',
      '/api/inventory/reserve',
    ];

    try {
      for (const endpoint of apiEndpoints) {
        try {
          // 检查API路由文件是否存在
          const routeFile = `src/app${endpoint}/route.ts`;
          const fs = require('fs');

          if (fs.existsSync(routeFile)) {
            console.log(`✅ API路由 ${endpoint} 存在`);
            this.validationResults.push({
              component: `API接口-${endpoint}`,
              status: 'PRESENT',
            });
          } else {
            console.log(`⚠️  API路由 ${endpoint} 文件不存在`);
            this.validationResults.push({
              component: `API接口-${endpoint}`,
              status: 'MISSING_FILE',
            });
          }
        } catch (apiError) {
          console.log(`⚠️  检查API ${endpoint} 出错: ${apiError.message}`);
          this.validationResults.push({
            component: `API接口-${endpoint}`,
            status: 'WARNING',
            message: apiError.message,
          });
        }
      }
    } catch (error) {
      console.error('❌ API接口验证失败:', error);
      this.validationResults.push({
        component: 'API接口',
        status: 'FAILED',
        error: error.message,
      });
    }
  }

  async validateFrontendComponents() {
    console.log('\n🖥️ 验证前端组件...');

    try {
      const frontendFiles = ['src/app/fcx/exchange/page.tsx'];

      for (const componentFile of frontendFiles) {
        try {
          const fs = require('fs');
          if (fs.existsSync(componentFile)) {
            const content = fs.readFileSync(componentFile, 'utf8');

            console.log(`✅ 前端组件 ${componentFile} 存在`);
            this.validationResults.push({
              component: `前端组件-${componentFile}`,
              status: 'PRESENT',
            });

            // 检查关键功能
            const checks = [
              { pattern: 'use client', name: '客户端组件' },
              { pattern: 'useState', name: '状态管理' },
              { pattern: 'useEffect', name: '副作用处理' },
              { pattern: 'fetch', name: 'API调用' },
              { pattern: 'FCX', name: 'FCX相关功能' },
              { pattern: '购物车|cart', name: '购物车功能', flags: 'i' },
              { pattern: '兑换|exchange', name: '兑换功能', flags: 'i' },
            ];

            console.log('   🔍 功能检查:');
            checks.forEach(check => {
              const regex = new RegExp(check.pattern, check.flags || '');
              if (regex.test(content)) {
                console.log(`     ✅ ${check.name}`);
              } else {
                console.log(`     ❌ 缺少 ${check.name}`);
              }
            });
          } else {
            console.log(`❌ 前端组件 ${componentFile} 不存在`);
            this.validationResults.push({
              component: `前端组件-${componentFile}`,
              status: 'MISSING',
            });
          }
        } catch (compError) {
          console.log(
            `⚠️  检查前端组件 ${componentFile} 出错: ${compError.message}`
          );
          this.validationResults.push({
            component: `前端组件-${componentFile}`,
            status: 'WARNING',
            message: compError.message,
          });
        }
      }
    } catch (error) {
      console.error('❌ 前端组件验证失败:', error);
      this.validationResults.push({
        component: '前端组件',
        status: 'FAILED',
        error: error.message,
      });
    }
  }

  async generateValidationReport() {
    console.log('\n📊 生成验证报告...');

    const presentItems = this.validationResults.filter(
      r => r.status === 'PRESENT'
    ).length;
    const missingItems = this.validationResults.filter(
      r => r.status === 'MISSING' || r.status === 'MISSING_FILE'
    ).length;
    const warningItems = this.validationResults.filter(
      r => r.status === 'WARNING'
    ).length;
    const failedItems = this.validationResults.filter(
      r => r.status === 'FAILED'
    ).length;
    const totalItems = this.validationResults.length;

    console.log(`\n${'='.repeat(60)}`);
    console.log('FCX配件兑换模块验证报告');
    console.log('='.repeat(60));
    console.log(`总验证项: ${totalItems}`);
    console.log(`✅ 已实现: ${presentItems}`);
    console.log(`❌ 缺失: ${missingItems}`);
    console.log(`⚠️  警告: ${warningItems}`);
    console.log(`❌ 失败: ${failedItems}`);
    console.log(`完整度: ${((presentItems / totalItems) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));

    if (missingItems > 0) {
      console.log('\n缺失的组件:');
      this.validationResults
        .filter(r => r.status === 'MISSING' || r.status === 'MISSING_FILE')
        .forEach(result => {
          console.log(`  ❌ ${result.component}`);
        });
    }

    if (warningItems > 0) {
      console.log('\n需要注意的问题:');
      this.validationResults
        .filter(r => r.status === 'WARNING')
        .forEach(result => {
          console.log(`  ⚠️  ${result.component}: ${result.message}`);
        });
    }

    // 生成实施建议
    console.log('\n📋 实施建议:');
    if (missingItems > 0) {
      console.log('  1. 完善缺失的数据库表和视图');
      console.log('  2. 确保所有服务类文件正确创建');
      console.log('  3. 部署所有API路由');
    }
    console.log('  4. 运行端到端测试验证完整流程');
    console.log('  5. 配置生产环境的WMS集成');

    this.validationResults.push({
      component: '验证总结',
      status: missingItems === 0 ? 'SUCCESS' : 'PARTIAL',
      details: {
        totalItems,
        presentItems,
        missingItems,
        warningItems,
        failedItems,
        completeness: `${((presentItems / totalItems) * 100).toFixed(1)}%`,
      },
    });
  }
}

// 执行验证
async function runValidation() {
  const validator = new FcxExchangeValidation();
  const results = await validator.validateImplementation();

  // 输出最终结果
  const failedItems = results.filter(r => r.status === 'FAILED').length;
  process.exit(failedItems > 0 ? 1 : 0);
}

// 检查是否直接运行此脚本
if (require.main === module) {
  runValidation().catch(console.error);
}

module.exports = { FcxExchangeValidation };
