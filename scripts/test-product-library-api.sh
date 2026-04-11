#!/bin/bash
# 产品库模块 API 测试脚本
# 使用方法: ./test-product-library-api.sh

BASE_URL="http://localhost:3000/api/product-library"

echo "=========================================="
echo "  产品库模块 API 测试"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试结果统计
PASS=0
FAIL=0

# 测试函数
test_api() {
  local name=$1
  local method=$2
  local url=$3
  local data=$4

  echo -e "${YELLOW}测试: $name${NC}"

  if [ "$method" == "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "$url")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url")
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    echo -e "${GREEN}✓ 通过 (HTTP $http_code)${NC}"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}✗ 失败 (HTTP $http_code)${NC}"
    FAIL=$((FAIL + 1))
  fi

  echo "响应: $(echo $body | head -c 200)..."
  echo ""
}

echo "开始测试..."
echo ""

# 1. 测试品牌 API
echo "========== 品牌管理 =========="
test_api "获取品牌列表" "GET" "$BASE_URL/brands"

test_api "创建品牌" "POST" "$BASE_URL/brands" '{
  "name": "Test Brand",
  "websiteUrl": "https://test.com",
  "contactEmail": "test@test.com"
}'

# 2. 测试产品 API
echo "========== 产品管理 =========="
test_api "获取产品列表" "GET" "$BASE_URL/products"

# 注意: 需要先获取一个有效的 brandId
BRAND_ID=$(curl -s "$BASE_URL/brands" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$BRAND_ID" ]; then
  test_api "创建产品" "POST" "$BASE_URL/products" "{
    \"skuCode\": \"TEST-$(date +%s)\",
    \"brandId\": \"$BRAND_ID\",
    \"name\": \"Test Product\",
    \"description\": \"This is a test product\",
    \"specifications\": {\"color\": \"black\", \"weight\": \"1kg\"}
  }"
else
  echo -e "${RED}⚠ 跳过产品创建测试（未找到品牌ID）${NC}"
  echo ""
fi

# 3. 测试配件 API
echo "========== 配件管理 =========="
test_api "获取配件列表" "GET" "$BASE_URL/accessories"

if [ -n "$BRAND_ID" ]; then
  test_api "创建配件" "POST" "$BASE_URL/accessories" "{
    \"skuCode\": \"ACC-$(date +%s)\",
    \"brandId\": \"$BRAND_ID\",
    \"name\": \"Test Accessory\",
    \"compatibleProducts\": []
  }"
else
  echo -e "${RED}⚠ 跳过配件创建测试（未找到品牌ID）${NC}"
  echo ""
fi

# 4. 测试部件 API
echo "========== 部件管理 =========="
test_api "获取部件列表" "GET" "$BASE_URL/components"

if [ -n "$BRAND_ID" ]; then
  test_api "创建部件" "POST" "$BASE_URL/components" "{
    \"skuCode\": \"COMP-$(date +%s)\",
    \"brandId\": \"$BRAND_ID\",
    \"name\": \"Test Component\",
    \"type\": \"memory\"
  }"
else
  echo -e "${RED}⚠ 跳过部件创建测试（未找到品牌ID）${NC}"
  echo ""
fi

# 5. 测试零件 API
echo "========== 零件管理 =========="
test_api "获取零件列表" "GET" "$BASE_URL/parts"

test_api "创建零件" "POST" "$BASE_URL/parts" "{
  \"skuCode\": \"PART-$(date +%s)\",
  \"name\": \"Test Part\",
  \"type\": \"screw\",
  \"material\": \"Steel\",
  \"dimensions\": {\"length\": 10, \"width\": 2, \"height\": 2, \"unit\": \"mm\"}
}"

# 6. 测试搜索功能
echo "========== 搜索功能 =========="
test_api "搜索产品（关键词）" "GET" "$BASE_URL/products?search=Test"

if [ -n "$BRAND_ID" ]; then
  test_api "搜索产品（按品牌）" "GET" "$BASE_URL/products?brandId=$BRAND_ID"
fi

test_api "搜索配件（按类型）" "GET" "$BASE_URL/accessories?search=Test"
test_api "搜索部件（按类型）" "GET" "$BASE_URL/components?type=memory"
test_api "搜索零件（按材质）" "GET" "$BASE_URL/parts?type=screw"

# 测试结果汇总
echo ""
echo "=========================================="
echo "  测试结果汇总"
echo "=========================================="
echo -e "${GREEN}通过: $PASS${NC}"
echo -e "${RED}失败: $FAIL${NC}"
echo "总计: $((PASS + FAIL))"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}🎉 所有测试通过！${NC}"
  exit 0
else
  echo -e "${RED}⚠️  部分测试失败，请检查日志${NC}"
  exit 1
fi
