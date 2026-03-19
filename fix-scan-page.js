const fs = require('fs');

let content = fs.readFileSync('src/app/scan/page.tsx', 'utf8');

// 修复 API URL
content = content.replace(/nearbylat=/g, 'nearby?lat=');

// 修复三元运算符 - 主要问题
content = content.replace(/(\w+)\s+\(/g, (match, p1) => {
  // 检查是否是条件判断
  const before = content.substring(0, content.indexOf(match));
  const after = content.substring(content.indexOf(match) + match.length);
  
  // 如果前一个字符是 { 且后文有 : ) ，则应该是三元运算符
  if (before.endsWith('{') && after.includes(') :')) {
    return `${p1} ? (`;
  }
  return match;
});

// 修复 Error instanceof 的三元
content = content.replace(/err instanceof Error\s+(\w+)\s+/g, 'err instanceof Error ? $1 ');

// 修复缺失的 ? 问题
content = content.replace(/\{getCurrentLanguageManuals\(\)\.length > 0\s+\(/g, '{getCurrentLanguageManuals().length > 0 ? (');
content = content.replace(/\{nearbyShops\.length > 0\s+\(/g, '{nearbyShops.length > 0 ? (');
content = content.replace(/\{shopsLoading\s+\(/g, '{shopsLoading ? (');

// 修复 template literal 中的三元
content = content.replace(/(\w+)\s+(['"])/g, (match, p1, p2) => {
  if (['detectedDevice', 'currentLanguage'].includes(p1)) {
    return `${p1} ? ${p2}`;
  }
  return match;
});

// 特殊修复 - className 中的三元
content = content.replace(/\?\s*['"]border-blue-500 bg-blue-50['"]/g, '? \'border-blue-500 bg-blue-50\'');
content = content.replace(/:\s*['"]border-gray-200 hover:border-gray-300['"]/g, ': \'border-gray-200 hover:border-gray-300\'');

// 修复 ? 缺失的问题
content = content.replace(/detectedDevice\s+\(/g, 'detectedDevice ? (');
content = content.replace(/shopsLoading\s+\(/g, 'shopsLoading ? (');

fs.writeFileSync('src/app/scan/page.tsx', content, 'utf8');
console.log('修复完成');
