const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/diagnosis/page.tsx');

console.log('检查 diagnosis/page.tsx...');
let content = fs.readFileSync(filePath, 'utf8');

// 检查并修复所有问题
let hasChanges = false;

// 1. 检查quickQuestions数组
if (content.includes('keyword: "手机无法开机" },')) {
  content = content.replace('keyword: "手机无法开机" },', 'keyword: "手机无法开机" },');
  console.log('✓ 修复quickQuestions数组');
  hasChanges = true;
}

// 2. 检查formatDiagnosisResponse函数位置
if (content.includes('const formattedResponse = formatDiagnosisResponse(')) {
  console.log('✓ formatDiagnosisResponse调用存在');
}

if (content.includes('const formatDiagnosisResponse = (diagnosisResult: any): string => {')) {
  console.log('✓ formatDiagnosisResponse定义存在');
}

// 3. 检查文件结尾
if (!content.endsWith('}\n')) {
  content = content.trim() + '\n';
  console.log('✓ 修复文件结尾');
  hasChanges = true;
}

if (hasChanges) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('\n✓ 文件已更新');
} else {
  console.log('\n- 没有发现需要修复的问题');
}

console.log('\n检查完成!');
