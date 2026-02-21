#!/usr/bin/env bash

# SSL证书管理脚本
# 支持Let's Encrypt证书的申请、续期和部署

set -e

# 配置变量
DOMAIN="fixcycle.com"
EMAIL="admin@fixcycle.com"
SSL_DIR="/etc/nginx/ssl"
CERTBOT_DIR="/var/lib/letsencrypt"
WEBROOT_DIR="/var/www/html"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查root权限
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "此脚本需要root权限运行"
        exit 1
    fi
}

# 安装Certbot
install_certbot() {
    log "检查Certbot安装状态..."
    
    if ! command -v certbot &> /dev/null; then
        log "安装Certbot..."
        
        # Ubuntu/Debian
        if command -v apt-get &> /dev/null; then
            apt-get update
            apt-get install -y certbot python3-certbot-nginx
        # CentOS/RHEL
        elif command -v yum &> /dev/null; then
            yum install -y epel-release
            yum install -y certbot python3-certbot-nginx
        # Amazon Linux
        elif command -v amazon-linux-extras &> /dev/null; then
            amazon-linux-extras install epel -y
            yum install -y certbot python3-certbot-nginx
        else
            error "不支持的操作系统，请手动安装certbot"
            exit 1
        fi
        
        log "Certbot安装完成"
    else
        log "Certbot已安装"
    fi
}

# 创建SSL目录
create_ssl_directories() {
    log "创建SSL目录结构..."
    
    mkdir -p "$SSL_DIR"
    mkdir -p "$CERTBOT_DIR"
    mkdir -p "$WEBROOT_DIR"
    
    # 设置权限
    chmod 755 "$SSL_DIR"
    chmod 755 "$CERTBOT_DIR"
    chmod 755 "$WEBROOT_DIR"
    
    log "SSL目录创建完成"
}

# 申请SSL证书
request_certificate() {
    log "申请SSL证书..."
    
    # 检查证书是否已存在
    if [[ -f "$SSL_DIR/fullchain.pem" ]] && [[ -f "$SSL_DIR/privkey.pem" ]]; then
        warn "证书文件已存在，跳过申请"
        return 0
    fi
    
    # 使用Certbot申请证书
    certbot certonly \
        --non-interactive \
        --agree-tos \
        --email "$EMAIL" \
        --webroot \
        --webroot-path "$WEBROOT_DIR" \
        -d "$DOMAIN" \
        -d "www.$DOMAIN" \
        --preferred-challenges http \
        --keep-until-expiring
    
    if [[ $? -eq 0 ]]; then
        log "SSL证书申请成功"
        
        # 部署证书到Nginx目录
        deploy_certificate
    else
        error "SSL证书申请失败"
        exit 1
    fi
}

# 续期SSL证书
renew_certificate() {
    log "续期SSL证书..."
    
    certbot renew --quiet
    
    if [[ $? -eq 0 ]]; then
        log "SSL证书续期成功"
        deploy_certificate
    else
        error "SSL证书续期失败"
        exit 1
    fi
}

