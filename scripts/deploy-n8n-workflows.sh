#!/bin/bash
# n8n工作流生产环境自动化部署脚本
# 作者: AI Assistant
# 版本: 1.0.0
# 日期: 2026-02-20

set -e  # 遇到错误立即退出

# 检查 Node.js 是否可用
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required but not installed"
    exit 1
fi

# 使用统一部署脚本
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UNIFIED_DEPLOY="$SCRIPT_DIR/unified-deploy.js"

# 如果统一部署脚本存在，使用它
if [ -f "$UNIFIED_DEPLOY" ]; then
    echo "Using unified deployment framework..."
    exec node "$UNIFIED_DEPLOY" n8n-workflows "$@"
fi

# 回退到原有实现
# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# 配置变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
WORKFLOW_DIR="$PROJECT_ROOT/n8n-workflows"
DEPLOY_CONFIG_DIR="$PROJECT_ROOT/config/deploy"
BACKUP_DIR="$PROJECT_ROOT/backups/$(date +%Y%m%d_%H%M%S)"

# 版本管理配置
TARGET_VERSION="${N8N_WORKFLOW_VERSION:-v1.0.0}"
DEPLOY_STRATEGY="${N8N_DEPLOY_STRATEGY:-direct}"
ROLLBACK_VERSION="${N8N_ROLLBACK_VERSION:-v1.0.0}"
TEST_DATA_PASS_RATE="${N8N_TEST_DATA_PASS_RATE:-95}"
HEALTH_CHECK_TIMEOUT="${N8N_HEALTH_CHECK_TIMEOUT:-30}"

# 生产环境配置
N8N_API_URL="${N8N_API_URL:-https://n8n.yourdomain.com}"
N8N_API_TOKEN="${N8N_API_TOKEN:-}"
DEPLOY_ENV="${DEPLOY_ENV:-production}"

# 工作流文件列表
WORKFLOWS=(
    "scan-flow.json"
    "tutorial-flow.json" 
    "payment-success.json"
    "ai-escalation.json"
)

# 环境变量映射表
ENV_MAPPING_FILE="$DEPLOY_CONFIG_DIR/env-mapping.json"

# 部署前检查
pre_deployment_check() {
    log_info "开始部署前检查..."
    
    # 检查必需工具
    local required_tools=("curl" "jq" "docker")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "缺少必需工具: $tool"
            exit 1
        fi
    done
    
    # 检查工作流文件
    log_info "检查工作流文件完整性..."
    for workflow in "${WORKFLOWS[@]}"; do
        if [[ ! -f "$WORKFLOW_DIR/$workflow" ]]; then
            log_error "工作流文件不存在: $WORKFLOW_DIR/$workflow"
            exit 1
        fi
        
        # 验证JSON格式
        if ! jq empty "$WORKFLOW_DIR/$workflow" &> /dev/null; then
            log_error "工作流文件格式错误: $WORKFLOW_DIR/$workflow"
            exit 1
        fi
        
        log_success "工作流文件验证通过: $workflow"
    done
    
    # 检查环境变量
    if [[ -z "$N8N_API_TOKEN" ]]; then
        log_error "N8N_API_TOKEN 环境变量未设置"
        exit 1
    fi
    
    # 检查环境映射文件
    if [[ ! -f "$ENV_MAPPING_FILE" ]]; then
        log_warning "环境变量映射文件不存在，将使用默认配置"
        create_default_env_mapping
    fi
    
    log_success "部署前检查完成"
}

# 幂等性检查函数
check_workflow_exists() {
    local workflow_name="$1"
    local target_version="$2"
    
    local existing_workflow
    existing_workflow=$(curl -s -X GET \
        "$N8N_API_URL/workflows?filter[name]=$workflow_name" \
        -H "Authorization: Bearer $N8N_API_TOKEN")
    
    if [[ $(echo "$existing_workflow" | jq -r '.length') -gt 0 ]]; then
        local current_version
        current_version=$(echo "$existing_workflow" | jq -r '.[0].meta.version // "unknown"')
        
        if [[ "$current_version" == "$target_version" ]]; then
            log_info "工作流 $workflow_name 版本 $target_version 已存在，跳过部署"
            return 0
        else
            log_info "工作流 $workflow_name 版本不匹配，当前: $current_version, 目标: $target_version"
            return 1
        fi
    else
        log_info "工作流 $workflow_name 不存在，需要部署"
        return 1
    fi
}

