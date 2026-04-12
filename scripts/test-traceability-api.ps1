# 溯源码插件 API 测试脚本 (PowerShell版本)
# 使用方法: .\scripts\test-traceability-api.ps1

$BASE_URL = "http://localhost:3001"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  溯源码插件 API 测试" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 测试计数器
$TOTAL = 0
$PASSED = 0
$FAILED = 0

# 辅助函数：打印测试结果
function Print-Result {
    param([bool]$success, [string]$testName)
    $script:TOTAL++
    if ($success) {
        Write-Host "✅ 测试通过: $testName" -ForegroundColor Green
        $script:PASSED++
    } else {
        Write-Host "❌ 测试失败: $testName" -ForegroundColor Red
        $script:FAILED++
    }
}

# 测试1: 批量生成溯源码
Write-Host "[测试 1] 批量生成溯源码" -ForegroundColor Yellow
try {
    $body = @{
        tenantProductId = "00000000-0000-0000-0000-000000000000"
        productLibraryId = $null
        sku = "TEST-SKU-001"
        productName = "测试产品"
        codeType = "qr"
        quantity = 5
        expiresInDays = 365
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL/api/traceability/generate" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body

    Write-Host "响应: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Gray

    if ($response.success) {
        Print-Result -success $true -testName "批量生成溯源码"

        # 提取第一个溯源码信息
        $firstCode = $response.data.codes[0]
        $TRACEABILITY_ID = $firstCode.id
        $TRACEABILITY_CODE = $firstCode.code

        Write-Host "  溯源码ID: $TRACEABILITY_ID" -ForegroundColor Cyan
        Write-Host "  溯源码: $TRACEABILITY_CODE" -ForegroundColor Cyan
    } else {
        Print-Result -success $false -testName "批量生成溯源码"
        Write-Host "  错误: $($response.error)" -ForegroundColor Red
    }
} catch {
    Print-Result -success $false -testName "批量生成溯源码"
    Write-Host "  错误: $_" -ForegroundColor Red
}

Write-Host ""

# 测试2: 验证溯源码
if ($TRACEABILITY_CODE) {
    Write-Host "[测试 2] 验证溯源码" -ForegroundColor Yellow
    try {
        $verifyResponse = Invoke-RestMethod -Uri "$BASE_URL/api/traceability/verify/$TRACEABILITY_CODE" `
            -Method GET

        Write-Host "响应: $($verifyResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Gray

        if ($verifyResponse.data.is_valid) {
            Print-Result -success $true -testName "验证溯源码有效性"
        } else {
            Print-Result -success $false -testName "验证溯源码有效性"
        }
    } catch {
        Print-Result -success $false -testName "验证溯源码有效性"
        Write-Host "  错误: $_" -ForegroundColor Red
    }

    Write-Host ""
}

# 测试3: 获取溯源历史
if ($TRACEABILITY_ID) {
    Write-Host "[测试 3] 获取溯源历史" -ForegroundColor Yellow
    try {
        $historyResponse = Invoke-RestMethod -Uri "$BASE_URL/api/traceability/$TRACEABILITY_ID/history" `
            -Method GET

        Write-Host "响应: $($historyResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Gray

        if ($historyResponse.success) {
            Print-Result -success $true -testName "获取溯源历史"
        } else {
            Print-Result -success $false -testName "获取溯源历史"
        }
    } catch {
        Print-Result -success $false -testName "获取溯源历史"
        Write-Host "  错误: $_" -ForegroundColor Red
    }

    Write-Host ""

    # 测试4: 记录入库事件
    Write-Host "[测试 4] 记录入库事件" -ForegroundColor Yellow
    try {
        $eventBody = @{
            eventType = "warehouse_in"
            location = "北京仓库A区"
            operator = "张三"
            notes = "产品入库检查通过"
            metadata = @{
                batchNumber = "BATCH-2026-001"
                inspector = "李四"
            }
        } | ConvertTo-Json -Depth 3

        $eventResponse = Invoke-RestMethod -Uri "$BASE_URL/api/traceability/$TRACEABILITY_ID/event" `
            -Method POST `
            -ContentType "application/json" `
            -Body $eventBody

        Write-Host "响应: $($eventResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Gray

        if ($eventResponse.success) {
            Print-Result -success $true -testName "记录入库事件"
        } else {
            Print-Result -success $false -testName "记录入库事件"
        }
    } catch {
        Print-Result -success $false -testName "记录入库事件"
        Write-Host "  错误: $_" -ForegroundColor Red
    }

    Write-Host ""

    # 测试5: 记录出库事件
    Write-Host "[测试 5] 记录出库事件" -ForegroundColor Yellow
    try {
        $outEventBody = @{
            eventType = "warehouse_out"
            location = "北京仓库A区"
            operator = "王五"
            notes = "产品出库发货"
        } | ConvertTo-Json

        $outEventResponse = Invoke-RestMethod -Uri "$BASE_URL/api/traceability/$TRACEABILITY_ID/event" `
            -Method POST `
            -ContentType "application/json" `
            -Body $outEventBody

        Write-Host "响应: $($outEventResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Gray

        if ($outEventResponse.success) {
            Print-Result -success $true -testName "记录出库事件"
        } else {
            Print-Result -success $false -testName "记录出库事件"
        }
    } catch {
        Print-Result -success $false -testName "记录出库事件"
        Write-Host "  错误: $_" -ForegroundColor Red
    }

    Write-Host ""

    # 测试6: 记录销售事件
    Write-Host "[测试 6] 记录销售事件" -ForegroundColor Yellow
    try {
        $salesEventBody = @{
            eventType = "sales"
            notes = "产品销售"
            metadata = @{
                customerId = "CUST-001"
                customerName = "客户A"
                orderId = "ORDER-2026-001"
            }
        } | ConvertTo-Json -Depth 3

        $salesEventResponse = Invoke-RestMethod -Uri "$BASE_URL/api/traceability/$TRACEABILITY_ID/event" `
            -Method POST `
            -ContentType "application/json" `
            -Body $salesEventBody

        Write-Host "响应: $($salesEventResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Gray

        if ($salesEventResponse.success) {
            Print-Result -success $true -testName "记录销售事件"
        } else {
            Print-Result -success $false -testName "记录销售事件"
        }
    } catch {
        Print-Result -success $false -testName "记录销售事件"
        Write-Host "  错误: $_" -ForegroundColor Red
    }

    Write-Host ""

    # 测试7: 再次获取溯源历史（应该有多个事件）
    Write-Host "[测试 7] 验证事件记录完整性" -ForegroundColor Yellow
    try {
        $updatedHistory = Invoke-RestMethod -Uri "$BASE_URL/api/traceability/$TRACEABILITY_ID/history" `
            -Method GET

        $eventCount = $updatedHistory.data.lifecycleEvents.Count
        Write-Host "事件数量: $eventCount" -ForegroundColor Cyan

        if ($eventCount -ge 3) {
            Print-Result -success $true -testName "事件记录完整性（期望>=3个，实际$eventCount个）"
        } else {
            Print-Result -success $false -testName "事件记录完整性（期望>=3个，实际$eventCount个）"
        }
    } catch {
        Print-Result -success $false -testName "验证事件记录完整性"
        Write-Host "  错误: $_" -ForegroundColor Red
    }

    Write-Host ""
}

# 测试8: 验证不存在的溯源码
Write-Host "[测试 8] 验证不存在的溯源码" -ForegroundColor Yellow
try {
    $invalidResponse = Invoke-RestMethod -Uri "$BASE_URL/api/traceability/verify/TRC-INVALID-CODE" `
        -Method GET

    Write-Host "响应: $($invalidResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Gray

    if (-not $invalidResponse.data.is_valid) {
        Print-Result -success $true -testName "验证不存在的溯源码"
    } else {
        Print-Result -success $false -testName "验证不存在的溯源码"
    }
} catch {
    # 404错误也是预期的
    if ($_.Exception.Response.StatusCode -eq 404) {
        Print-Result -success $true -testName "验证不存在的溯源码（返回404）"
    } else {
        Print-Result -success $false -testName "验证不存在的溯源码"
        Write-Host "  错误: $_" -ForegroundColor Red
    }
}

Write-Host ""

# 打印总结
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  测试总结" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "总测试数: $TOTAL" -ForegroundColor White
Write-Host "通过: $PASSED" -ForegroundColor Green
Write-Host "失败: $FAILED" -ForegroundColor Red
Write-Host ""

if ($FAILED -eq 0) {
    Write-Host "🎉 所有测试通过！" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  有测试失败，请检查日志" -ForegroundColor Yellow
    exit 1
}
