#!/bin/bash

# n8n 工作流 curl 测试脚本
# 用于手动验证工作流功能

echo "🚀 n8n 工作流 curl 测试"
echo "========================"

# 配置变量
N8N_HOST=${N8N_HOST:-"localhost"}
N8N_PORT=${N8N_PORT:-"5678"}

BASE_URL="http://${N8N_HOST}:${N8N_PORT}"

echo "🔧 测试配置:"
echo "   n8n 地址: ${BASE_URL}"
echo ""

# 测试函数
test_endpoint() {
    local endpoint=$1
    local description=$2
    
    echo "🧪 测试端点: ${endpoint}"
    echo "📋 描述: ${description}"
    echo ""
    
    curl -X POST "${BASE_URL}${endpoint}" \
         -H "Content-Type: application/json" \
         -d '{
               "description": "我需要采购100个电子元件A和50个连接器B，预算5000元",
               "companyId": "test-company-001",
               "requesterId": "test-user-001"
             }' \
         -w "\n\n响应时间: %{time_total}秒\n状态码: %{http_code}\n" \
         --silent \
         --show-error
    
    echo ""
    echo "─" $(printf '%.0s─' {1..40})
    echo ""
}

# 健康检查
echo "🏥 执行健康检查..."
echo ""

# 检查 n8n 是否运行
echo "检查 n8n 服务状态:"
curl -s "${BASE_URL}/healthz" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ n8n 服务运行正常"
else
    echo "❌ 无法连接到 n8n 服务"
    echo "请确保 n8n 正在运行在 ${BASE_URL}"
    exit 1
fi

echo ""
echo "─" $(printf '%.0s─' {1..50})
echo ""

# 执行测试
echo "📋 开始工作流测试..."
echo ""

# 测试基础工作流
test_endpoint "/webhook/b2b-procurement-parse" "基础 B2B 采购需求解析"

# 测试高级工作流
test_endpoint "/webhook/b2b-procurement-advanced" "高级 B2B 采购需求解析（带错误处理）"

echo "🎉 测试完成！"
echo ""
echo "💡 提示:"
echo "   - 如果返回 404 错误，请检查工作流是否已导入并激活"
echo "   - 如果返回 500 错误，请检查智能体 API 是否正常运行"
echo "   - 可以通过设置环境变量 N8N_HOST 和 N8N_PORT 来指定不同的地址"
echo ""
echo "🔧 使用示例:"
echo "   export N8N_HOST=your-n8n-server.com"
echo "   export N8N_PORT=5678"
echo "   ./test-workflows.sh"