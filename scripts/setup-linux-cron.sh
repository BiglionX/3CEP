#!/bin/bash

# =============================================================================
# FixCycle Linux 监控调度配置工具
# Version: 1.0.0
# Description: 自动配置Linux cron任务以实现系统监控自动化
# =============================================================================

set -euo pipefail

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

# 检查root权限
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "此脚本需要root权限运行"
        log_info "请使用 sudo $0 或以root用户身份运行"
        exit 1
    fi
}

# 获取项目目录
get_project_directory() {
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_ROOT="$(dirname "$script_dir")"
    log_info "项目根目录: $PROJECT_ROOT"
}

# 创建必要的目录
create_directories() {
    log_info "创建必要的目录结构..."
    
    local dirs=(
        "$PROJECT_ROOT/logs/scheduler"
        "$PROJECT_ROOT/logs/backup"
        "$PROJECT_ROOT/backups"
        "$PROJECT_ROOT/config/scheduler"
        "$PROJECT_ROOT/scripts/tmp"
    )
    
    for dir in "${dirs[@]}"; do
        mkdir -p "$dir"
        chmod 755 "$dir"
    done
    
    log_success "目录结构创建完成"
}

# 备份现有crontab
backup_crontab() {
    local user="${1:-root}"
    local backup_file="$PROJECT_ROOT/config/scheduler/crontab-$user-$(date +%Y%m%d-%H%M%S).bak"
    
    log_info "备份用户 $user 的现有crontab..."
    
    if crontab -u "$user" -l > "$backup_file" 2>/dev/null; then
        log_success "crontab已备份到: $backup_file"
    else
        log_warning "用户 $user 没有现有crontab或备份失败"
    fi
}

