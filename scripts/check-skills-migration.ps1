# Skills 数据库迁移完整性检查脚本
# 使用方法：.\check-skills-migration.ps1

param(
    [string]$ConnectionString = $env:SUPABASE_DB_URL,
    [switch]$Detailed,
    [switch]$ExportReport
)

# 颜色定义
$ColorSuccess = "Green"
$ColorWarning = "Yellow"
$ColorError = "Red"
$ColorInfo = "Cyan"

Write-Host "========================================" -ForegroundColor $ColorInfo
Write-Host "🔍 Skills 数据库迁移完整性检查" -ForegroundColor $ColorInfo
Write-Host "========================================" -ForegroundColor $ColorInfo
Write-Host ""

if ([string]::IsNullOrEmpty($ConnectionString)) {
    Write-Host "❌ 错误：请设置 SUPABASE_DB_URL 环境变量或使用 -ConnectionString 参数" -ForegroundColor $ColorError
    exit 1
}

# 检查清单
$CheckList = @{
    Tables = @('skills', 'skill_categories', 'skill_audit_logs', 'skill_versions',
               'skill_orders', 'skill_reviews', 'skill_version_history', 'skill_executions',
               'skill_tags', 'skill_recommendations', 'skill_sandboxes', 'skill_documents')
    RequiredColumns = @{
        'skills' = @('id', 'name', 'title', 'description', 'category', 'review_status',
                     'shelf_status', 'price', 'developer_id', 'version')
        'skill_version_history' = @('skill_id', 'new_version', 'changes', 'changed_by', 'created_at')
        'skill_reviews' = @('skill_id', 'user_id', 'rating', 'content', 'is_approved')
    }
}

$TotalChecks = 0
$PassedChecks = 0
$FailedChecks = 0
$Warnings = 0

# 1. 检查表是否存在
Write-Host "📊 检查 1: 核心表结构" -ForegroundColor $ColorInfo
foreach ($table in $CheckList.Tables) {
    $TotalChecks++
    $query = "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table');"

    try {
        $result = Invoke-Sqlcmd -ConnectionString $ConnectionString -Query $query -ErrorAction Stop
        if ($result.Column1 -eq $true) {
            Write-Host "  ✅ $table" -ForegroundColor $ColorSuccess
            $PassedChecks++
        } else {
            Write-Host "  ❌ $table (缺失)" -ForegroundColor $ColorError
            $FailedChecks++
        }
    } catch {
        Write-Host "  ❌ $table (检查失败：$($_.Exception.Message))" -ForegroundColor $ColorError
        $FailedChecks++
    }
}

Write-Host ""

# 2. 检查关键字段
Write-Host "📋 检查 2: 关键字段" -ForegroundColor $ColorInfo
foreach ($tableEntry in $CheckList.RequiredColumns.GetEnumerator()) {
    $tableName = $tableEntry.Key
    $columns = $tableEntry.Value

    foreach ($column in $columns) {
        $TotalChecks++
        $query = "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = '$tableName' AND column_name = '$column');"

        try {
            $result = Invoke-Sqlcmd -ConnectionString $ConnectionString -Query $query -ErrorAction Stop
            if ($result.Column1 -eq $true) {
                if ($Detailed) {
                    Write-Host "  ✅ $tableName.$column" -ForegroundColor $ColorSuccess
                }
                $PassedChecks++
            } else {
                Write-Host "  ❌ $tableName.$column (缺失)" -ForegroundColor $ColorError
                $FailedChecks++
            }
        } catch {
            Write-Host "  ❌ $tableName.$column (检查失败)" -ForegroundColor $ColorError
            $FailedChecks++
        }
    }
}

Write-Host ""

# 3. 检查 RLS 策略
Write-Host "🔒 检查 3: RLS 策略" -ForegroundColor $ColorInfo
$TotalChecks++
$query = @"
SELECT COUNT(*) FROM pg_policies
WHERE schemaname = 'public' AND tablename LIKE 'skill_%';
"@

