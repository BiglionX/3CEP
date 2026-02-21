/**
 * n8n 健康检查脚本
 * 验证 n8n 服务状态、工作流激活状态和节点健康状况
 */

const BASE_N8N_URL = process.env.N8N_BASE_URL || 'http://localhost:5678';
const API_TOKEN = process.env.N8N_API_TOKEN;
const HEALTH_CHECK_TIMEOUT = parseInt(process.env.N8N_HEALTH_CHECK_TIMEOUT) || 30;

if (!API_TOKEN) {
  console.error('❌ 错误: N8N_API_TOKEN 环境变量未设置');
  process.exit(1);
}

console.log('🏥 开始 n8n 健康检查...');
console.log(`📊 检查配置:`);
console.log(`   n8n URL: ${BASE_N8N_URL}`);
console.log(`   超时时间: ${HEALTH_CHECK_TIMEOUT}秒`);
console.log('');

// 健康检查项定义
const HEALTH_CHECKS = [
  {
    name: 'n8n_service',
    description: 'n8n 服务状态',
    endpoint: '/healthz',
    validator: (response) => response.status === 'ok' || response.message === 'n8n is running',
    required: true
  },
  {
    name: 'workflow_activation',
    description: '工作流激活状态',
    endpoint: '/workflows',
    validator: (response) => {
      if (!response || !Array.isArray(response)) return false;
      return response.every(wf => wf.active === true);
    },
    required: true
  },
  {
    name: 'node_connectivity',
    description: '节点连接状态',
    endpoint: '/nodes',
    validator: (response) => {
      if (!response || !Array.isArray(response)) return true; // 节点列表可能为空
      return response.every(node => node.connected !== false);
    },
    required: false
  },
  {
    name: 'execution_history',
    description: '执行历史状态',
    endpoint: '/executions?limit=5',
    validator: (response) => {
      if (!response || !response.results) return true;
      // 检查最近执行是否有严重错误
      const recentErrors = response.results.filter(exec => 
        exec.finished === false && exec.stoppedAt
      );
      return recentErrors.length < 3; // 允许少量错误
    },
    required: false
  }
];

/**
 * 执行单个健康检查
 */
async function runSingleCheck(check) {
  console.log(`🔍 检查: ${check.description}`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT * 1000);
    
    const response = await fetch(`${BASE_N8N_URL}${check.endpoint}`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log(`❌ HTTP错误: ${response.status} ${response.statusText}`);
      return { 
        name: check.name, 
        status: 'FAIL', 
        message: `HTTP ${response.status}`,
        required: check.required
      };
    }
    
    const data = await response.json();
    const passed = check.validator(data);
    
    if (passed) {
      console.log(`✅ 通过`);
      return { 
        name: check.name, 
        status: 'PASS', 
        message: '检查通过',
        required: check.required
      };
    } else {
      console.log(`❌ 失败`);
      return { 
        name: check.name, 
        status: 'FAIL', 
        message: '验证失败',
        required: check.required
      };
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log(`⏰ 超时 (${HEALTH_CHECK_TIMEOUT}秒)`);
      return { 
        name: check.name, 
        status: 'TIMEOUT', 
        message: `超时 (${HEALTH_CHECK_TIMEOUT}秒)`,
        required: check.required
      };
    } else {
      console.log(`❌ 错误: ${error.message}`);
      return { 
        name: check.name, 
        status: 'ERROR', 
        message: error.message,
        required: check.required
      };
    }
  }
}

/**
 * 获取工作流详细状态
 */
async function getWorkflowDetails() {
  console.log('\n📋 工作流详细状态:');
  console.log('─'.repeat(50));
  
  try {
    const response = await fetch(`${BASE_N8N_URL}/workflows`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) return;
    
    const workflows = await response.json();
    
    workflows.forEach((wf, index) => {
      const status = wf.active ? '🟢 激活' : '🔴 未激活';
      const version = wf.meta?.version || '未版本化';
      console.log(`${index + 1}. ${wf.name}`);
      console.log(`   状态: ${status}`);
      console.log(`   版本: ${version}`);
      console.log(`   ID: ${wf.id}`);
      console.log('');
    });
    
  } catch (error) {
    console.log(`获取工作流详情失败: ${error.message}`);
  }
}

/**
 * 运行所有健康检查
 */
async function runAllHealthChecks() {
  console.log('🚀 开始执行健康检查套件...\n');
  
  const results = [];
  
  for (const check of HEALTH_CHECKS) {
    const result = await runSingleCheck(check);
    results.push(result);
    console.log('');
  }
  
  // 生成健康检查报告
  console.log('📊 健康检查报告:');
  console.log('=' .repeat(50));
  
  let passedRequired = 0;
  let failedRequired = 0;
  let totalChecks = results.length;
  
  results.forEach((result, index) => {
    const statusIcon = result.status === 'PASS' ? '✅' : 
                      result.status === 'FAIL' ? '❌' : 
                      result.status === 'TIMEOUT' ? '⏰' : '❌';
    const requiredText = result.required ? '(必需)' : '(可选)';
    console.log(`${index + 1}. ${result.name}: ${statusIcon} ${result.message} ${requiredText}`);
    
    if (result.required) {
      if (result.status === 'PASS') passedRequired++;
      else failedRequired++;
    }
  });
  
  console.log('=' .repeat(50));
  console.log(`必需检查: ${passedRequired}/${passedRequired + failedRequired} 通过`);
  console.log(`总体检查: ${results.filter(r => r.status === 'PASS').length}/${totalChecks} 通过`);
  
  // 显示工作流详情
  await getWorkflowDetails();
  
  // 计算整体健康分数
  const healthScore = Math.round(
    (results.filter(r => r.status === 'PASS').length / totalChecks) * 100
  );
  
  console.log(`\n📈 系统健康分数: ${healthScore}%`);
  
  if (failedRequired > 0) {
    console.log('⚠️  存在必需检查失败，请立即处理');
    process.exit(1);
  } else if (healthScore >= 90) {
    console.log('🎉 系统健康状况良好');
    process.exit(0);
  } else if (healthScore >= 70) {
    console.log('🟡 系统健康状况一般，建议关注');
    process.exit(0);
  } else {
    console.log('🔴 系统健康状况较差，需要检查');
    process.exit(1);
  }
}

// 命令行参数处理
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
使用方法:
  node check-n8n-health.js                    # 运行完整健康检查
  node check-n8n-health.js --service          # 只检查服务状态
  node check-n8n-health.js --workflows        # 只检查工作流状态
  
环境变量:
  N8N_BASE_URL=http://your-n8n-host:5678      # n8n 服务地址
  N8N_API_TOKEN=your_api_token               # API 访问令牌
  N8N_HEALTH_CHECK_TIMEOUT=30                # 超时时间(秒)
  `);
  process.exit(0);
}

// 执行健康检查
runAllHealthChecks().catch(error => {
  console.error('健康检查执行失败:', error.message);
  process.exit(1);
});