# 部署证书到Nginx目录
deploy_certificate() {
    log "部署证书到Nginx目录..."
    
    local live_dir="/etc/letsencrypt/live/$DOMAIN"
    
    if [[ ! -d "$live_dir" ]]; then
        error "证书目录不存在: $live_dir"
        exit 1
    fi
    
    # 复制证书文件
    cp "$live_dir/fullchain.pem" "$SSL_DIR/"
    cp "$live_dir/privkey.pem" "$SSL_DIR/"
    cp "$live_dir/chain.pem" "$SSL_DIR/"
    
    # 设置正确的权限
    chmod 644 "$SSL_DIR/fullchain.pem"
    chmod 600 "$SSL_DIR/privkey.pem"
    chmod 644 "$SSL_DIR/chain.pem"
    
    # 设置所有者为nginx用户
    if id "nginx" &>/dev/null; then
        chown nginx:nginx "$SSL_DIR"/*
    elif id "www-data" &>/dev/null; then
        chown www-data:www-data "$SSL_DIR"/*
    fi
    
    log "证书部署完成"
}

# 测试Nginx配置
test_nginx_config() {
    log "测试Nginx配置..."
    
    if nginx -t; then
        log "Nginx配置测试通过"
        return 0
    else
        error "Nginx配置测试失败"
        return 1
    fi
}

# 重新加载Nginx
reload_nginx() {
    log "重新加载Nginx..."
    
    if systemctl is-active --quiet nginx; then
        systemctl reload nginx
        log "Nginx重新加载完成"
    else
        error "Nginx服务未运行"
        return 1
    fi
}

# 创建自动续期cron任务
setup_auto_renewal() {
    log "设置自动续期任务..."
    
    local cron_job="0 2 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx"
    
    # 检查是否已存在相同的cron任务
    if crontab -l | grep -q "certbot renew"; then
        warn "自动续期任务已存在"
        return 0
    fi
    
    # 添加cron任务
    (crontab -l 2>/dev/null; echo "$cron_job") | crontab -
    
    if [[ $? -eq 0 ]]; then
        log "自动续期任务设置完成"
    else
        error "自动续期任务设置失败"
        exit 1
    fi
}

# 验证SSL证书
verify_certificate() {
    log "验证SSL证书..."
    
    # 检查证书文件是否存在
    if [[ ! -f "$SSL_DIR/fullchain.pem" ]] || [[ ! -f "$SSL_DIR/privkey.pem" ]]; then
        error "证书文件缺失"
        return 1
    fi
    
    # 检查证书有效期
    local expiry_date=$(openssl x509 -enddate -noout -in "$SSL_DIR/fullchain.pem" | cut -d= -f2)
    local expiry_timestamp=$(date -d "$expiry_date" +%s)
    local current_timestamp=$(date +%s)
    local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
    
    log "证书有效期至: $expiry_date"
    log "距离到期还有: $days_until_expiry 天"
    
    if [[ $days_until_expiry -lt 30 ]]; then
        warn "证书即将到期，请及时续期"
        return 1
    else
        log "证书状态正常"
        return 0
    fi
}

# 显示证书信息
show_certificate_info() {
    log "SSL证书信息:"
    echo "----------------------------------------"
    
    if [[ -f "$SSL_DIR/fullchain.pem" ]]; then
        openssl x509 -in "$SSL_DIR/fullchain.pem" -text -noout | grep -E "Subject:|Issuer:|Validity|Subject Alternative Name"
    else
        error "证书文件不存在"
    fi
    
    echo "----------------------------------------"
}

# 主函数
main() {
    local action="${1:-help}"
    
    case "$action" in
        "install")
            check_root
            install_certbot
            create_ssl_directories
            ;;
        "request")
            check_root
            create_ssl_directories
            request_certificate
            test_nginx_config && reload_nginx
            setup_auto_renewal
            ;;
        "renew")
            check_root
            renew_certificate
            test_nginx_config && reload_nginx
            ;;
        "deploy")
            check_root
            deploy_certificate
            test_nginx_config && reload_nginx
            ;;
        "verify")
            verify_certificate
            show_certificate_info
            ;;
        "auto-renew")
            check_root
            setup_auto_renewal
            ;;
        "info")
            show_certificate_info
            ;;
        "help"|*)
            echo "SSL证书管理工具"
            echo "用法: $0 [命令]"
            echo ""
            echo "命令:"
            echo "  install     安装Certbot和创建目录"
            echo "  request     申请新的SSL证书"
            echo "  renew       续期现有证书"
            echo "  deploy      部署证书到Nginx目录"
            echo "  verify      验证证书状态"
            echo "  auto-renew  设置自动续期"
            echo "  info        显示证书信息"
            echo "  help        显示此帮助信息"
            echo ""
            echo "示例:"
            echo "  $0 install"
            echo "  $0 request"
            echo "  $0 renew"
            ;;
    esac
}

# 执行主函数
main "$@"