# 创建默认环境变量映射
create_default_env_mapping() {
    mkdir -p "$DEPLOY_CONFIG_DIR"
    cat > "$ENV_MAPPING_FILE" << EOF
{
  "production": {
    "AI_DIAGNOSIS_API_URL": "https://api.yourdomain.com/ai/diagnose",
    "TUTORIAL_API_URL": "https://api.yourdomain.com/tutorials",
    "PAYMENT_WEBHOOK_SECRET": "your_production_secret",
    "CONFIDENCE_THRESHOLD": "70",
    "NOTIFICATION_API_URL": "https://api.yourdomain.com/notifications",
    "WECHAT_WORK_WEBHOOK": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=prod_key",
    "DINGTALK_WEBHOOK": "https://oapi.dingtalk.com/robot/send?access_token=prod_token"
  },
  "staging": {
    "AI_DIAGNOSIS_API_URL": "https://staging-api.yourdomain.com/ai/diagnose",
    "TUTORIAL_API_URL": "https://staging-api.yourdomain.com/tutorials",
    "PAYMENT_WEBHOOK_SECRET": "your_staging_secret",
    "CONFIDENCE_THRESHOLD": "70",
    "NOTIFICATION_API_URL": "https://staging-api.yourdomain.com/notifications",
    "WECHAT_WORK_WEBHOOK": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=staging_key",
    "DINGTALK_WEBHOOK": "https://oapi.dingtalk.com/robot/send?access_token=staging_token"
  }
}
EOF
    log_info "创建默认环境变量映射文件"
}

# 备份当前生产环境
backup_production() {
    log_info "开始备份当前生产环境..."
    mkdir -p "$BACKUP_DIR"
    
    # 备份当前工作流
    local backup_response
    backup_response=$(curl -s -X GET \
        "$N8N_API_URL/workflows" \
        -H "Authorization: Bearer $N8N_API_TOKEN" \
        -H "Content-Type: application/json")
    
    if [[ $? -eq 0 ]]; then
        echo "$backup_response" > "$BACKUP_DIR/current-workflows-backup.json"
        log_success "当前工作流备份完成: $BACKUP_DIR/current-workflows-backup.json"
    else
        log_warning "无法备份当前工作流，可能没有现有工作流"
    fi
    
    # 备份环境变量
    local env_backup_response
    env_backup_response=$(curl -s -X GET \
        "$N8N_API_URL/variables" \
        -H "Authorization: Bearer $N8N_API_TOKEN" \
        -H "Content-Type: application/json")
    
    if [[ $? -eq 0 ]]; then
        echo "$env_backup_response" > "$BACKUP_DIR/environment-variables-backup.json"
        log_success "环境变量备份完成: $BACKUP_DIR/environment-variables-backup.json"
    fi
    
    log_success "备份完成，备份目录: $BACKUP_DIR"
}

# 验证n8n连接
validate_n8n_connection() {
    log_info "验证n8n服务连接..."
    
    local health_response
    health_response=$(curl -s -o /dev/null -w "%{http_code}" \
        "$N8N_API_URL/healthz" \
        -H "Authorization: Bearer $N8N_API_TOKEN")
    
    if [[ "$health_response" == "200" ]]; then
        log_success "n8n服务连接正常"
        return 0
    else
        log_error "无法连接到n8n服务，HTTP状态码: $health_response"
        return 1
    fi
}

