# Supabase CLI 自动安装脚本 (PowerShell)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Supabase CLI 自动安装脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 下载 URL
$downloadUrl = "https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.exe"
$tempPath = "$env:TEMP\supabase_windows_amd64.exe"
$installPath = "$env:USERPROFILE\AppData\Local\Programs\supabase.exe"

# 检查是否已安装
Write-Host "检查 Supabase CLI 是否已安装..." -ForegroundColor Yellow
try {
    $existingVersion = supabase --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "已安装: $existingVersion" -ForegroundColor Green
        $choice = Read-Host "是否重新安装? (y/n)"
        if ($choice -ne 'y') {
            exit
        }
    }
} catch {
    Write-Host "未安装，开始下载..." -ForegroundColor Yellow
}

# 创建目录
$installDir = Split-Path $installPath
if (-not (Test-Path $installDir)) {
    New-Item -ItemType Directory -Path $installDir -Force | Out-Null
}

# 下载文件
Write-Host "正在下载 Supabase CLI..." -ForegroundColor Yellow
try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $downloadUrl -OutFile $tempPath -UseBasicParsing
    Write-Host "下载完成!" -ForegroundColor Green
} catch {
    Write-Host "下载失败: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "请手动下载并安装:" -ForegroundColor Yellow
    Write-Host "1. 访问: https://github.com/supabase/cli/releases" -ForegroundColor Yellow
    Write-Host "2. 下载 supabase_windows_amd64.exe" -ForegroundColor Yellow
    Write-Host "3. 重命名为 supabase.exe 并移动到系统 PATH" -ForegroundColor Yellow
    exit 1
}

# 安装
Write-Host "正在安装..." -ForegroundColor Yellow
Move-Item $tempPath $installPath -Force

# 添加到 PATH
$envPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($envPath -notlike "*$installDir*") {
    Write-Host "添加到 PATH..." -ForegroundColor Yellow
    [Environment]::SetEnvironmentVariable("Path", "$envPath;$installDir", "User")
    Write-Host "已添加到用户 PATH (需要重启终端生效)" -ForegroundColor Green
}

# 验证安装
Write-Host ""
Write-Host "验证安装..." -ForegroundColor Yellow
$env:Path += ";$installDir"
try {
    $version = supabase --version
    Write-Host "安装成功! 版本: $version" -ForegroundColor Green
} catch {
    Write-Host "验证失败，请检查安装" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "安装完成!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "使用方法:" -ForegroundColor Yellow
Write-Host "  supabase login                    # 登录 Supabase" -ForegroundColor White
Write-Host "  supabase link --project-ref xxx  # 链接项目" -ForegroundColor White
Write-Host "  supabase db push                 # 运行迁移" -ForegroundColor White
Write-Host ""
Write-Host "注意: 如果命令未找到，请重启 PowerShell 或 CMD" -ForegroundColor Yellow
