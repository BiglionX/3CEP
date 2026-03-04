/**
 * 数据库权限验证工具
 * 用于验证和测试RLS策略及权限控制
 */

const { createClient } = require('@supabase/supabase-js');

// 配置
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * 数据库权限验证套件
 */
class DatabasePermissionValidator {
  constructor() {
    this.results = [];
  }

  /**
   * 记录测试结果
   */
  logResult(testName, status, message, details = null) {
    const result = {
      test: testName,
      status: status, // 'PASS', 'FAIL', 'WARN'
      message: message,
      details: details,
      timestamp: new Date().toISOString(),
    };

    this.results.push(result);
    console.log(`[${status}] ${testName}: ${message}`);

    if (details) {
      console.log('  Details:', JSON.stringify(details, null, 2));
    }
  }

  /**
   * 验证RLS策略是否启用
   */
  async validateRLSEnabled() {
    try {
      const { data, error } = await supabase.rpc('validate_rls_enabled');

      if (error) {
        this.logResult('RLS策略检查', 'FAIL', '无法检查RLS状态', error);
        return false;
      }

      const enabledTables = data?.enabled_tables || [];
      const disabledTables = data?.disabled_tables || [];

      if (disabledTables.length > 0) {
        this.logResult(
          'RLS策略检查',
          'WARN',
          `发现${disabledTables.length}个表未启用RLS`,
          { disabled_tables: disabledTables }
        );
      } else {
        this.logResult('RLS策略检查', 'PASS', '所有表均已启用RLS');
      }

      return true;
    } catch (error) {
      this.logResult('RLS策略检查', 'FAIL', '检查过程异常', error.message);
      return false;
    }
  }

  /**
   * 验证租户隔离策略
   */
  async validateTenantIsolation() {
    try {
      // 检查租户表是否存在
      const { data: tenantTable, error: tenantError } = await supabase
        .from('tenants')
        .select('count()', { count: 'exact', head: true });

      if (tenantError) {
        this.logResult(
          '租户隔离检查',
          'FAIL',
          '租户表不存在或无法访问',
          tenantError
        );
        return false;
      }

      // 检查用户租户关联表
      const { data: userTenantTable, error: userTenantError } = await supabase
        .from('user_tenants')
        .select('count()', { count: 'exact', head: true });

      if (userTenantError) {
        this.logResult(
          '租户隔离检查',
          'FAIL',
          '用户租户关联表不存在或无法访问',
          userTenantError
        );
        return false;
      }

      // 检查关键业务表是否包含租户字段
      const tablesWithTenant = ['parts', 'uploaded_content', 'appointments'];
      const missingTenantFields = [];

      for (const tableName of tablesWithTenant) {
        try {
          const { data: columns, error } = await supabase
            .from('information_schema.columns')
            .select('column_name')
            .eq('table_name', tableName)
            .eq('column_name', 'tenant_id');

          if (error || !columns || columns.length === 0) {
            missingTenantFields.push(tableName);
          }
        } catch (e) {
          missingTenantFields.push(tableName);
        }
      }

      if (missingTenantFields.length > 0) {
        this.logResult(
          '租户隔离检查',
          'WARN',
          `发现${missingTenantFields.length}个表缺少tenant_id字段`,
          { tables: missingTenantFields }
        );
      } else {
        this.logResult('租户隔离检查', 'PASS', '租户隔离基础设施完整');
      }

      return true;
    } catch (error) {
      this.logResult('租户隔离检查', 'FAIL', '检查过程异常', error.message);
      return false;
    }
  }

  /**
   * 验证安全视图
   */
  async validateSecurityViews() {
    const securityViews = ['tenant_safe_parts', 'user_safe_content'];

    for (const viewName of securityViews) {
      try {
        const { data, error } = await supabase
          .from(viewName)
          .select('count()', { count: 'exact', head: true });

        if (error) {
          this.logResult(`安全视图-${viewName}`, 'FAIL', `视图访问失败`, error);
        } else {
          this.logResult(`安全视图-${viewName}`, 'PASS', '视图访问正常');
        }
      } catch (error) {
        this.logResult(
          `安全视图-${viewName}`,
          'FAIL',
          `视图检查异常`,
          error.message
        );
      }
    }
  }