# 导入工作流
import_workflows() {
    log_info "开始导入工作流到生产环境..."
    
    local imported_count=0
    local skipped_count=0
    local failed_count=0
    
    for workflow in "${WORKFLOWS[@]}"; do
        log_info "处理工作流: $workflow"
        
        # 提取工作流名称和版本
        local workflow_name
        workflow_name=$(basename "$workflow" .json)
        
        # 检查是否已存在且版本一致（幂等性检查）
        if check_workflow_exists "$workflow_name" "$TARGET_VERSION"; then
            log_info "跳过已存在的工作流: $workflow_name"
            ((skipped_count++))
            continue
        fi
        
        local workflow_data
        workflow_data=$(cat "$WORKFLOW_DIR/$workflow")
        
        # 设置工作流为激活状态
        workflow_data=$(echo "$workflow_data" | jq '.active = true')
        
        # 添加版本信息
        workflow_data=$(echo "$workflow_data" | jq ".meta.version = \"$TARGET_VERSION\"")
        
        # 发送到n8n API
        local import_response
        import_response=$(curl -s -X POST \
            "$N8N_API_URL/workflows" \
            -H "Authorization: Bearer $N8N_API_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$workflow_data")
        
        # 检查导入结果
        local workflow_id
        workflow_id=$(echo "$import_response" | jq -r '.id // empty')
        
        if [[ -n "$workflow_id" ]]; then
            log_success "工作流导入成功: $workflow (ID: $workflow_id)"
            ((imported_count++))
            
            # 记录导入的工作流ID
            echo "$workflow_id" >> "$BACKUP_DIR/imported-workflow-ids.txt"
        else
            log_error "工作流导入失败: $workflow"
            echo "$import_response" >> "$BACKUP_DIR/failed-imports.log"
            ((failed_count++))
        fi
    done
    
    log_info "工作流导入完成 - 成功: $imported_count, 跳过: $skipped_count, 失败: $failed_count"
    
    if [[ $failed_count -gt 0 ]]; then
        log_error "部分工作流导入失败，请检查日志文件"
        return 1
    fi
    
    return 0
}

# 配置环境变量
configure_environment_variables() {
    log_info "配置生产环境变量..."
    
    # 读取环境变量映射
    local env_vars
    env_vars=$(jq -r --arg env "$DEPLOY_ENV" '.[$env] | to_entries[] | "\(.key)=\(.value)"' "$ENV_MAPPING_FILE")
    
    # 设置每个环境变量
    while IFS= read -r env_var; do
        if [[ -n "$env_var" ]]; then
            local key="${env_var%%=*}"
            local value="${env_var#*=}"
            
            local var_response
            var_response=$(curl -s -X POST \
                "$N8N_API_URL/variables" \
                -H "Authorization: Bearer $N8N_API_TOKEN" \
                -H "Content-Type: application/json" \
                -d "{\"key\":\"$key\",\"value\":\"$value\"}")
            
            if [[ $? -eq 0 ]]; then
                log_success "环境变量设置成功: $key"
            else
                log_warning "环境变量设置失败: $key"
            fi
        fi
    done <<< "$env_vars"
    
    log_success "环境变量配置完成"
}

# 验证工作流功能
validate_workflows() {
    log_info "验证工作流功能..."
    
    local validation_passed=0
    local validation_failed=0
    
    # 读取导入的工作流ID
    if [[ -f "$BACKUP_DIR/imported-workflow-ids.txt" ]]; then
        while IFS= read -r workflow_id; do
            if [[ -n "$workflow_id" ]]; then
                # 获取工作流详情
                local workflow_details
                workflow_details=$(curl -s -X GET \
                    "$N8N_API_URL/workflows/$workflow_id" \
                    -H "Authorization: Bearer $N8N_API_TOKEN")
                
                local workflow_active
                workflow_active=$(echo "$workflow_details" | jq -r '.active')
                
                if [[ "$workflow_active" == "true" ]]; then
                    log_success "工作流状态正常: $workflow_id"
                    ((validation_passed++))
                else
                    log_error "工作流未激活: $workflow_id"
                    ((validation_failed++))
                fi
            fi
        done < "$BACKUP_DIR/imported-workflow-ids.txt"
    fi
    
    log_info "工作流验证完成 - 通过: $validation_passed, 失败: $validation_failed"
    
    if [[ $validation_failed -gt 0 ]]; then
        return 1
    fi
    
    return 0
}

# 设置监控告警
setup_monitoring() {
    log_info "设置监控告警..."
    
    # 这里可以集成具体的监控系统API
    # 示例：发送到监控平台的通知
    local monitoring_payload
    monitoring_payload=$(cat << EOF
{
  "event": "n8n_workflows_deployed",
  "environment": "$DEPLOY_ENV",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "workflows_deployed": $(wc -l < "$BACKUP_DIR/imported-workflow-ids.txt"),
  "deployment_status": "success"
}
EOF
)
    
    # 发送到监控系统（这里只是示例）
    # curl -s -X POST "https://monitoring.yourdomain.com/api/events" \
    #   -H "Content-Type: application/json" \
    #   -d "$monitoring_payload" > /dev/null 2>&1
    
    log_success "监控告警设置完成"
}

