# 执行品牌数据迁移脚本
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  执行品牌数据冷启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$sqlFile = "supabase/migrations/023_seed_3c_brands.sql"

if (Test-Path $sqlFile) {
    Write-Host "✅ SQL文件存在: $sqlFile" -ForegroundColor Green

    $lineCount = (Get-Content $sqlFile | Measure-Object -Line).Lines
    Write-Host "   文件大小: $lineCount 行" -ForegroundColor Gray

    Write-Host ""
    Write-Host "请手动在Supabase Dashboard中执行此SQL文件：" -ForegroundColor Yellow
    Write-Host "1. 打开 Supabase Dashboard" -ForegroundColor White
    Write-Host "2. 进入 SQL Editor" -ForegroundColor White
    Write-Host "3. 复制并粘贴 $sqlFile 的内容" -ForegroundColor White
    Write-Host "4. 点击 Run 执行" -ForegroundColor White
    Write-Host ""
    Write-Host "或者使用以下命令（需要配置Supabase CLI）：" -ForegroundColor Yellow
    Write-Host "npx supabase db push" -ForegroundColor Gray
} else {
    Write-Host "❌ SQL文件不存在: $sqlFile" -ForegroundColor Red
}
