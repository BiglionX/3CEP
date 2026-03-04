import { AuditService } from '../src/services/audit-service';

async function testAuditService() {
  console.log('🧪 开始测试审计日志服务...');

  // 测试记录日志
  const testResult = await AuditService.logAction({
    user_id: 'test-user-id',
    user_email: 'test@example.com',
    action: 'create',
    resource: 'test-resource',
    resource_id: '123',
    ip_address: '127.0.0.1',
    user_agent: 'Test Agent',
  });

  console.log('📝 日志记录结果:', testResult);

  // 测试查询日志
  const logsResult = await AuditService.getAuditLogs(1, 10);
  console.log('📋 查询日志结果:', {
    total: logsResult.total,
    logCount: logsResult.logs.length,
  });

  // 测试导出功能
  const csvResult = await AuditService.exportLogsAsCSV();
  console.log('📊 导出CSV长度:', csvResult.length);

  console.log('✅ 审计日志服务测试完成');
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  testAuditService().catch(console.error);
}

export { testAuditService };