try {
    $result = Invoke-Sqlcmd -ConnectionString $ConnectionString -Query $query -ErrorAction Stop
    $policyCount = $result.Column1

    if ($policyCount -ge 20) {
        Write-Host "  ✅ RLS 策略：$policyCount 个" -ForegroundColor $ColorSuccess
        $PassedChecks++
    } elseif ($policyCount -gt 0) {
        Write-Host "  ⚠️  RLS 策略：$policyCount 个 (可能不完整)" -ForegroundColor $ColorWarning
        $Warnings++
        $PassedChecks++
    } else {
        Write-Host "  ❌ RLS 策略：未找到" -ForegroundColor $ColorError
        $FailedChecks++
    }
} catch {
    Write-Host "  ❌ RLS 策略检查失败" -ForegroundColor $ColorError
    $FailedChecks++
}

Write-Host ""

# 4. 检查索引
Write-Host "📑 检查 4: 索引优化" -ForegroundColor $ColorInfo
$TotalChecks++
$query = @"
SELECT COUNT(*) FROM pg_indexes
WHERE schemaname = 'public' AND tablename LIKE 'skill_%';
"@

try {
    $result = Invoke-Sqlcmd -ConnectionString $ConnectionString -Query $query -ErrorAction Stop
    $indexCount = $result.Column1

    if ($indexCount -ge 30) {
        Write-Host "  ✅ 索引：$indexCount 个" -ForegroundColor $ColorSuccess
        $PassedChecks++
    } elseif ($indexCount -gt 0) {
        Write-Host "  ⚠️  索引：$indexCount 个 (可能不完整)" -ForegroundColor $ColorWarning
        $Warnings++
        $PassedChecks++
    } else {
        Write-Host "  ❌ 索引：未找到" -ForegroundColor $ColorError
        $FailedChecks++
    }
} catch {
    Write-Host "  ❌ 索引检查失败" -ForegroundColor $ColorError
    $FailedChecks++
}

Write-Host ""

# 5. 检查默认数据
Write-Host "📝 检查 5: 默认数据" -ForegroundColor $ColorInfo
$TotalChecks++
$query = "SELECT COUNT(*) FROM skill_categories;"

try {
    $result = Invoke-Sqlcmd -ConnectionString $ConnectionString -Query $query -ErrorAction Stop
    $categoryCount = $result.Column1

    if ($categoryCount -ge 8) {
        Write-Host "  ✅ 分类数据：$categoryCount 个" -ForegroundColor $ColorSuccess
        $PassedChecks++
    } else {
        Write-Host "  ⚠️  分类数据：$categoryCount 个 (可能不完整)" -ForegroundColor $ColorWarning
        $Warnings++
        $PassedChecks++
    }
} catch {
    Write-Host "  ❌ 分类数据检查失败" -ForegroundColor $ColorError
    $FailedChecks++
}

Write-Host ""

# 总结报告
Write-Host "========================================" -ForegroundColor $ColorInfo
Write-Host "📊 检查完成统计:" -ForegroundColor $ColorInfo
Write-Host "========================================" -ForegroundColor $ColorInfo
Write-Host "  总检查项：$TotalChecks"
Write-Host "  ✅ 通过：$PassedChecks" -ForegroundColor $ColorSuccess
Write-Host "  ❌ 失败：$FailedChecks" -ForegroundColor $ColorError
Write-Host "  ⚠️  警告：$Warnings" -ForegroundColor $ColorWarning
Write-Host ""

$PassRate = [math]::Round(($PassedChecks / $TotalChecks) * 100, 2)
Write-Host "  通过率：$PassRate%" -ForegroundColor $(if ($PassRate -eq 100) { $ColorSuccess } elseif ($PassRate -ge 80) { $ColorWarning } else { $ColorError })

Write-Host ""

if ($FailedChecks -eq 0 -and $Warnings -eq 0) {
    Write-Host "🎉 恭喜！所有检查通过，Skills 迁移已完成！" -ForegroundColor $ColorSuccess
    exit 0
} elseif ($FailedChecks -eq 0) {
    Write-Host "✅ 主要检查通过，但有一些警告需要注意" -ForegroundColor $ColorWarning
    exit 0
} else {
    Write-Host "❌ 检查失败，请重新执行缺失的迁移脚本" -ForegroundColor $ColorError
    Write-Host ""
    Write-Host "建议执行步骤:" -ForegroundColor $ColorInfo
    Write-Host "  1. 打开 Supabase SQL Editor"
    Write-Host "  2. 按顺序执行迁移脚本：034 -> 035 -> ... -> 044"
    Write-Host "  3. 重新运行此检查脚本"
    exit 1
}
