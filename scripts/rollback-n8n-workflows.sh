#!/bin/bash
# n8n工作流回滚脚本
# 作者: AI Assistant
# 版本: 1.0.0
# 日期: 2026-02-20

set -e  # 遇到错误立即退出

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
BACKUP_DIR="$PROJECT_ROOT/backups"
N8N_API_URL="${N8N_API_URL:-https://n8n.yourdomain.com}"
N8N_API_TOKEN="${N8N_API_TOKEN:-}"
ROLLBACK_VERSION="${ROLLBACK_VERSION:-v1.0.0}"
BACKUP_TIMESTAMP="${BACKUP_TIMESTAMP:-}"

# 回滚单个工作流
rollback_workflow() {
    local workflow_id="$1"
    local rollback_version="$2"
    local backup_dir="$3"
    
    log_info "开始回滚工作流 $workflow_id 到版本 $rollback_version"
    
    # 检查备份文件是否存在
    local backup_file="$backup_dir/workflow-${workflow_id}-backup.json"
    if [[ ! -f "$backup_file" ]]; then
        log_error "找不到工作流 $workflow_id 的备份文件: $backup_file"
        return 1
    fi
    
    # 读取备份数据
    local backup_data
    backup_data=$(cat "$backup_file")
    
    # 恢复工作流
    local response
    response=$(curl -s -X PUT \
        "$N8N_API_URL/workflows/$workflow_id" \
        -H "Authorization: Bearer $N8N_API_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$backup_data")
    
    # 检查恢复结果
    local restored_id
    restored_id=$(echo "$response" | jq -r '.id // empty')
    
    if [[ -n "$restored_id" && "$restored_id" == "$workflow_id" ]]; then
        log_success "工作流 $workflow_id 回滚完成"
        return 0
    else
        log_error "工作流 $workflow_id 回滚失败"
        echo "$response" >> "$backup_dir/rollback-failures.log"
        return 1
    fi
}

# 删除新部署的工作流
delete_new_workflows() {
    local backup_dir="$1"
    local rollback_version="$2"
    
    log_info "删除版本 $rollback_version 的新部署工作流"
    
    if [[ -f "$backup_dir/imported-workflow-ids.txt" ]]; then
        while IFS= read -r workflow_id; do
            if [[ -n "$workflow_id" ]]; then
                log_info "删除工作流: $workflow_id"
                
                local response
                response=$(curl -s -X DELETE \
                    "$N8N_API_URL/workflows/$workflow_id" \
                    -H "Authorization: Bearer $N8N_API_TOKEN")
                
                if [[ $? -eq 0 ]]; then
                    log_success "工作流 $workflow_id 删除成功"
                else
                    log_warning "工作流 $workflow_id 删除失败"
                    echo "$response" >> "$backup_dir/delete-failures.log"
                fi
            fi
        done < "$backup_dir/imported-workflow-ids.txt"
    fi
}

# 恢复环境变量
restore_environment_variables() {
    local backup_dir="$1"
    
    log_info "恢复环境变量配置"
    
    local env_backup_file="$backup_dir/environment-variables-backup.json"
    if [[ -f "$env_backup_file" ]]; then
        # 这里可以实现环境变量的恢复逻辑
        # 由于n8n API的限制，可能需要手动恢复
        log_warning "环境变量恢复需要手动操作，请参考备份文件: $env_backup_file"
    else
        log_info "未找到环境变量备份文件"
    fi
}

