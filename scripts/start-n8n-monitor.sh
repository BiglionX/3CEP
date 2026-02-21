#!/bin/bash
# n8n 监控系统启动脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
MONITOR_CONFIG="$PROJECT_ROOT/config/monitoring/n8n-monitor-config.json"
NODE_SCRIPT="$SCRIPT_DIR/n8n-monitor.js"

# 检查必需文件
check_prerequisites() {
    log_info "检查监控系统前置条件..."
    
    if [[ ! -f "$NODE_SCRIPT" ]]; then
        log_error "监控脚本不存在: $NODE_SCRIPT"
        exit 1
    fi
    
    if [[ ! -f "$MONITOR_CONFIG" ]]; then
        log_warning "监控配置文件不存在，将使用默认配置"
    fi
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装"
        exit 1
    fi
    
    # 检查 PM2 (可选)
    if command -v pm2 &> /dev/null; then
        log_info "PM2 可用，将使用进程管理"
        USE_PM2=true
    else
        log_warning "PM2 未安装，将使用基本后台运行"
        USE_PM2=false
    fi
    
    log_success "前置条件检查完成"
}

# 启动监控 (使用 PM2)
start_with_pm2() {
    log_info "使用 PM2 启动监控系统..."
    
    # 检查是否已存在进程
    if pm2 list | grep -q "n8n-monitor"; then
        log_warning "监控进程已在运行，重启中..."
        pm2 restart n8n-monitor
    else
        # 启动新进程
        pm2 start "$NODE_SCRIPT" \
            --name "n8n-monitor" \
            -- \
            --config "$MONITOR_CONFIG"
    fi
    
    # 保存进程列表
    pm2 save
    
    # 设置开机自启
    pm2 startup systemd -u $(whoami) --hp $(eval echo ~$(whoami)) > /dev/null 2>&1 || true
    
    log_success "监控系统已通过 PM2 启动"
    pm2 list | grep "n8n-monitor"
}

# 启动监控 (基本方式)
start_basic() {
    log_info "使用基本方式启动监控系统..."
    
    # 创建日志目录
    mkdir -p "$PROJECT_ROOT/logs/monitoring"
    
    # 后台运行
    nohup node "$NODE_SCRIPT" \
        --config "$MONITOR_CONFIG" \
        > "$PROJECT_ROOT/logs/monitoring/monitor.log" \
        2> "$PROJECT_ROOT/logs/monitoring/monitor.err" &
    
    MONITOR_PID=$!
    echo $MONITOR_PID > "$PROJECT_ROOT/logs/monitoring/monitor.pid"
    
    log_success "监控系统已在后台启动 (PID: $MONITOR_PID)"
    log_info "日志文件: $PROJECT_ROOT/logs/monitoring/monitor.log"
}

# 停止监控
stop_monitor() {
    log_info "停止监控系统..."
    
    if [[ "$USE_PM2" == true ]]; then
        if pm2 list | grep -q "n8n-monitor"; then
            pm2 stop n8n-monitor
            pm2 delete n8n-monitor
            log_success "PM2 监控进程已停止"
        else
            log_warning "未找到运行中的监控进程"
        fi
    else
        PID_FILE="$PROJECT_ROOT/logs/monitoring/monitor.pid"
        if [[ -f "$PID_FILE" ]]; then
            MONITOR_PID=$(cat "$PID_FILE")
            if kill -0 $MONITOR_PID 2>/dev/null; then
                kill $MONITOR_PID
                log_success "监控进程已停止 (PID: $MONITOR_PID)"
            else
                log_warning "监控进程已不在运行"
            fi
            rm -f "$PID_FILE"
        else
            log_warning "未找到 PID 文件"
        fi
    fi
}

# 重启监控
restart_monitor() {
    log_info "重启监控系统..."
    stop_monitor
    sleep 2
    start_monitor
}

# 查看状态
status_monitor() {
    if [[ "$USE_PM2" == true ]]; then
        log_info "PM2 监控进程状态:"
        pm2 list | grep "n8n-monitor" || log_warning "监控进程未运行"
    else
        PID_FILE="$PROJECT_ROOT/logs/monitoring/monitor.pid"
        if [[ -f "$PID_FILE" ]]; then
            MONITOR_PID=$(cat "$PID_FILE")
            if kill -0 $MONITOR_PID 2>/dev/null; then
                log_success "监控进程正在运行 (PID: $MONITOR_PID)"
                ps -p $MONITOR_PID -f
            else
                log_error "PID文件存在但进程未运行"
            fi
        else
            log_warning "监控进程未运行"
        fi
    fi
}

# 查看日志
view_logs() {
    local lines=${1:-50}
    
    if [[ "$USE_PM2" == true ]]; then
        pm2 logs n8n-monitor --lines $lines
    else
        LOG_FILE="$PROJECT_ROOT/logs/monitoring/monitor.log"
        if [[ -f "$LOG_FILE" ]]; then
            tail -n $lines "$LOG_FILE"
        else
            log_error "日志文件不存在: $LOG_FILE"
        fi
    fi
}

# 查看错误日志
view_errors() {
    local lines=${1:-20}
    
    if [[ "$USE_PM2" == true ]]; then
        pm2 logs n8n-monitor --err --lines $lines
    else
        ERROR_FILE="$PROJECT_ROOT/logs/monitoring/monitor.err"
        if [[ -f "$ERROR_FILE" ]]; then
            tail -n $lines "$ERROR_FILE"
        else
            log_error "错误日志文件不存在: $ERROR_FILE"
        fi
    fi
}

# 显示帮助信息
show_help() {
    cat << EOF
n8n 监控系统管理脚本

用法: $0 {start|stop|restart|status|logs|errors|help}

命令:
  start           启动监控系统
  stop            停止监控系统
  restart         重启监控系统
  status          查看监控系统状态
  logs [lines]    查看监控日志 (默认50行)
  errors [lines]  查看错误日志 (默认20行)
  help            显示此帮助信息

环境变量:
  N8N_BASE_URL    n8n 服务地址 (默认: http://localhost:5678)
  N8N_API_TOKEN   API 访问令牌
  NODE_ENV        运行环境 (development|production)

示例:
  $0 start
  $0 status
  $0 logs 100
  $0 errors
  N8N_BASE_URL=https://n8n.example.com $0 start

EOF
}

# 主函数
main() {
    local command=${1:-help}
    
    case "$command" in
        start)
            check_prerequisites
            start_monitor
            ;;
        stop)
            stop_monitor
            ;;
        restart)
            restart_monitor
            ;;
        status)
            status_monitor
            ;;
        logs)
            view_logs ${2:-50}
            ;;
        errors)
            view_errors ${2:-20}
            ;;
        help|*)
            show_help
            ;;
    esac
}

# 根据运行方式确定启动函数
start_monitor() {
    if [[ "$USE_PM2" == true ]]; then
        start_with_pm2
    else
        start_basic
    fi
}

# 执行主函数
main "$@"