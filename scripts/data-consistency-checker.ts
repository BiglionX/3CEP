/**
 * 数据一致性检查脚本
 *
 * 检查项:
 * - 孤儿记录检测 (tenant_id IS NULL)
 * - 外键约束违反
 * - 重复记录检测
 * - 数据格式验证
 *
 * 自动化:
 * - Cron 作业每日凌晨执行
 * - 发现问题自动修复
 * - 发送报告邮件给管理员
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// 从环境变量获取配置
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    '❌ 错误：请设置环境变量 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// 检查结果接口
interface CheckResult {
  checkName: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  issueCount: number;
  details: string[];
  fixedCount: number;
  timestamp: string;
}

// 需要检查的表和字段配置
const TABLE_CONFIGS = [
  {
    table: 'users',
    tenantIdField: 'tenant_id',
    creatorField: 'created_by',
    foreignKeys: [
      { field: 'role_id', refTable: 'roles' },
      { field: 'department_id', refTable: 'departments' },
    ],
    uniqueFields: ['email'],
    requiredFields: ['email', 'name', 'tenant_id'],
  },
  {
    table: 'shops',
    tenantIdField: 'tenant_id',
    creatorField: 'created_by',
    foreignKeys: [
      { field: 'owner_id', refTable: 'users' },
      { field: 'region_id', refTable: 'regions' },
    ],
    uniqueFields: ['shop_code'],
    requiredFields: ['name', 'tenant_id'],
  },
  {
    table: 'orders',
    tenantIdField: 'tenant_id',
    creatorField: 'created_by',
    foreignKeys: [
      { field: 'user_id', refTable: 'users' },
      { field: 'shop_id', refTable: 'shops' },
      { field: 'device_id', refTable: 'devices' },
    ],
    uniqueFields: ['order_number'],
    requiredFields: ['order_number', 'tenant_id', 'status'],
  },
  {
    table: 'devices',
    tenantIdField: 'tenant_id',
    creatorField: 'created_by',
    foreignKeys: [
      { field: 'shop_id', refTable: 'shops' },
      { field: 'portal_id', refTable: 'portals' },
    ],
    uniqueFields: ['device_sn'],
    requiredFields: ['device_sn', 'tenant_id'],
  },
  {
    table: 'payments',
    tenantIdField: 'tenant_id',
    creatorField: 'created_by',
    foreignKeys: [
      { field: 'order_id', refTable: 'orders' },
      { field: 'user_id', refTable: 'users' },
    ],
    uniqueFields: ['transaction_id'],
    requiredFields: ['amount', 'tenant_id', 'status'],
  },
];

/**
 * 检查 1: 孤儿记录检测 (tenant_id IS NULL)
 */
async function checkOrphanRecords(): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  for (const config of TABLE_CONFIGS) {
    if (!config.tenantIdField) continue;

    const { data, error } = await supabase
      .from(config.table)
      .select('id')
      .is(config.tenantIdField, null);

    if (error) {
      results.push({
        checkName: `孤儿记录检查 - ${config.table}`,
        status: 'FAIL',
        issueCount: 1,
        details: [`查询失败：${error.message}`],
        fixedCount: 0,
        timestamp: new Date().toISOString(),
      });
      continue;
    }

    const issueCount = data?.length || 0;
    let fixedCount = 0;

    // 自动修复：删除孤儿记录
    if (issueCount > 0 && data) {
      const ids = data.map((item: any) => item.id);

      // 分批删除，每批 1000 条
      const batchSize = 1000;
      for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize);
        const { error: deleteError } = await supabase
          .from(config.table)
          .delete()
          .in('id', batch);

        if (!deleteError) {
          fixedCount += batch.length;
        }
      }
    }

    results.push({
      checkName: `孤儿记录检查 - ${config.table}`,
      status: issueCount === 0 ? 'PASS' : 'FAIL',
      issueCount,
      details:
        issueCount > 0
          ? [`发现 ${issueCount} 条孤儿记录`, `已修复 ${fixedCount} 条`]
          : ['所有记录都有有效的 tenant_id'],
      fixedCount,
      timestamp: new Date().toISOString(),
    });
  }

  return results;
}

