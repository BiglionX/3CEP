#!/bin/bash
# 清理 Git 历史中的敏感信息
# 将文件中的敏感字符串替换为安全版本

echo "准备清理 Git 历史..."

# 创建临时分支进行清理
git checkout -b cleanup-history-$(date +%s)

# 使用 filter-branch 清理历史
git filter-branch --force --index-filter "
  git rm --cached --ignore-unmatch fix-encoding-api-config.js
" --prune-empty --tag-name-filter cat -- --all

echo "Git 历史清理完成!"
echo "如果成功,请执行:"
echo "  git push origin --force --all"
echo "  git push origin --force --tags"
