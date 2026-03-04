const fs = require('fs');
const path = require('path');

console.log('🔍 验证 n8n 模板工作流...\n');

const templatePath = path.join(
  __dirname,
  '..',
  'n8n-workflows',
  'templates',
  'agent-invoke-template.json'
);
const readmePath = path.join(
  __dirname,
  '..',
  'n8n-workflows',
  'templates',
  'README.md'
);

try {
  // 检查模板文件是否存在
  if (!fs.existsSync(templatePath)) {
    console.error('❌ 模板文件不存在:', templatePath);
    process.exit(1);
  }

  // 检查 README 文件是否存在
  if (!fs.existsSync(readmePath)) {
    console.error('❌ README 文件不存在:', readmePath);
    process.exit(1);
  }

  // 读取并解析模板文件
  const templateContent = fs.readFileSync(templatePath, 'utf8');
  const templateJson = JSON.parse(templateContent);

  console.log('✅ 模板文件结构验证:');
  console.log(`   - 文件名: ${path.basename(templatePath)}`);
  console.log(
    `   - 文件大小: ${(templateContent.length / 1024).toFixed(2)} KB`
  );
  console.log(`   - 工作流名称: ${templateJson.name}`);
  console.log(`   - 节点数量: ${templateJson.nodes.length}`);
  console.log(`   - 连接数量: ${Object.keys(templateJson.connections).length}`);

  // 验证必需的节点
  const requiredNodes = [
    'Start',
    'Set Input',
    'HTTP Request',
    'IF Status Check',
    'Success Output',
  ];

  console.log('\n✅ 必需节点检查:');
  requiredNodes.forEach(nodeName => {
    const nodeExists = templateJson.nodes.some(node => node.name === nodeName);
    console.log(`   - ${nodeName}: ${nodeExists ? '✅ 存在' : '❌ 缺失'}`);
    if (!nodeExists) {
      throw new Error(`缺少必需节点: ${nodeName}`);
    }
  });

  // 验证环境变量使用
  const envVars = [
    'AGENTS_ENDPOINT',
    'AGENTS_API_KEY',
    'AGENTS_CREDENTIAL_ID',
    'AGENTS_MAX_RETRIES',
  ];

  console.log('\n✅ 环境变量检查:');
  let envVarIssues = 0;

  envVars.forEach(envVar => {
    const hasEnvVar =
      templateContent.includes(`$env.${envVar}`) ||
      templateContent.includes(envVar);
    console.log(`   - ${envVar}: ${hasEnvVar ? '✅ 正确使用' : '⚠️  未找到'}`);
    if (!hasEnvVar) envVarIssues++;
  });

  // 验证没有硬编码的敏感信息
  const hardcodedPatterns = [
    /['"][a-zA-Z0-9]{32,}['"]/g, // 长字符串可能是密钥
    /password|secret|api_key/i, // 敏感词
  ];

  console.log('\n✅ 安全检查:');
  let securityIssues = 0;

  hardcodedPatterns.forEach(pattern => {
    const matches = templateContent.match(pattern);
    if (matches && matches.length > 0) {
      matches.forEach(match => {
        // 排除正常的变量引用和环境变量名称
        if (
          !match.includes('$env.') &&
          !match.includes('"name":') &&
          !match.includes('"value":') &&
          !match.includes('AGENTS_') &&
          !match.includes('NOTIFICATION_')
        ) {
          console.log(`   ⚠️  可能的硬编码值: ${match.substring(0, 50)}...`);
          securityIssues++;
        }
      });
    }
  });

  if (securityIssues === 0) {
    console.log('   ✅ 未发现明显的硬编码敏感信息');
  }

  // 验证元数据
  if (templateJson.meta) {
    console.log('\n✅ 元数据检查:');
    console.log(`   - 模板标识: ${templateJson.meta.template}`);
    console.log(`   - 分类: ${templateJson.meta.category}`);
    console.log(`   - 描述: ${templateJson.meta.description}`);
    if (templateJson.meta.variables) {
      console.log(`   - 环境变量数量: ${templateJson.meta.variables.length}`);
    }
  }

  console.log('\n🎉 模板验证通过！');
  console.log('\n📋 下一步操作:');
  console.log('1. 在 n8n 中导入该模板文件');
  console.log('2. 配置相应的环境变量');
  console.log('3. 创建必要的凭证');
  console.log('4. 根据具体需求调整节点参数');
} catch (error) {
  console.error('❌ 验证失败:', error.message);
  process.exit(1);
}
