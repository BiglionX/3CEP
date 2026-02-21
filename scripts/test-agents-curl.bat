@echo off
echo ========================================
echo agents/invoke 接口 curl 测试脚本
echo ========================================

echo 测试 1: 正常调用 AI故障诊断服务
curl -X POST http://localhost:3001/agents/invoke ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer test-agents-api-key" ^
  -d "{\"idempotency_key\":\"diag_20260220_001\",\"trace_id\":\"trace_123456789\",\"timeout\":30,\"agent_name\":\"AI故障诊断服务\",\"payload\":{\"device_id\":\"DEV001\",\"symptoms\":\"设备无法开机\",\"conversation_history\":[]}}"

echo.
echo.
echo 测试 2: 正常调用 FCX智能推荐引擎
curl -X POST http://localhost:3001/agents/invoke ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer test-agents-api-key" ^
  -d "{\"idempotency_key\":\"rec_20260220_001\",\"trace_id\":\"trace_987654321\",\"timeout\":15,\"agent_name\":\"FCX智能推荐引擎\",\"payload\":{\"user_id\":\"user_123\",\"context\":{\"location\":{\"lat\":39.9042,\"lng\":116.4074},\"device_type\":\"smartphone\"}}}"

echo.
echo.
echo 测试 3: 无认证头测试（应该失败）
curl -X POST http://localhost:3001/agents/invoke ^
  -H "Content-Type: application/json" ^
  -d "{\"idempotency_key\":\"test_001\",\"trace_id\":\"trace_001\",\"timeout\":30,\"agent_name\":\"测试智能体\",\"payload\":{}}"

echo.
echo.
echo 测试 4: 参数校验测试（缺少必需字段）
curl -X POST http://localhost:3001/agents/invoke ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer test-agents-api-key" ^
  -d "{\"agent_name\":\"测试智能体\",\"payload\":{}}"

echo.
echo.
echo 测试 5: 健康检查接口
curl -X GET http://localhost:3001/api/health

echo.
echo ========================================
echo 测试完成
echo ========================================