# 工作流模板使用说明

## 模板概述
`workflow-template.json` 是一个标准化的n8n工作流模板，包含了常见的工作流结构和最佳实践。

## 模板占位符说明

### 元数据占位符
- `{{VERSION}}`: 工作流版本号 (如: v1.0.0)
- `{{TIMESTAMP}}`: 创建时间戳
- `{{AUTHOR}}`: 作者信息
- `{{DESCRIPTION}}`: 工作流描述
- `{{TAGS}}`: 标签列表
- `{{ROLLBACK_VERSION}}`: 回滚版本
- `{{ROLLBACK_NOTES}}`: 回滚说明

### 配置占位符
- `{{WORKFLOW_NAME}}`: 工作流名称
- `{{WEBHOOK_PATH}}`: Webhook路径
- `{{API_URL}}`: 外部API地址
- `{{BUSINESS_DOMAIN}}`: 业务域标识
- `{{BUSINESS_DOMAIN_DISPLAY}}`: 业务域显示名称

### 标识符占位符
- `{{UNIQUE_ID}}`: 唯一标识符后缀
- `{{VERSION_ID}}`: 版本ID
- `{{WORKFLOW_ID}}`: 工作流ID

## 使用示例

### 1. 创建采购工作流
```bash
# 替换占位符
sed -e "s/{{VERSION}}/v1.1.0/g" \
    -e "s/{{TIMESTAMP}}/$(date -u +%Y-%m-%dT%H:%M:%SZ)/g" \
    -e "s/{{AUTHOR}}/采购团队/g" \
    -e "s/{{DESCRIPTION}}/增强版采购需求解析工作流/g" \
    -e "s/{{WEBHOOK_PATH}}/procurement-enhanced/g" \
    -e "s/{{API_URL}}/https:\/\/api.yourdomain.com\/procurement\/parse/g" \
    workflow-template.json > procurement-enhanced.json
```

### 2. 批量替换脚本
```bash
#!/bin/bash
# template-replace.sh

TEMPLATE="workflow-template.json"
OUTPUT_FILE="$1"

# 检查参数
if [ $# -ne 1 ]; then
    echo "使用方法: $0 <output-file>"
    exit 1
fi

# 定义替换变量
VERSION="v1.0.0"
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
AUTHOR="AI Assistant"
DESCRIPTION="自动生成的工作流"
WEBHOOK_PATH="auto-generated"
API_URL="https://api.example.com/service"
BUSINESS_DOMAIN="generic"
BUSINESS_DOMAIN_DISPLAY="通用服务"

# 执行替换
sed -e "s/{{VERSION}}/$VERSION/g" \
    -e "s/{{TIMESTAMP}}/$TIMESTAMP/g" \
    -e "s/{{AUTHOR}}/$AUTHOR/g" \
    -e "s/{{DESCRIPTION}}/$DESCRIPTION/g" \
    -e "s/{{WEBHOOK_PATH}}/$WEBHOOK_PATH/g" \
    -e "s/{{API_URL}}/$API_URL/g" \
    -e "s/{{BUSINESS_DOMAIN}}/$BUSINESS_DOMAIN/g" \
    -e "s/{{BUSINESS_DOMAIN_DISPLAY}}/$BUSINESS_DOMAIN_DISPLAY/g" \
    -e "s/{{UNIQUE_ID}}/$(openssl rand -hex 4)/g" \
    "$TEMPLATE" > "$OUTPUT_FILE"

echo "工作流模板已生成: $OUTPUT_FILE"
```

## 最佳实践

### 1. 版本管理
- 严格按照语义化版本号规范
- 每次修改都要更新版本号
- 在CHANGELOG中记录变更内容

### 2. 命名规范
- Webhook路径使用kebab-case
- 工作流名称使用中文描述
- 节点ID保持唯一性

### 3. 错误处理
- 所有外部调用都要有超时设置
- 添加适当的错误处理分支
- 记录关键操作的日志信息

### 4. 安全考虑
- 敏感信息使用环境变量
- 添加请求签名验证
- 限制请求频率和并发数

## 模板验证
使用以下命令验证生成的工作流JSON格式：
```bash
# 验证JSON格式
node -e "JSON.parse(require('fs').readFileSync('workflow.json', 'utf8')); console.log('✓ JSON格式正确')"

# 验证必需字段
node -e "
const workflow = JSON.parse(require('fs').readFileSync('workflow.json', 'utf8'));
const requiredFields = ['name', 'nodes', 'connections', 'meta'];
const missingFields = requiredFields.filter(field => !(field in workflow));
if (missingFields.length === 0) {
  console.log('✓ 所有必需字段都存在');
} else {
  console.log('✗ 缺少字段:', missingFields);
}
"
```

## 注意事项
1. 生成后需要手动调整具体的业务逻辑
2. 确保所有占位符都被正确替换
3. 测试工作流功能后再投入生产使用
4. 定期更新模板以适应新的最佳实践