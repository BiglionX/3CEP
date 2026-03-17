# 彻底清除 Next.js 缓存的 PowerShell 脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next.js 缓存清理工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 停止所有 Node 进程
Write-Host "1. 停止所有 Node 进程..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 检查项目目录
$projectPath = "d:\BigLionX\3cep"
if (-not (Test-Path $projectPath)) {
    Write-Host "错误: 项目目录不存在 $projectPath" -ForegroundColor Red
    exit 1
}

# 进入项目目录
Set-Location $projectPath

# 删除 .next 目录
$nextPath = Join-Path $projectPath ".next"
if (Test-Path $nextPath) {
    Write-Host "2. 删除 .next 目录..." -ForegroundColor Yellow
    Remove-Item -Path $nextPath -Recurse -Force
    Write-Host "   .next 目录已删除" -ForegroundColor Green
} else {
    Write-Host "2. .next 目录不存在，跳过" -ForegroundColor Gray
}

# 删除 node_modules/.cache
$cachePath = Join-Path $projectPath "node_modules\.cache"
if (Test-Path $cachePath) {
    Write-Host "3. 删除 node_modules\.cache 目录..." -ForegroundColor Yellow
    Remove-Item -Path $cachePath -Recurse -Force
    Write-Host "   node_modules\.cache 目录已删除" -ForegroundColor Green
} else {
    Write-Host "3. node_modules\.cache 目录不存在，跳过" -ForegroundColor Gray
}

# 删除 .turbo（如果存在）
$turboPath = Join-Path $projectPath ".turbo"
if (Test-Path $turboPath) {
    Write-Host "4. 删除 .turbo 目录..." -ForegroundColor Yellow
    Remove-Item -Path $turboPath -Recurse -Force
    Write-Host "   .turbo 目录已删除" -ForegroundColor Green
} else {
    Write-Host "4. .turbo 目录不存在，跳过" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "清理完成!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步操作:" -ForegroundColor Yellow
Write-Host "1. npm run dev      # 启动开发服务器" -ForegroundColor White
Write-Host "2. npm run build    # 或者构建生产版本" -ForegroundColor White
Write-Host ""
Write-Host "注意: 如果问题仍然存在，请尝试:" -ForegroundColor Yellow
Write-Host "  - 删除 node_modules 文件夹并重新安装依赖" -ForegroundColor White
Write-Host "  - 检查 package.json 中的依赖版本" -ForegroundColor White
