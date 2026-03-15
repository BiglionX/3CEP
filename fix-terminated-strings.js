const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 获取所有有错误的文件
const errorFiles = [
  'src/app/api/agents/[id]/execute/route.ts',
  'src/app/api/agents/invoke/route.ts',
  'src/app/api/agents/registry/route.ts',
  'src/app/api/agents/route.ts',
  'src/app/api/agents/status/route.ts',
  'src/app/api/analytics/events/route.ts',
  'src/app/api/analytics/performance/route.ts',
  'src/app/api/api-interceptor/route.ts',
  'src/app/api/articles/[id]/like/route.ts',
  'src/app/api/articles/route.ts',
  'src/app/api/auth/callback/google/route.ts',
  'src/app/api/auth/check-session/route.ts',
  'src/app/api/auth/login/route.ts',
  'src/app/api/auth/register/route.ts',
  'src/app/api/b2b-procurement/negotiation/recommendations/route.ts',
  'src/app/api/b2b-procurement/negotiation/start/route.ts',
  'src/app/api/b2b-procurement/parse-demand-enhanced/route.ts',
  'src/app/api/b2b-procurement/parse-demand-llm/route.ts',
  'src/app/api/b2b-procurement/parse-demand/route.ts',
  'src/app/api/b2b-procurement/parse-requirement/route.ts'
];

let totalFixes = 0;

errorFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ 文件不存在: ${filePath}`);
    return;
  }
  
  console.log(`\n🔧 修复文件: ${filePath}`);
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const originalLength = content.length;
  
  let fileFixes = 0;
  
  // 1. 修复未终止的字符串字面量
  // 查找所有未闭合的引号
  const lines = content.split('\n');
  let newContent = '';
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // 统计单引号和双引号的数量
    const singleQuotes = (line.match(/'/g) || []).length;
    const doubleQuotes = (line.match(/"/g) || []).length;
    
    // 如果单引号或双引号数量是奇数，说明可能未终止
    if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0) {
      console.log(`  ⚠️  行 ${i + 1} 可能有未终止的字符串: ${line.substring(0, 50)}...`);
      
      // 尝试在行尾添加缺失的引号
      if (singleQuotes % 2 !== 0 && !line.trim().endsWith("'")) {
        line = line + "'";
        fileFixes++;
      }
      if (doubleQuotes % 2 !== 0 && !line.trim().endsWith('"')) {
        line = line + '"';
        fileFixes++;
      }
    }
    
    newContent += line + '\n';
  }
  
  content = newContent;
  
  // 2. 修复常见的编码问题
  content = content.replace(/\$ /g, ''); // 移除奇怪的 $ 前缀
  content = content.replace(/\s\$\s/g, ' '); // 移除中间的 $
  content = content.replace(/' \$ /g, "' "); // 修复字符串中的 $
  
  // 3. 修复对象字面量语法错误
  content = content.replace(/\{\s*\}/g, '{}'); // 空对象
  content = content.replace(/\(\s*\)/g, '()'); // 空括号
  
  if (content.length !== originalLength || fileFixes > 0) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`  📝 文件已更新，修复 ${fileFixes} 处`);
    totalFixes += fileFixes;
  } else {
    console.log(`  ℹ️  无需修复`);
  }
});

console.log(`\n🎉 字符串修复完成！总计修复 ${totalFixes} 处`);
