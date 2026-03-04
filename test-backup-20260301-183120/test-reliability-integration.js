/**
 * Agents Orchestrator 可靠性功能集成测试脚本
 * 验证超时、重试、幂等性等功能
 */

const {
  AgentOrchestrator,
} = require('../src/agents-orchestrator/orchestrator');

async function runIntegrationTests() {
  console.log('🚀 开始 Agents Orchestrator 可靠性集成测试...\n');

  // 创建测试用的 orchestrator 实例
  const orchestrator = new AgentOrchestrator({
    maxRetries: 3,
    timeoutMs: 5000,
    retryDelayMs: 100,
    maxRetryDelayMs: 1000,
    enableIdempotency: true,
    idempotencyExpiryMs: 10000,
  });

  let passedTests = 0;
  let totalTests = 0;

  try {
    // 测试1: 基本功能测试
    console.log('🧪 测试1: 基本代理调用功能');
    totalTests++;
    try {
      const request = {
        idempotency_key: `basic_test_${Date.now()}`,
        trace_id: `trace_basic_${Date.now()}`,
        timeout: 10,
        agent_name: 'BasicTestAgent',
        payload: { test: 'basic functionality' },
      };

      const response = await orchestrator.invokeAgent(request);

      if (response.code === 200 && response.data) {
        console.log('   ✅ 通过 - 基本调用成功');
        passedTests++;
      } else {
        console.log('   ❌ 失败 - 响应格式不正确');
        console.log('   响应:', JSON.stringify(response, null, 2));
      }
    } catch (error) {
      console.log('   ❌ 失败 - 基本调用异常:', error.message);
    }

    // 测试2: 超时功能测试
    console.log('\n🧪 测试2: 超时控制功能');
    totalTests++;
    try {
      const request = {
        idempotency_key: `timeout_test_${Date.now()}`,
        trace_id: `trace_timeout_${Date.now()}`,
        timeout: 1, // 1秒超时
        agent_name: 'TimeoutTestAgent',
        payload: {},
      };

      // 修改内部处理器来模拟超时
      const originalHandler = orchestrator['invokeAgentHandler'];
      orchestrator['invokeAgentHandler'] = async () => {
        await new Promise(resolve => setTimeout(resolve, 3000)); // 3秒延迟
        return { result: 'should not reach here' };
      };

      const startTime = Date.now();
      const response = await orchestrator.invokeAgent(request);
      const duration = Date.now() - startTime;

      // 恢复原始处理器
      orchestrator['invokeAgentHandler'] = originalHandler;

      if (response.code === 500 && response.message.includes('超时')) {
        console.log(`   ✅ 通过 - 正确触发超时 (${duration}ms)`);
        passedTests++;
      } else {
        console.log('   ❌ 失败 - 超时未正确触发');
        console.log('   响应:', JSON.stringify(response, null, 2));
      }
    } catch (error) {
      console.log('   ❌ 失败 - 超时测试异常:', error.message);
    }

    // 测试3: 重试功能测试
    console.log('\n🧪 测试3: 重试机制功能');
    totalTests++;
    try {
      const request = {
        idempotency_key: `retry_test_${Date.now()}`,
        trace_id: `trace_retry_${Date.now()}`,
        timeout: 10,
        agent_name: 'RetryTestAgent',
        payload: {},
      };

      // 记录调用次数
      let callCount = 0;
      const originalHandler = orchestrator['invokeAgentHandler'];
      orchestrator['invokeAgentHandler'] = async () => {
        callCount++;
        if (callCount <= 2) {
          // 前两次失败
          const error = new Error('500 Internal Server Error');
          error.code = 'INTERNAL_ERROR';
          throw error;
        }
        // 第三次成功
        return { result: 'retry success', call_count: callCount };
      };

      const response = await orchestrator.invokeAgent(request);

      // 恢复原始处理器
      orchestrator['invokeAgentHandler'] = originalHandler;

      if (response.code === 200 && response.data.call_count === 3) {
        console.log(`   ✅ 通过 - 正确重试并成功 (调用${callCount}次)`);
        passedTests++;
      } else {
        console.log('   ❌ 失败 - 重试机制未按预期工作');
        console.log('   响应:', JSON.stringify(response, null, 2));
      }
    } catch (error) {
      console.log('   ❌ 失败 - 重试测试异常:', error.message);
    }

    // 测试4: 幂等性功能测试
    console.log('\n🧪 测试4: 幂等性去重功能');
    totalTests++;
    try {
      const idempotencyKey = `idempotent_test_${Date.now()}`;

      const request1 = {
        idempotency_key: idempotencyKey,
        trace_id: `trace_idem_1_${Date.now()}`,
        timeout: 10,
        agent_name: 'IdempotentTestAgent',
        payload: { value: 'first call' },
      };

      const request2 = {
        idempotency_key: idempotencyKey,
        trace_id: `trace_idem_2_${Date.now()}`,
        timeout: 10,
        agent_name: 'IdempotentTestAgent',
        payload: { value: 'second call' },
      };

      // 记录调用次数
      let idempotentCallCount = 0;
      const originalHandler = orchestrator['invokeAgentHandler'];
      orchestrator['invokeAgentHandler'] = async request => {
        idempotentCallCount++;
        return {
          result: `processed: ${request.payload.value}`,
          call_number: idempotentCallCount,
          timestamp: Date.now(),
        };
      };

      const response1 = await orchestrator.invokeAgent(request1);
      const response2 = await orchestrator.invokeAgent(request2);

      // 恢复原始处理器
      orchestrator['invokeAgentHandler'] = originalHandler;

      if (response1.code === 200 && response2.code === 200) {
        if (
          idempotentCallCount === 1 &&
          response1.data.timestamp === response2.data.timestamp
        ) {
          console.log(
            `   ✅ 通过 - 幂等性正确工作 (实际调用${idempotentCallCount}次)`
          );
          passedTests++;
        } else {
          console.log('   ⚠️  部分通过 - 响应成功但幂等性验证需要改进');
          console.log(`   实际调用次数: ${idempotentCallCount}`);
          console.log(
            `   时间戳匹配: ${response1.data.timestamp === response2.data.timestamp}`
          );
        }
      } else {
        console.log('   ❌ 失败 - 幂等性测试失败');
        console.log('   响应1:', JSON.stringify(response1, null, 2));
        console.log('   响应2:', JSON.stringify(response2, null, 2));
      }
    } catch (error) {
      console.log('   ❌ 失败 - 幂等性测试异常:', error.message);
    }

    // 测试5: 配置管理测试
    console.log('\n🧪 测试5: 配置管理功能');
    totalTests++;
    try {
      const originalConfig = orchestrator.getReliabilityHandler().getConfig();

      // 更新配置
      orchestrator.updateReliabilityConfig({
        maxRetries: 5,
        timeoutMs: 10000,
      });

      const updatedConfig = orchestrator.getReliabilityHandler().getConfig();

      if (updatedConfig.maxRetries === 5 && updatedConfig.timeoutMs === 10000) {
        console.log('   ✅ 通过 - 配置更新成功');
        passedTests++;
      } else {
        console.log('   ❌ 失败 - 配置未正确更新');
        console.log('   原始配置:', JSON.stringify(originalConfig, null, 2));
        console.log('   更新配置:', JSON.stringify(updatedConfig, null, 2));
      }

      // 恢复原始配置
      orchestrator.updateReliabilityConfig(originalConfig);
    } catch (error) {
      console.log('   ❌ 失败 - 配置管理测试异常:', error.message);
    }

    // 测试6: 健康检查测试
    console.log('\n🧪 测试6: 健康检查功能');
    totalTests++;
    try {
      const health = await orchestrator.healthCheck();

      if (health.status === 'healthy' && health.timestamp) {
        console.log('   ✅ 通过 - 健康检查返回正确');
        passedTests++;
      } else {
        console.log('   ❌ 失败 - 健康检查响应不正确');
        console.log('   响应:', JSON.stringify(health, null, 2));
      }
    } catch (error) {
      console.log('   ❌ 失败 - 健康检查异常:', error.message);
    }
  } catch (error) {
    console.log('\n💥 测试执行过程中发生严重错误:', error.message);
    console.error(error.stack);
  } finally {
    // 清理资源
    try {
      await orchestrator.cleanup();
      console.log('\n🧹 资源清理完成');
    } catch (cleanupError) {
      console.log('\n⚠️  资源清理失败:', cleanupError.message);
    }
  }

  // 输出测试总结
  console.log(`\n${'='.repeat(50)}`);
  console.log('📊 测试结果总结:');
  console.log(`   总测试数: ${totalTests}`);
  console.log(`   通过数: ${passedTests}`);
  console.log(`   失败数: ${totalTests - passedTests}`);
  console.log(`   通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 所有测试通过！Agents Orchestrator 可靠性功能实现成功！');
  } else {
    console.log('\n⚠️  部分测试失败，请检查实现。');
  }
  console.log('='.repeat(50));
}

// 运行测试
runIntegrationTests().catch(error => {
  console.error('测试执行失败:', error);
  process.exit(1);
});