# 主回滚函数
main_rollback() {
    log_warning "开始执行n8n工作流回滚操作"
    
    # 参数验证
    if [[ -z "$N8N_API_TOKEN" ]]; then
        log_error "N8N_API_TOKEN 环境变量未设置"
        exit 1
    fi
    
    # 确定备份目录
    local target_backup_dir
    if [[ -n "$BACKUP_TIMESTAMP" ]]; then
        target_backup_dir="$BACKUP_DIR/$BACKUP_TIMESTAMP"
    else
        # 使用最新的备份目录
        target_backup_dir=$(ls -dt "$BACKUP_DIR"/*/ 2>/dev/null | head -1)
        if [[ -z "$target_backup_dir" ]]; then
            log_error "未找到备份目录"
            exit 1
        fi
        target_backup_dir=${target_backup_dir%/}  # 移除末尾斜杠
    fi
    
    log_info "使用备份目录: $target_backup_dir"
    
    # 验证备份目录完整性
    if [[ ! -d "$target_backup_dir" ]]; then
        log_error "备份目录不存在: $target_backup_dir"
        exit 1
    fi
    
    # 执行回滚步骤
    local rollback_success=0
    local rollback_failed=0
    
    # 1. 删除新部署的工作流
    delete_new_workflows "$target_backup_dir" "$ROLLBACK_VERSION"
    
    # 2. 恢复原有工作流
    if [[ -f "$target_backup_dir/imported-workflow-ids.txt" ]]; then
        while IFS= read -r workflow_id; do
            if [[ -n "$workflow_id" ]]; then
                if rollback_workflow "$workflow_id" "$ROLLBACK_VERSION" "$target_backup_dir"; then
                    ((rollback_success++))
                else
                    ((rollback_failed++))
                fi
            fi
        done < "$target_backup_dir/imported-workflow-ids.txt"
    else
        log_warning "未找到需要回滚的工作流列表"
    fi
    
    # 3. 恢复环境变量
    restore_environment_variables "$target_backup_dir"
    
    # 4. 生成回滚报告
    local report_file="$target_backup_dir/rollback-report.txt"
    cat > "$report_file" << EOF
n8n工作流回滚报告
==============================

回滚时间: $(date)
目标版本: $ROLLBACK_VERSION
备份目录: $target_backup_dir

回滚结果:
  成功: $rollback_success
  失败: $rollback_failed

操作详情:
EOF

    if [[ -f "$target_backup_dir/imported-workflow-ids.txt" ]]; then
        echo "" >> "$report_file"
        echo "回滚的工作流列表:" >> "$report_file"
        while IFS= read -r workflow_id; do
            echo "  - 工作流ID: $workflow_id" >> "$report_file"
        done < "$target_backup_dir/imported-workflow-ids.txt"
    fi
    
    log_success "回滚操作完成"
    log_info "回滚报告: $report_file"
    
    if [[ $rollback_failed -gt 0 ]]; then
        log_warning "部分工作流回滚失败，请检查报告文件"
        exit 1
    fi
}

# 显示帮助信息
show_help() {
    cat << EOF
n8n工作流回滚脚本

用法: $0 [选项]

选项:
  -h, --help              显示此帮助信息
  -v, --version VERSION   指定回滚目标版本 (默认: v1.0.0)
  -t, --timestamp TIME    指定备份时间戳目录
  --dry-run              执行预演模式，不实际回滚

环境变量:
  N8N_API_URL            n8n API地址 (必需)
  N8N_API_TOKEN          n8n API令牌 (必需)
  ROLLBACK_VERSION       回滚目标版本 (默认: v1.0.0)
  BACKUP_TIMESTAMP       备份时间戳 (可选)

示例:
  $0 --version v1.0.0
  N8N_API_URL=https://n8n.example.com N8N_API_TOKEN=your_token $0
  $0 --timestamp 20260220_153045

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
        -v|--version)
            ROLLBACK_VERSION="$2"
            shift 2
            ;;
        -t|--timestamp)
            BACKUP_TIMESTAMP="$2"
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

# 执行回滚
if [[ "$DRY_RUN" == true ]]; then
    log_info "执行预演模式..."
    log_info "目标版本: $ROLLBACK_VERSION"
    log_info "备份目录: ${BACKUP_TIMESTAMP:-最新备份}"
    log_success "预演检查通过"
else
    main_rollback
fi