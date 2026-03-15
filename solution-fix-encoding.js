const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== 编码问题终极修复方案 ===\n');

// 1. 检查是否有 .bak 文件可以参考
console.log('1. 检查 .bak 备份文件...');
const backupFiles = execSync('git diff --cached --name-only | findstr ".bak"', { encoding: 'utf8', cwd: __dirname });
console.log(backupFiles ? '发现 .bak 文件，这些可能是正确的版本' : '没有发现 .bak 文件');

// 2. 检查暂存区中的修改
console.log('\n2. 分析暂存区修改...');
const cachedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8', cwd: __dirname });
const files = cachedFiles.split('\n').filter(f => f.trim().endsWith('.tsx') || f.trim().endsWith('.ts'));
console.log(`暂存区中有 ${files.length} 个 TS/TSX 文件`);

// 3. 建议清理策略
console.log('\n=== 建议的修复步骤 ===');
console.log('步骤 1: 清空暂存区');
console.log('步骤 2: 找到正确的 git 提交（编码损坏之前的）');
console.log('步骤 3: 恢复所有文件到正确版本');
console.log('步骤 4: 逐个检查文件，确认没有编码问题');
console.log('步骤 5: 只提交确认正确的文件');

// 4. 尝试找到正确的提交
console.log('\n3. 查找可能的正确提交...');
try {
  const history = execSync('git log --all --oneline --before="2026-03-12" -- src/app/ | head -10', {
    encoding: 'utf8',
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'ignore']
  });
  console.log('在 2026-03-12 之前的提交（可能没有编码问题）:');
  console.log(history);
} catch (e) {
  console.log('无法找到早期提交历史');
}

// 5. 创建清理脚本
console.log('\n4. 创建清理和恢复脚本...');

const cleanScript = `# PowerShell 清理脚本
# 步骤 1: 清空暂存区
git reset HEAD

# 步骤 2: 查看当前状态
git status

# 步骤 3: 如果需要，恢复到某个特定提交（替换 <commit-hash>）
# git checkout <commit-hash> -- src/app/

# 步骤 4: 逐个检查和修复文件
# 建议使用 IDE 的 linting 工具检查每个文件

# 步骤 5: 只提交确认正确的文件
# git add src/app/specific-file/page.tsx
# git commit -m "fix: 修复编码问题"
`;

fs.writeFileSync(path.join(__dirname, 'clean-and-fix.ps1'), cleanScript, 'utf8');
console.log('已创建清理脚本: clean-and-fix.ps1');

console.log('\n=== 建议 ===');
console.log('1. 先查看 clean-and-fix.ps1 脚本');
console.log('2. 根据实际情况调整脚本内容');
console.log('3. 手动执行清理步骤');
console.log('4. 使用 IDE 的 linting 工具逐个检查文件');
console.log('5. 确认每个文件都正确后再提交');