  /**
   * 验证权限函数
   */
  async validatePermissionFunctions() {
    const functions = ['check_user_permission', 'check_tenant_access'];

    for (const functionName of functions) {
      try {
        // 测试函数是否存在和可调用
        const { data, error } = await supabase.rpc(functionName, {
          user_id: '00000000-0000-0000-0000-000000000000', // 测试UUID
          permission_name: 'test_permission',
          tenant_id: null,
        });

        if (error && error.code !== 'P0001') {
          // P0001是预期的测试错误
          this.logResult(
            `权限函数-${functionName}`,
            'FAIL',
            `函数调用失败`,
            error
          );
        } else {
          this.logResult(`权限函数-${functionName}`, 'PASS', '函数可用');
        }
      } catch (error) {
        this.logResult(
          `权限函数-${functionName}`,
          'FAIL',
          `函数检查异常`,
          error.message
        );
      }
    }
  }

  /**
   * 执行完整的权限验证套件
   */
  async runFullValidation() {
    console.log('🚀 开始数据库权限验证...');
    console.log('='.repeat(50));

    await this.validateRLSEnabled();
    await this.validateTenantIsolation();
    await this.validateSecurityViews();
    await this.validatePermissionFunctions();

    console.log('='.repeat(50));
    console.log('📊 验证结果汇总:');

    const summary = {
      pass: this.results.filter(r => r.status === 'PASS').length,
      fail: this.results.filter(r => r.status === 'FAIL').length,
      warn: this.results.filter(r => r.status === 'WARN').length,
    };

    console.log(`✅ 通过: ${summary.pass}`);
    console.log(`❌ 失败: ${summary.fail}`);
    console.log(`⚠️  警告: ${summary.warn}`);

    if (summary.fail > 0) {
      console.log('\n❌ 发现严重问题，请检查上述错误!');
      process.exit(1);
    } else if (summary.warn > 0) {
      console.log('\n⚠️  存在警告，建议优化配置');
      process.exit(0);
    } else {
      console.log('\n✅ 所有权限检查通过!');
      process.exit(0);
    }
  }

  /**
   * 生成验证报告
   */
  generateReport() {
    return {
      timestamp: new Date().toISOString(),
      summary: {
        total_tests: this.results.length,
        passed: this.results.filter(r => r.status === 'PASS').length,
        failed: this.results.filter(r => r.status === 'FAIL').length,
        warnings: this.results.filter(r => r.status === 'WARN').length,
      },
      details: this.results,
    };
  }
}

/**
 * 创建RLS验证存储过程
 */
async function createValidationProcedures() {
  const procedures = `
    -- 验证RLS启用状态的函数
    create or replace function validate_rls_enabled()
    returns json
    language plpgsql
    security definer
    as $$
    declare
      enabled_tables text[];
      disabled_tables text[];
      table_record record;
    begin
      enabled_tables := array[]::text[];
      disabled_tables := array[]::text[];
      
      for table_record in 
        select tablename 
        from pg_tables 
        where schemaname = 'public'
        and tablename not in ('migrations', 'migrations_lock')
      loop
        if exists (
          select 1 from pg_class c 
          where c.relname = table_record.tablename 
          and c.relrowsecurity = true
        ) then
          enabled_tables := array_append(enabled_tables, table_record.tablename);
        else
          disabled_tables := array_append(disabled_tables, table_record.tablename);
        end if;
      end loop;
      
      return json_build_object(
        'enabled_tables', enabled_tables,
        'disabled_tables', disabled_tables
      );
    end;
    $$;
  `;

  try {
    const { error } = await supabase.rpc('execute_sql', { sql: procedures });
    if (error) {
      console.log('⚠️  存储过程创建可能需要手动执行');
    } else {
      console.log('✅ 验证存储过程创建成功');
    }
  } catch (error) {
    console.log('ℹ️  存储过程创建跳过');
  }
}

// 主执行函数
async function main() {
  try {
    // 创建验证存储过程
    await createValidationProcedures();

    // 执行验证
    const validator = new DatabasePermissionValidator();
    await validator.runFullValidation();

    // 输出详细报告
    const report = validator.generateReport();
    console.log('\n📋 详细报告:');
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    console.error('❌ 验证过程发生错误:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  DatabasePermissionValidator,
  runDatabasePermissionValidation: main,
};
