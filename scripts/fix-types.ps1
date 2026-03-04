# 批量修复 TypeScript 语法错误：any: -> (value:
# 这种错误通常是由于复制粘贴导致的类型注解错误

$ErrorActionPreference = "Continue"
$filesFixed = 0
$totalErrors = 0

Write-Host "🔧 开始修复 TypeScript 语法错误..." -ForegroundColor Cyan

# 定义需要修复的文件列表（从 grep 结果获取）
$filesToFix = @(
    "src\components\LikeButton.tsx",
    "src\components\auth\UnifiedLogin.tsx",
    "src\components\admin\ConfigManager.tsx",
    "src\lib\image-optimizer.ts",
    "src\components\TenantSwitcher.tsx",
    "src\components\forms\PurchaseOrderForm.tsx",
    "src\components\fcx\FcxEquityCenter.tsx",
    "src\components\enhanced-rbac\PermissionManagementPanel.tsx",
    "src\lib\isolated-auth-service.ts",
    "src\components\UploadForm.tsx",
    "src\components\notifications\notification-system.tsx",
    "src\components\MLPredictionDashboard.tsx",
    "src\components\admin\CreateInboundForecastForm.tsx",
    "src\components\admin\ApiConfigManager.tsx",
    "src\components\tutorial\StepByStepTutorial.tsx",
    "src\components\enhanced-error-boundary.tsx",
    "src\components\crowdfunding\UpgradeRecommendationList.tsx",
    "src\lib\unified-auth.ts",
    "src\lib\image-static-optimizer.ts",
    "src\lib\edge-cache-strategy.ts"
)

foreach ($file in $filesToFix) {
    $filePath = Join-Path $PSScriptRoot ".." $file

    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw -Encoding UTF8

        # 修复模式：(param: any: Type) -> (param: Type)
        $newContent = $content -replace '(\w+):\s*any:\s*(\w+(?:<[^>]+>)?)', '$1: $2'

        # 修复模式：async (param: any: Type) -> async (param: Type)
        $newContent = $newContent -replace 'async\s+\((\w+):\s*any:\s*(\w+(?:<[^>]+>)?)\)', 'async ($1: $2)'

        # 修复模式：map(async (item: any: Type) -> map(async (item: Type)
        $newContent = $newContent -replace 'map\(async\s+(\w+):\s*any:\s*(\w+(?:<[^>]+>)?)\)', 'map(async $1: $2)'

        if ($content -ne $newContent) {
            # 备份原文件
            $backupPath = "$filePath.backup-fix"
            Copy-Item $filePath $backupPath

            # 写入修复后的内容
            Set-Content $filePath $newContent -Encoding UTF8 -NoNewline

            Write-Host "✓ 已修复：$file" -ForegroundColor Green
            $filesFixed++
            $totalErrors++
        } else {
            Write-Host "⚠ 无需修复：$file" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✗ 文件不存在：$file" -ForegroundColor Red
    }
}

Write-Host "`n" + ("=" * 35) -ForegroundColor Cyan
Write-Host "修复完成！" -ForegroundColor Green
Write-Host "已修复文件数：$filesFixed" -ForegroundColor Green
Write-Host "总计修复错误：$totalErrors" -ForegroundColor Green
Write-Host ("=" * 35) -ForegroundColor Cyan
