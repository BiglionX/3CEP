/**
 * 修复 ML 服务文件的语法错误
 */

const fs = require('fs');

// 修复 ml-client.service.ts
function fixMLClientService() {
  const filePath = 'src/services/ml-client.service.ts';
  let content = fs.readFileSync(filePath, 'utf8');

  // 修复文件头部
  content = content.replace(
    /\/\*\*\s*\n \* V-ML-05: Node\.js ML 模型客户端服？\* 封装调用 Python 微服务的 HTTP 客户？\*\/\s*\n\s*\/\/ 使用 fetch 替代 axios 以避免依赖问？/g,
    `/**
 * V-ML-05: Node.js ML 模型客户端服务
 * 封装调用 Python 微服务的 HTTP 客户端
 */

// 使用 fetch 替代 axios 以避免依赖问题`
  );

  // 修复超时注释
  content = content.replace(/10 秒超？/g, '10 秒超时');
  
  // 修复重试间隔注释
  content = content.replace(/1 秒重试间？/g, '1 秒重试间隔');
  
  // 修复字符串未终止
  content = content.replace(
    /'无法连接到 ML 服务，请检查服务是否运？;/g,
    "'无法连接到 ML 服务，请检查服务是否运行');"
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ 已修复：${filePath}`);
}

// 修复其他 ML 服务
function fixOtherMLServices() {
  const files = [
    'src/services/ml-confidence.service.ts',
    'src/services/ml-error-handling.ts',
    'src/services/ml-prediction.service.ts',
  ];

  files.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // 通用修复规则
      content = content.replace(/信？/g, '信息');
      content = content.replace(/提示？/g, '提示');
      content = content.replace(/错误？/g, '错误');
      content = content.replace(/异常？/g, '异常');
      content = content.replace(/服务？/g, '服务');
      content = content.replace(/配置？/g, '配置');
      content = content.replace(/数据？/g, '数据');
      content = content.replace(/结果？/g, '结果');
      content = content.replace(/处理？/g, '处理');
      content = content.replace(/状态？/g, '状态');
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 已修复：${filePath}`);
    }
  });
}

console.log('🔧 开始修复 ML 服务...\n');
fixMLClientService();
fixOtherMLServices();
console.log('\n✅ ML 服务修复完成！');
