# 清理 Git 历史中的敏感信息
Write-Host "准备清理 Git 历史..."

# 创建临时分支进行清理
$tempBranch = "cleanup-history-" + (Get-Date -Format "yyyyMMddHHmmss")
Write-Host "创建临时分支: $tempBranch"
git checkout -b $tempBranch

# 使用 filter-branch 清理历史
Write-Host "正在清理历史...这可能需要一些时间"
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch fix-encoding-api-config.js" --prune-empty --tag-name-filter cat -- --all

if ($LASTEXITCODE -eq 0) {
    Write-Host "Git 历史清理完成!" -ForegroundColor Green
    Write-Host "请执行以下命令强制推送:"
    Write-Host "  git push --set-upstream ProCyc $tempBranch --force --all"
    Write-Host "  git push --force --tags"
} else {
    Write-Host "清理过程中出现错误" -ForegroundColor Red
}
