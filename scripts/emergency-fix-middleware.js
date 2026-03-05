/**
 * 紧急修复 middleware 和 api-interceptor 的中文乱码
 */

const fs = require('fs');

// 修复 middleware.ts
function fixMiddleware() {
  const filePath = 'src/middleware.ts';
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 替换所有损坏的中文
  const patterns = {
    '拦？': '拦截',
    '检？': '检查',
    '阻？': '阻止',
    '处？': '处理',
    '请？': '请求',
    '错？': '错误',
  };
  
  Object.entries(patterns).forEach(([damaged, correct]) => {
    const regex = new RegExp(damaged.replace(/[?*]/g, '.'), 'g');
    content = content.replace(regex, correct);
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ 已修复：middleware.ts');
}

// 修复 api-interceptor.ts
function fixApiInterceptor() {
  const filePath = 'src/modules/common/permissions/core/api-interceptor.ts';
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 替换所有损坏的中文
  const patterns = {
    '径？': '路径',
    '录？': '记录',
    '志？': '日志',
    '频？': '频率',
    '制？': '制度',
    '拒？': '拒绝',
    '置？': '配置',
    '环？': '环境',
    '响？': '响应',
    '处？': '处理',
    '检？': '检查',
    '拦？': '拦截',
    '阻？': '阻止',
    '请？': '请求',
    '错？': '错误',
    '误？': '误会',
    '态？': '态度',
    '势？': '趋势',
    '存？': '存储',
    '取？': '获取',
    '得？': '得到',
    '到？': '到达',
    '时？': '时间',
    '间？': '间隔',
    '限？': '限制',
    '制？': '制度',
  };
  
  Object.entries(patterns).forEach(([damaged, correct]) => {
    const regex = new RegExp(damaged.replace(/[?*]/g, '.'), 'g');
    content = content.replace(regex, correct);
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ 已修复：api-interceptor.ts');
}

console.log('🔧 开始紧急修复...\n');
fixMiddleware();
fixApiInterceptor();
console.log('\n✅ 紧急修复完成！');
