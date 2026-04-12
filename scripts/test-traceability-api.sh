#!/bin/bash

# 溯源码插件 API 测试脚本
# 使用方法: bash scripts/test-traceability-api.sh

BASE_URL="http://localhost:3000"

echo "=========================================="
echo "  溯源码插件 API 测试"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数器
TOTAL=0
PASSED=0
FAILED=0

# 辅助函数：打印测试结果
print_result() {
    TOTAL=$((TOTAL + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ 测试通过${NC}: $2"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ 测试失败${NC}: $2"
        FAILED=$((FAILED + 1))
    fi
}

# 测试1: 批量生成溯源码
echo -e "${YELLOW}[测试 1] 批量生成溯源码${NC}"
GENERATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/traceability/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantProductId": "00000000-0000-0000-0000-000000000000",
    "productLibraryId": null,
    "sku": "TEST-SKU-001",
    "productName": "测试产品",
    "codeType": "qr",
    "quantity": 5,
    "expiresInDays": 365
  }')

echo "响应: $GENERATE_RESPONSE" | head -c 200
echo ""

if echo "$GENERATE_RESPONSE" | grep -q '"success":true'; then
    print_result 0 "批量生成溯源码"

    # 提取第一个溯源码ID用于后续测试
    TRACEABILITY_ID=$(echo "$GENERATE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    TRACEABILITY_CODE=$(echo "$GENERATE_RESPONSE" | grep -o '"code":"[^"]*"' | head -1 | cut -d'"' -f4)

    echo "  溯源码ID: $TRACEABILITY_ID"
    echo "  溯源码: $TRACEABILITY_CODE"
else
    print_result 1 "批量生成溯源码"
fi

echo ""

# 测试2: 验证溯源码
if [ ! -z "$TRACEABILITY_CODE" ]; then
    echo -e "${YELLOW}[测试 2] 验证溯源码${NC}"
    VERIFY_RESPONSE=$(curl -s "$BASE_URL/api/traceability/verify/$TRACEABILITY_CODE")

    echo "响应: $VERIFY_RESPONSE"

    if echo "$VERIFY_RESPONSE" | grep -q '"is_valid":true'; then
        print_result 0 "验证溯源码有效性"
    else
        print_result 1 "验证溯源码有效性"
    fi

    echo ""
fi

# 测试3: 获取溯源历史
if [ ! -z "$TRACEABILITY_ID" ]; then
    echo -e "${YELLOW}[测试 3] 获取溯源历史${NC}"
    HISTORY_RESPONSE=$(curl -s "$BASE_URL/api/traceability/$TRACEABILITY_ID/history")

    echo "响应: $HISTORY_RESPONSE" | head -c 300
    echo ""

    if echo "$HISTORY_RESPONSE" | grep -q '"success":true'; then
        print_result 0 "获取溯源历史"
    else
        print_result 1 "获取溯源历史"
    fi

    echo ""

    # 测试4: 记录生命周期事件 - 入库
    echo -e "${YELLOW}[测试 4] 记录入库事件${NC}"
    EVENT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/traceability/$TRACEABILITY_ID/event" \
      -H "Content-Type: application/json" \
      -d '{
        "eventType": "warehouse_in",
        "location": "北京仓库A区",
        "operator": "张三",
        "notes": "产品入库检查通过",
        "metadata": {
          "batchNumber": "BATCH-2026-001",
          "inspector": "李四"
        }
      }')

    echo "响应: $EVENT_RESPONSE"

    if echo "$EVENT_RESPONSE" | grep -q '"success":true'; then
        print_result 0 "记录入库事件"
    else
        print_result 1 "记录入库事件"
    fi

    echo ""

    # 测试5: 记录出库事件
    echo -e "${YELLOW}[测试 5] 记录出库事件${NC}"
    OUT_EVENT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/traceability/$TRACEABILITY_ID/event" \
      -H "Content-Type: application/json" \
      -d '{
        "eventType": "warehouse_out",
        "location": "北京仓库A区",
        "operator": "王五",
        "notes": "产品出库发货"
      }')

    echo "响应: $OUT_EVENT_RESPONSE"

    if echo "$OUT_EVENT_RESPONSE" | grep -q '"success":true'; then
        print_result 0 "记录出库事件"
    else
        print_result 1 "记录出库事件"
    fi

    echo ""

    # 测试6: 记录销售事件
    echo -e "${YELLOW}[测试 6] 记录销售事件${NC}"
    SALES_EVENT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/traceability/$TRACEABILITY_ID/event" \
      -H "Content-Type: application/json" \
      -d '{
        "eventType": "sales",
        "notes": "产品销售",
        "metadata": {
          "customerId": "CUST-001",
          "customerName": "客户A",
          "orderId": "ORDER-2026-001"
        }
      }')

    echo "响应: $SALES_EVENT_RESPONSE"

    if echo "$SALES_EVENT_RESPONSE" | grep -q '"success":true'; then
        print_result 0 "记录销售事件"
    else
        print_result 1 "记录销售事件"
    fi

    echo ""

    # 测试7: 再次获取溯源历史（应该有3个事件）
    echo -e "${YELLOW}[测试 7] 验证事件记录完整性${NC}"
    UPDATED_HISTORY=$(curl -s "$BASE_URL/api/traceability/$TRACEABILITY_ID/history")

    EVENT_COUNT=$(echo "$UPDATED_HISTORY" | grep -o '"type"' | wc -l)
    echo "事件数量: $EVENT_COUNT"

    if [ "$EVENT_COUNT" -ge 3 ]; then
        print_result 0 "事件记录完整性（期望>=3个，实际$EVENT_COUNT个）"
    else
        print_result 1 "事件记录完整性（期望>=3个，实际$EVENT_COUNT个）"
    fi

    echo ""
fi

# 测试8: 验证不存在的溯源码
echo -e "${YELLOW}[测试 8] 验证不存在的溯源码${NC}"
INVALID_RESPONSE=$(curl -s "$BASE_URL/api/traceability/verify/TRC-INVALID-CODE")

echo "响应: $INVALID_RESPONSE"

if echo "$INVALID_RESPONSE" | grep -q '"is_valid":false'; then
    print_result 0 "验证不存在的溯源码"
else
    print_result 1 "验证不存在的溯源码"
fi

echo ""

# 打印总结
echo "=========================================="
echo "  测试总结"
echo "=========================================="
echo -e "总测试数: ${TOTAL}"
echo -e "${GREEN}通过: ${PASSED}${NC}"
echo -e "${RED}失败: ${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！${NC}"
    exit 0
else
    echo -e "${RED}⚠️  有测试失败，请检查日志${NC}"
    exit 1
fi