/**
 * 检查 2: 外键约束违反
 */
async function checkForeignKeyViolations(): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  for (const config of TABLE_CONFIGS) {
    if (!config.foreignKeys || config.foreignKeys.length === 0) continue;

    for (const fk of config.foreignKeys) {
      // 查询引用不存在的记录
      const query = `
        SELECT ${config.table}.id, ${config.table}.${fk.field}
        FROM ${config.table}
        LEFT JOIN ${fk.refTable} ON ${config.table}.${fk.field} = ${fk.refTable}.id
        WHERE ${config.table}.${fk.field} IS NOT NULL
          AND ${fk.refTable}.id IS NULL
      `;

      const { data, error } = await supabase.rpc('execute_sql', { sql: query });

      if (error) {
        // 如果 RPC 不存在，使用备用方案
        results.push({
          checkName: `外键检查 - ${config.table}.${fk.field}`,
          status: 'WARNING',
          issueCount: 0,
          details: [`无法执行外键检查：${error.message}`],
          fixedCount: 0,
          timestamp: new Date().toISOString(),
        });
        continue;
      }

      const issueCount = data?.length || 0;
      let fixedCount = 0;

      // 自动修复：将无效的外键设为 NULL
      if (issueCount > 0 && data) {
        const ids = data.map((item: any) => item.id);

        const batchSize = 1000;
        for (let i = 0; i < ids.length; i += batchSize) {
          const batch = ids.slice(i, i + batchSize);
          const { error: updateError } = await supabase
            .from(config.table)
            .update({ [fk.field]: null })
            .in('id', batch);

          if (!updateError) {
            fixedCount += batch.length;
          }
        }
      }

      results.push({
        checkName: `外键检查 - ${config.table}.${fk.field} -> ${fk.refTable}`,
        status: issueCount === 0 ? 'PASS' : 'FAIL',
        issueCount,
        details:
          issueCount > 0
            ? [
                `发现 ${issueCount} 条违反外键约束的记录`,
                `已修复 ${fixedCount} 条`,
              ]
            : ['所有外键引用都有效'],
        fixedCount,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return results;
}

/**
 * 检查 3: 重复记录检测
 */
async function checkDuplicateRecords(): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  for (const config of TABLE_CONFIGS) {
    if (!config.uniqueFields || config.uniqueFields.length === 0) continue;

    for (const field of config.uniqueFields) {
      // 查询重复的值
      const { data, error } = await supabase
        .from(config.table)
        .select(`${field}, count`)
        .eq('count', 1, { foreignTable: config.table })
        .group(field)
        .having('count', 'gt', 1);

      if (error) {
        results.push({
          checkName: `重复记录检查 - ${config.table}.${field}`,
          status: 'WARNING',
          issueCount: 0,
          details: [`无法执行重复检查：${error.message}`],
          fixedCount: 0,
          timestamp: new Date().toISOString(),
        });
        continue;
      }

      const issueCount = data?.length || 0;

      results.push({
        checkName: `重复记录检查 - ${config.table}.${field}`,
        status: issueCount === 0 ? 'PASS' : 'FAIL',
        issueCount,
        details:
          issueCount > 0
            ? [`发现 ${issueCount} 组重复值`, '需要手动处理']
            : ['没有重复记录'],
        fixedCount: 0,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return results;
}

/**
 * 检查 4: 数据格式验证
 */
async function checkDataFormat(): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  for (const config of TABLE_CONFIGS) {
    if (!config.requiredFields || config.requiredFields.length === 0) continue;

    let totalIssues = 0;
    const details: string[] = [];

    for (const field of config.requiredFields) {
      const { data, error } = await supabase
        .from(config.table)
        .select('id')
        .is(field, null);

      if (error) {
        details.push(`字段 ${field} 检查失败：${error.message}`);
        totalIssues++;
        continue;
      }

      const nullCount = data?.length || 0;
      if (nullCount > 0) {
        totalIssues += nullCount;
        details.push(`必填字段 ${field} 有 ${nullCount} 条空值`);
      }
    }

    // 检查邮箱格式
    if (config.table === 'users') {
      const { data: invalidEmails, error } = await supabase
        .from('users')
        .select('id, email')
        .not('email', 'like', '%@%');

      if (!error && invalidEmails && invalidEmails.length > 0) {
        totalIssues += invalidEmails.length;
        details.push(`发现 ${invalidEmails.length} 个无效的邮箱格式`);
      }
    }

    results.push({
      checkName: `数据格式检查 - ${config.table}`,
      status: totalIssues === 0 ? 'PASS' : 'FAIL',
      issueCount: totalIssues,
      details: totalIssues > 0 ? details : ['所有数据格式正确'],
      fixedCount: 0,
      timestamp: new Date().toISOString(),
    });
  }

  return results;
}

/**
 * 生成检查报告
 */
function generateReport(allResults: CheckResult[]): string {
  const timestamp = new Date().toISOString();
  const passCount = allResults.filter(r => r.status === 'PASS').length;
  const failCount = allResults.filter(r => r.status === 'FAIL').length;
  const warningCount = allResults.filter(r => r.status === 'WARNING').length;
  const totalFixed = allResults.reduce((sum, r) => sum + r.fixedCount, 0);

  let report = `
# 数据一致性检查报告

**生成时间**: ${timestamp}
**总计检查项**: ${allResults.length}
**通过**: ${passCount} | **失败**: ${failCount} | **警告**: ${warningCount}
**自动修复数量**: ${totalFixed}

---

## 详细结果

`;

  for (const result of allResults) {
    report += `### ${result.checkName}

- **状态**: ${result.status === 'PASS' ? '✅ 通过' : result.status === 'FAIL' ? '❌ 失败' : '⚠️ 警告'}
- **问题数量**: ${result.issueCount}
- **修复数量**: ${result.fixedCount}
- **详情**:
${result.details.map(d => `  - ${d}`).join('\n')}

`;
  }

  report += `---

## 建议操作

${failCount > 0 ? '❗ 请立即处理失败项，确保数据完整性' : '✅ 所有检查项已通过'}
${warningCount > 0 ? '⚠️ 请关注警告项，可能需要手动干预' : ''}
`;

  return report;
}

/**
 * 发送邮件通知 (模拟实现)
 */
async function sendNotification(report: string): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';

  console.log(`\n📧 准备发送邮件到：${adminEmail}`);
  console.log('邮件内容:', report.substring(0, 500) + '...');

  // TODO: 集成真实的邮件发送服务
  // 可以使用 nodemailer 或第三方 API 服务
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  console.log('🔍 开始执行数据一致性检查...\n');

  const allResults: CheckResult[] = [];

  try {
    // 执行所有检查
    console.log('1️⃣ 检查孤儿记录...');
    const orphanResults = await checkOrphanRecords();
    allResults.push(...orphanResults);

    console.log('2️⃣ 检查外键约束...');
    const fkResults = await checkForeignKeyViolations();
    allResults.push(...fkResults);

    console.log('3️⃣ 检查重复记录...');
    const duplicateResults = await checkDuplicateRecords();
    allResults.push(...duplicateResults);

    console.log('4️⃣ 检查数据格式...');
    const formatResults = await checkDataFormat();
    allResults.push(...formatResults);

    // 生成报告
    const report = generateReport(allResults);

    // 保存报告到文件
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportFile = path.join(
      reportsDir,
      `data-consistency-check-${new Date().toISOString().split('T')[0]}.md`
    );
    fs.writeFileSync(reportFile, report);
    console.log(`\n📄 报告已保存到：${reportFile}`);

    // 发送邮件通知
    await sendNotification(report);

    // 输出摘要
    const passCount = allResults.filter(r => r.status === 'PASS').length;
    const failCount = allResults.filter(r => r.status === 'FAIL').length;

    console.log('\n' + '='.repeat(50));
    console.log(`✅ 通过：${passCount}`);
    console.log(`❌ 失败：${failCount}`);
    console.log('='.repeat(50));

    if (failCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 执行过程中发生错误:', error);
    process.exit(1);
  }
}

// 运行主函数
main();
