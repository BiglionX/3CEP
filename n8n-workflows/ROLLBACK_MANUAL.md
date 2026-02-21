# n8n 工作流回滚操作手册

## 概述
本文档详细说明了在n8n工作流出现问题时的回滚操作流程和应急处理方案。

## 回滚触发条件

### 自动触发条件
- 工作流执行失败率超过10%
- API调用超时率超过15%
- 系统健康检查持续失败超过5分钟
- 监控告警级别达到P1/P2

### 人工触发条件
- 用户投诉激增超过正常水平200%
- 业务方反馈功能异常
- 安全漏洞需要紧急修复
- 数据一致性问题

## 回滚操作步骤

### 1. 紧急响应 (0-5分钟)
```bash
# 1. 立即停止新请求
# 通过负载均衡器或API网关暂停流量

# 2. 确认当前状态
export N8N_API_URL="https://your-n8n-instance.com"
export N8N_API_TOKEN="your-api-token"

# 3. 检查系统健康
node scripts/check-n8n-health.js --health

# 4. 查看当前工作流状态
node scripts/check-n8n-health.js --activation
```

### 2. 执行回滚 (5-10分钟)
```bash
# 1. 确定回滚版本
export ROLLBACK_VERSION="v1.0.0"
export BACKUP_TIMESTAMP="20260220_153045"  # 可选，使用最新备份

# 2. 执行预演检查
./scripts/rollback-n8n-workflows.sh --dry-run

# 3. 执行正式回滚
./scripts/rollback-n8n-workflows.sh --version $ROLLBACK_VERSION

# 4. 验证回滚结果
node n8n-workflows/test-n8n-workflows.js --activation
node n8n-workflows/test-n8n-workflows.js --health
```

### 3. 功能验证 (10-15分钟)
```bash
# 1. 基础功能测试
node n8n-workflows/test-n8n-workflows.js --basic

# 2. 完整功能测试
node n8n-workflows/test-n8n-workflows.js

# 3. 性能测试
node scripts/performance-test.js --workflow procurement --iterations 10
```

### 4. 通知和记录 (15-20分钟)
```bash
# 1. 更新状态到监控系统
curl -X POST "https://monitoring.yourdomain.com/api/incidents" \
  -H "Content-Type: application/json" \
  -d '{
    "incident_type": "rollback_executed",
    "severity": "medium",
    "affected_services": ["n8n-workflows"],
    "rollback_version": "v1.0.0",
    "executed_by": "'$(whoami)'",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }'

# 2. 通知相关人员
# 发送邮件/Slack/企业微信通知
```

## 不同场景的回滚策略

### 场景1: 采购工作流异常
**影响范围**: B2B采购需求解析功能
**回滚版本**: v1.0.0 (基础稳定版本)
**预计时间**: 2分钟
**验证重点**: 
- Webhook端点响应正常
- API调用成功率>95%
- 解析结果准确性

### 场景2: 支付工作流异常
**影响范围**: 支付成功处理流程
**回滚版本**: v1.0.0 (核心稳定版本)
**预计时间**: 3分钟
**验证重点**:
- 支付回调处理正常
- 订单状态同步准确
- 积分发放无误

### 场景3: 集成服务异常
**影响范围**: AI升级、扫描、教程等集成服务
**回滚版本**: v1.0.0 (各自领域的稳定版本)
**预计时间**: 2分钟/服务
**验证重点**:
- 各服务间通信正常
- 数据流转完整
- 用户体验不受影响

## 回滚后的处理

### 1. 问题分析
```bash
# 1. 收集错误日志
docker logs n8n --since 1h > rollback-analysis/error-logs.txt

# 2. 分析执行历史
curl -s "$N8N_API_URL/executions?limit=100&status=error" \
  -H "Authorization: Bearer $N8N_API_TOKEN" > rollback-analysis/failed-executions.json

# 3. 检查资源使用
docker stats n8n --no-stream > rollback-analysis/resource-usage.txt
```

### 2. 根因定位
- 检查最近的代码变更
- 分析配置变更历史
- 审查第三方服务状态
- 验证数据一致性

### 3. 修复和验证
```bash
# 1. 在测试环境重现问题
# 2. 开发修复方案
# 3. 完整测试验证
# 4. 准备灰度发布方案
```

## 预防措施

### 1. 部署前检查清单
- [ ] 代码审查完成
- [ ] 单元测试通过率100%
- [ ] 集成测试通过率≥95%
- [ ] 性能测试达标
- [ ] 安全扫描无高危漏洞
- [ ] 回滚方案已准备

### 2. 监控告警设置
```yaml
# 关键指标监控
metrics:
  - name: workflow_execution_failure_rate
    threshold: 10%
    alert_level: P1
    
  - name: api_response_time_p95
    threshold: 3000ms
    alert_level: P2
    
  - name: active_workflow_count
    threshold: 0
    alert_level: P1
```

### 3. 定期演练
- 每季度进行一次完整回滚演练
- 新员工入职时进行回滚培训
- 更新回滚文档和脚本
- 优化回滚时间目标

## 紧急联系方式

### 技术团队
- **值班工程师**: [电话] [邮箱]
- **技术负责人**: [电话] [邮箱]
- **运维团队**: [电话] [邮箱]

### 业务团队
- **产品经理**: [电话] [邮箱]
- **客户服务**: [电话] [邮箱]
- **财务团队**: [电话] [邮箱] (支付相关问题)

## 附录

### 常用命令速查
```bash
# 健康检查
./scripts/check-n8n-health.js

# 工作流测试
node n8n-workflows/test-n8n-workflows.js

# 回滚操作
./scripts/rollback-n8n-workflows.sh --version v1.0.0

# 查看备份
ls -la backups/

# 查看日志
docker logs n8n --tail 100
```

### 回滚时间记录表
| 时间点 | 操作 | 负责人 | 状态 |
|--------|------|--------|------|
| 14:30 | 发现问题 | 张三 | ✓ |
| 14:32 | 停止流量 | 李四 | ✓ |
| 14:35 | 执行回滚 | 王五 | ✓ |
| 14:37 | 功能验证 | 赵六 | ✓ |
| 14:40 | 恢复服务 | 孙七 | ✓ |

---
**文档版本**: v1.0  
**最后更新**: 2026-02-20  
**维护人**: AI Assistant