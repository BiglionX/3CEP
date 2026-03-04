# Phase 5 集成测试报告

**测试时间**: 2026-03-01T13:52:26.921Z

## 测试摘要

| 指标         | 数值  |
| ------------ | ----- |
| 测试用例总数 | 8     |
| 通过用例数   | 3     |
| 失败用例数   | 5     |
| 通过率       | 37.5% |

## 详细测试结果

### MON-001 - 监控指标体系验证

- **状态**: ❌ 失败
- **步骤**: 2/3 通过
  1. ✅ 测试执行
  2. ✅ 测试执行
  3. ❌ 监控服务测试失败: Cannot find module '../../src/lib/monitoring-service'
     Require stack:

- D:\BigLionX\3cep\tests\integration\phase5-integration-tests.js

### MON-002 - 性能监控面板测试

- **状态**: ✅ 通过
- **步骤**: 3/3 通过
  1. ✅ 测试执行
  2. ✅ 测试执行
  3. ✅ 测试执行

### ALERT-001 - 告警机制功能测试

- **状态**: ❌ 失败
- **步骤**: 1/3 通过
  1. ✅ 测试执行
  2. ❌ 告警规则测试失败: Cannot find module '../../src/lib/alert-manager'
     Require stack:

- D:\BigLionX\3cep\tests\integration\phase5-integration-tests.js 3. ❌ 告警触发测试失败: Cannot find module '../../src/lib/alert-manager'
  Require stack:
- D:\BigLionX\3cep\tests\integration\phase5-integration-tests.js

### LOG-001 - 日志分析系统测试

- **状态**: ❌ 失败
- **步骤**: 1/3 通过
  1. ✅ 测试执行
  2. ❌ 日志记录测试失败: Cannot find module '../../src/lib/log-analyzer'
     Require stack:

- D:\BigLionX\3cep\tests\integration\phase5-integration-tests.js 3. ❌ 日志搜索测试失败: Cannot find module '../../src/lib/log-analyzer'
  Require stack:
- D:\BigLionX\3cep\tests\integration\phase5-integration-tests.js

### MOD-001 - 内容审核流程测试

- **状态**: ❌ 失败
- **步骤**: 2/3 通过
  1. ✅ 测试执行
  2. ❌ 自动审核测试失败: Cannot find module '../../src/lib/auto-moderation-service'
     Require stack:

- D:\BigLionX\3cep\tests\integration\phase5-integration-tests.js 3. ✅ 测试执行

### MOD-002 - 人工审核工具测试

- **状态**: ✅ 通过
- **步骤**: 2/2 通过
  1. ✅ 测试执行
  2. ✅ 测试执行

### VIOLATION-001 - 违规处理机制测试

- **状态**: ❌ 失败
- **步骤**: 1/3 通过
  1. ✅ 测试执行
  2. ❌ 违规记录测试失败: Cannot find module '../../src/lib/violation-management-service'
     Require stack:

- D:\BigLionX\3cep\tests\integration\phase5-integration-tests.js 3. ❌ 申诉处理测试失败: Cannot find module '../../src/lib/violation-management-service'
  Require stack:
- D:\BigLionX\3cep\tests\integration\phase5-integration-tests.js

### DATA-001 - 数据分析指标体系测试

- **状态**: ✅ 通过
- **步骤**: 2/2 通过
  1. ✅ 测试执行
  2. ✅ 测试执行
