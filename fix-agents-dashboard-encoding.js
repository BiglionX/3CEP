const fs = require('fs');

const filePath = 'd:/BigLionX/3cep/src/components/admin/AgentsDashboard.tsx';

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 修复常见的编码问题
  const replacements = [
    // 修复注释中的乱码
    { from: /智能体注册信息接\?/g, to: '智能体注册信息接口' },
    { from: /智能体状态接\?/g, to: '智能体状态接口' },
    { from: /综合智能体信\?/g, to: '综合智能体信息接口' },
    { from: /\?0秒刷新一\?/g, to: '每30秒刷新一次' },
    { from: /并行获取注册信息和状态信\?/g, to: '并行获取注册信息和状态信息' },
    { from: /获取智能体信息失\?/g, to: '获取智能体信息失败' },
    { from: /合并注册信息和状态信\?/g, to: '合并注册信息和状态信息' },
    { from: /加载智能体信息失\?/g, to: '加载智能体信息失败' },
    { from: /n8n工作\?/g, to: 'n8n工作流' },
    { from: /高风\?/g, to: '高风险' },
    { from: /中风\?/g, to: '中风险' },
    { from: /低风\?/g, to: '低风险' },
    { from: /加载\?\.\./g, to: '加载中...' },
    { from: /智能体管\?<\/h1>/g, to: '智能体管理</h1>' },
    { from: /总计智能\?<\/h3>/g, to: '总计智能体</h3>' },
    { from: /在线智能\?<\/h3>/g, to: '在线智能体</h3>' },
    { from: /平均成功\?<\/h3>/g, to: '平均成功率</h3>' },
    { from: /过滤\?\{}/g, to: '过滤器' },
    { from: /过滤\?<\/h2>/g, to: '过滤器</h2>' },
    { from: /全部状\?/g, to: '全部状态' },
    { from: /智能体列\?\{}/g, to: '智能体列表' },
    { from: /智能体列\?<\/h2>/g, to: '智能体列表</h2>' },
    { from: /\?\{filteredAgents\.length\}/g, to: '共 {filteredAgents.length}' },
    { from: /状\?<\/th>/g, to: '状态</th>' },
    { from: /成功\?<\/th>/g, to: '成功率</th>' },
    { from: /请求\?<\/th>/g, to: '请求数</th>' },
  ];
  
  replacements.forEach(({ from, to }) => {
    content = content.replace(from, to);
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ 编码问题修复完成');
  
} catch (error) {
  console.error('❌ 修复失败:', error.message);
}