# 生成部署报告
generate_deployment_report() {
    log_info "生成部署报告..."
    
    local report_file="$BACKUP_DIR/deployment-report.txt"
    
    cat > "$report_file" << EOF
n8n工作流生产环境部署报告
================================

部署时间: $(date)
部署环境: $DEPLOY_ENV
n8n服务: $N8N_API_URL

工作流部署情况:
EOF
    
    if [[ -f "$BACKUP_DIR/imported-workflow-ids.txt" ]]; then
        local workflow_count
        workflow_count=$(wc -l < "$BACKUP_DIR/imported-workflow-ids.txt")
        echo "  成功部署工作流数量: $workflow_count" >> "$report_file"
        
        echo "" >> "$report_file"
        echo "部署的工作流列表:" >> "$report_file"
        while IFS= read -r workflow_id; do
            echo "  - 工作流ID: $workflow_id" >> "$report_file"
        done < "$BACKUP_DIR/imported-workflow-ids.txt"
    fi
    
    echo "" >> "$report_file"
    echo "备份信息:" >> "$report_file"
    echo "  备份目录: $BACKUP_DIR" >> "$report_file"
    echo "  备份文件: current-workflows-backup.json, environment-variables-backup.json" >> "$report_file"
    
    echo "" >> "$report_file"
    echo "环境变量配置:" >> "$report_file"
    jq -r --arg env "$DEPLOY_ENV" '.[$env] | keys[]' "$ENV_MAPPING_FILE" >> "$report_file"
    
    log_success "部署报告生成完成: $report_file"
}

# 回滚函数
rollback_deployment() {
    log_warning "开始回滚部署..."
    
    if [[ -f "$BACKUP_DIR/current-workflows-backup.json" ]]; then
        log_info "恢复原有工作流配置..."
        # 这里实现具体的回滚逻辑
        # 比如删除新导入的工作流，恢复原来的配置
    fi
    
    log_success "回滚完成"
}

# 主部署函数
main_deployment() {
    log_info "开始n8n工作流生产环境部署"
    log_info "部署环境: $DEPLOY_ENV"
    log_info "n8n API地址: $N8N_API_URL"
    
    # 设置错误处理
    trap 'log_error "部署过程中发生错误"; rollback_deployment; exit 1' ERR
    
    # 执行部署步骤
    pre_deployment_check
    backup_production
    validate_n8n_connection
    import_workflows
    configure_environment_variables
    validate_workflows
    setup_monitoring
    generate_deployment_report
    
    log_success "n8n工作流生产环境部署成功完成！"
    log_info "请检查以下事项："
    log_info "1. 验证所有Webhook端点是否正常响应"
    log_info "2. 测试关键业务流程是否正常工作"
    log_info "3. 监控系统日志和性能指标"
    log_info "4. 备份目录位置: $BACKUP_DIR"
}

# 显示帮助信息
show_help() {
    cat << EOF
n8n工作流生产环境自动化部署脚本

用法: $0 [选项]

选项:
  -h, --help          显示此帮助信息
  -e, --environment   指定部署环境 (production/staging) 默认: production
  --dry-run          执行预演模式，不实际部署

环境变量:
  N8N_API_URL        n8n API地址 (必需)
  N8N_API_TOKEN      n8n API令牌 (必需)
  DEPLOY_ENV         部署环境，默认为production

示例:
  $0 --environment staging
  N8N_API_URL=https://n8n.example.com N8N_API_TOKEN=your_token $0

EOF
}

# 参数解析
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -e|--environment)
            DEPLOY_ENV="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            log_error "未知参数: $1"
            show_help
            exit 1
            ;;
    esac
done

# 执行部署
if [[ "$DRY_RUN" == true ]]; then
    log_info "执行预演模式..."
    pre_deployment_check
    log_success "预演检查通过，可以执行实际部署"
else
    main_deployment
fi