# 验证脚本可执行性
validate_scripts() {
    log_info "验证监控脚本..."
    
    local scripts=(
        "scripts/quick-health-check.js"
        "scripts/health-check-suite.js"
        "scripts/monitor-database.js"
        "scripts/check-n8n-health.js"
        "scripts/backup-database.js"
        "scripts/backup-n8n.js"
    )
    
    local missing_scripts=()
    
    for script in "${scripts[@]}"; do
        local script_path="$PROJECT_ROOT/$script"
        if [[ -f "$script_path" ]]; then
            # 检查执行权限
            if [[ ! -x "$script_path" ]]; then
                chmod +x "$script_path"
                log_info "已添加执行权限: $script"
            fi
        else
            missing_scripts+=("$script")
        fi
    done
    
    if [[ ${#missing_scripts[@]} -gt 0 ]]; then
        log_error "以下脚本缺失:"
        printf '%s\n' "${missing_scripts[@]}"
        return 1
    fi
    
    log_success "所有脚本验证通过"
    return 0
}

# 生成cron任务条目
generate_cron_entries() {
    local user="${1:-root}"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    cat << EOF
# =============================================================================
# FixCycle 监控调度任务
# 用户: $user
# 生成时间: $timestamp
# 项目目录: $PROJECT_ROOT
# =============================================================================

# 每15分钟执行快速健康检查
*/15 * * * * cd "$PROJECT_ROOT" && NODE_ENV=production timeout 60s node scripts/quick-health-check.js >> logs/scheduler/health-check.log 2>&1

# 每小时执行完整健康检查
0 * * * * cd "$PROJECT_ROOT" && NODE_ENV=production timeout 120s node scripts/health-check-suite.js >> logs/scheduler/health-suite.log 2>&1

# 每30分钟执行数据库监控
*/30 * * * * cd "$PROJECT_ROOT" && NODE_ENV=production timeout 90s node scripts/monitor-database.js --once >> logs/scheduler/db-monitor.log 2>&1

# 每5分钟检查n8n健康状态
*/5 * * * * cd "$PROJECT_ROOT" && NODE_ENV=production timeout 60s node scripts/check-n8n-health.js >> logs/scheduler/n8n-health.log 2>&1

# 每日凌晨2点执行数据库备份
0 2 * * * cd "$PROJECT_ROOT" && NODE_ENV=production timeout 300s node scripts/backup-database.js backup >> logs/scheduler/backup.log 2>&1

# 每日凌晨3点备份n8n配置
0 3 * * * cd "$PROJECT_ROOT" && NODE_ENV=production timeout 120s node scripts/backup-n8n.js >> logs/scheduler/n8n-backup.log 2>&1

# 每2小时清理过期日志（保留7天）
0 */2 * * * find "$PROJECT_ROOT/logs" -name "*.log.*" -type f -mtime +7 -delete >> logs/scheduler/cleanup.log 2>&1

# 每周日凌晨4点清理过期备份（保留30天）
0 4 * * 0 find "$PROJECT_ROOT/backups" -name "backup-*" -type f -mtime +30 -delete >> logs/scheduler/backup-cleanup.log 2>&1

# 每日凌晨1点执行文件系统健康检查
0 1 * * * cd "$PROJECT_ROOT" && NODE_ENV=production timeout 60s node scripts/check-environment.js >> logs/scheduler/system-check.log 2>&1

# 每10分钟检查磁盘空间
*/10 * * * * df -h | awk '\$5+0 > 85' >> logs/scheduler/disk-alert.log 2>&1

# =============================================================================
# FixCycle 监控任务结束
# =============================================================================
EOF
}

# 配置cron任务
configure_cron() {
    local user="${1:-root}"
    
    log_info "配置用户 $user 的cron任务..."
    
    # 备份现有crontab
    backup_crontab "$user"
    
    # 生成新的cron条目
    local temp_cron="/tmp/fixcycle-cron-$$"
    generate_cron_entries "$user" > "$temp_cron"
    
    # 检查是否有现有的FixCycle任务
    if crontab -u "$user" -l 2>/dev/null | grep -q "FixCycle"; then
        log_warning "检测到现有的FixCycle cron任务，将进行合并..."
        
        # 获取现有的非FixCycle任务
        crontab -u "$user" -l 2>/dev/null | grep -v "FixCycle" > "$temp_cron.old" 2>/dev/null || true
        
        # 合并现有任务和新任务
        cat "$temp_cron.old" "$temp_cron" > "$temp_cron.merged" 2>/dev/null || cp "$temp_cron" "$temp_cron.merged"
        mv "$temp_cron.merged" "$temp_cron"
    fi
    
    # 安装新的crontab
    if crontab -u "$user" "$temp_cron"; then
        log_success "用户 $user 的cron任务配置成功"
        
        # 验证安装
        if crontab -u "$user" -l | grep -q "FixCycle"; then
            log_success "cron任务验证通过"
        else
            log_error "cron任务安装验证失败"
            return 1
        fi
    else
        log_error "cron任务安装失败"
        return 1
    fi
    
    # 清理临时文件
    rm -f "$temp_cron" "$temp_cron.old"
    return 0
}

# 创建管理脚本
create_management_scripts() {
    log_info "创建管理脚本..."
    
    # 创建任务状态查看脚本
    cat > "$PROJECT_ROOT/scripts/show-cron-tasks.sh" << 'EOF'
#!/bin/bash

echo "==================== FixCycle Cron 任务状态 ===================="
echo

# 显示当前用户的cron任务
echo "当前用户的cron任务:"
crontab -l | grep "FixCycle" | nl -v1 -s'. ' || echo "未找到FixCycle相关的cron任务"

echo
echo "系统级cron任务:"
grep -r "FixCycle" /etc/cron.d/ /etc/cron.hourly/ /etc/cron.daily/ /etc/cron.weekly/ /etc/cron.monthly/ 2>/dev/null || echo "未找到系统级FixCycle任务"

echo
echo "最近的cron执行日志:"
tail -20 /var/log/cron 2>/dev/null | grep "FixCycle" | tail -5 || echo "未找到cron执行日志"

echo
echo "==============================================================="
EOF

    # 创建手动执行脚本
    cat > "$PROJECT_ROOT/scripts/run-cron-task.sh" << 'EOF'
#!/bin/bash

if [ $# -eq 0 ]; then
    echo "用法: $0 <task-name>"
    echo "可用任务:"
    crontab -l | grep "FixCycle" | grep -o "scripts/[a-zA-Z0-9\-]*\.js" | sort | uniq
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

TASK_SCRIPT="scripts/$1.js"
if [ ! -f "$PROJECT_ROOT/$TASK_SCRIPT" ]; then
    echo "错误: 脚本不存在 - $TASK_SCRIPT"
    exit 1
fi

echo "手动执行任务: $TASK_SCRIPT"
cd "$PROJECT_ROOT"
NODE_ENV=production timeout 120s node "$TASK_SCRIPT"
echo "任务执行完成，退出码: $?"
EOF

    # 创建任务删除脚本
    cat > "$PROJECT_ROOT/scripts/remove-cron-tasks.sh" << 'EOF'
#!/bin/bash

echo "警告: 此操作将删除所有FixCycle相关的cron任务!"
echo

read -p "确定要继续吗? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "操作已取消"
    exit 0
fi

# 备份当前crontab
BACKUP_FILE="config/scheduler/crontab-remove-$(date +%Y%m%d-%H%M%S).bak"
crontab -l > "$BACKUP_FILE" 2>/dev/null

# 移除FixCycle相关的任务
(crontab -l 2>/dev/null | grep -v "FixCycle") | crontab -

echo "FixCycle cron任务已删除"
echo "备份已保存到: $BACKUP_FILE"
EOF

    # 设置执行权限
    chmod +x "$PROJECT_ROOT/scripts/show-cron-tasks.sh"
    chmod +x "$PROJECT_ROOT/scripts/run-cron-task.sh"
    chmod +x "$PROJECT_ROOT/scripts/remove-cron-tasks.sh"
    
    log_success "管理脚本创建完成"
}

# 测试配置
test_configuration() {
    log_info "测试配置..."
    
    # 测试快速健康检查
    log_info "测试快速健康检查任务..."
    cd "$PROJECT_ROOT"
    
    if timeout 30s node scripts/quick-health-check.js > logs/scheduler/test-health-check.log 2>&1; then
        log_success "健康检查测试通过"
        tail -5 logs/scheduler/test-health-check.log
    else
        log_warning "健康检查测试失败，但任务已配置"
    fi
    
    # 验证cron服务状态
    if systemctl is-active --quiet cron || systemctl is-active --quiet crond; then
        log_success "cron服务运行正常"
    else
        log_warning "cron服务可能未运行"
    fi
}

# 显示配置摘要
show_summary() {
    echo
    echo "================================================================"
    echo "                    配置完成摘要"
    echo "================================================================"
    echo
    echo "已配置的定时任务:"
    echo "┌─────────────────────────────────────────────────────────────┐"
    echo "│ 任务名称                    │ 调度周期      │ 描述           │"
    echo "├─────────────────────────────────────────────────────────────┤"
    echo "│ 快速健康检查               │ 每15分钟      │ 系统状态检查   │"
    echo "│ 完整健康检查               │ 每小时        │ 详细健康检查   │"
    echo "│ 数据库监控                 │ 每30分钟      │ 数据库性能监控 │"
    echo "│ n8n健康检查                │ 每5分钟       │ 工作流引擎监控 │"
    echo "│ 数据库备份                 │ 每日2点       │ 数据保护       │"
    echo "│ n8n配置备份                │ 每日3点       │ 配置保护       │"
    echo "│ 日志清理                   │ 每2小时       │ 磁盘空间管理   │"
    echo "│ 备份清理                   │ 每周日4点     │ 长期存储管理   │"
    echo "│ 系统检查                   │ 每日1点       │ 环境健康检查   │"
    echo "│ 磁盘监控                   │ 每10分钟      │ 存储容量预警   │"
    echo "└─────────────────────────────────────────────────────────────┘"
    echo
    echo "管理命令:"
    echo "  查看任务状态: scripts/show-cron-tasks.sh"
    echo "  手动执行任务: scripts/run-cron-task.sh <script-name>"
    echo "  删除所有任务: scripts/remove-cron-tasks.sh"
    echo
    echo "日志文件位置:"
    echo "  logs/scheduler/*.log"
    echo
    echo "注意事项:"
    echo "1. 所有任务在生产环境(NODE_ENV=production)下运行"
    echo "2. 任务执行超时时间为60-300秒不等"
    echo "3. 失败的任务会记录到对应的日志文件"
    echo "4. 建议定期检查日志文件和任务执行情况"
    echo "5. 可通过 'crontab -e' 手动调整调度时间"
    echo
    echo "配置文件备份位置:"
    echo "  config/scheduler/crontab-*-*.bak"
    echo
    echo "如需帮助，请查看 docs/admin/monitoring-guide.md"
    echo
}

# 主函数
main() {
    echo "================================================================"
    echo "              FixCycle Linux 监控调度配置工具"
    echo "================================================================"
    echo
    
    # 检查权限
    check_root
    
    # 获取项目目录
    get_project_directory
    
    # 创建目录
    create_directories
    
    # 验证脚本
    if ! validate_scripts; then
        log_error "脚本验证失败，退出配置"
        exit 1
    fi
    
    # 配置cron任务
    if configure_cron "root"; then
        log_success "cron任务配置完成"
    else
        log_error "cron任务配置失败"
        exit 1
    fi
    
    # 创建管理脚本
    create_management_scripts
    
    # 测试配置
    test_configuration
    
    # 显示摘要
    show_summary
    
    log_success "FixCycle监控调度配置完成！"
}

# 脚本入口点
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi