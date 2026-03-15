# PowerShell 清理脚本
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
