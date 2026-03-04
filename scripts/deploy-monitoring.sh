#!/bin/bash

# 采购智能体监控体系部署脚本

echo "🚀 开始部署采购智能体监控体系..."
echo "=========================================="

# 配置变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CONFIG_DIR="$PROJECT_ROOT/config/monitoring"
MONITORING_DIR="/opt/procurement-monitoring"

# 创建监控目录
echo "📁 创建监控目录结构..."
sudo mkdir -p "$MONITORING_DIR"/{prometheus,grafana,alertmanager,configs}

# 复制配置文件
echo "📋 部署监控配置文件..."

# Prometheus配置
if [ -f "$CONFIG_DIR/prometheus-procurement.yml" ]; then
    sudo cp "$CONFIG_DIR/prometheus-procurement.yml" "$MONITORING_DIR/configs/"
    echo "✅ Prometheus配置文件已部署"
else
    echo "⚠️  Prometheus配置文件不存在"
fi

# 告警规则
if [ -f "$CONFIG_DIR/procurement-alert-rules.yml" ]; then
    sudo cp "$CONFIG_DIR/procurement-alert-rules.yml" "$MONITORING_DIR/configs/"
    echo "✅ 告警规则文件已部署"
else
    echo "⚠️  告警规则文件不存在"
fi

# Grafana仪表板配置
if [ -f "$CONFIG_DIR/grafana-procurement-dashboard.json" ]; then
    sudo cp "$CONFIG_DIR/grafana-procurement-dashboard.json" "$MONITORING_DIR/configs/"
    echo "✅ Grafana仪表板配置已部署"
else
    echo "⚠️  Grafana仪表板配置不存在"
fi

# 创建Docker Compose文件
cat > "$MONITORING_DIR/docker-compose.yml" << 'EOF'
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: procurement-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./configs/prometheus-procurement.yml:/etc/prometheus/prometheus.yml
      - ./configs/procurement-alert-rules.yml:/etc/prometheus/rules/procurement-alert-rules.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=30d'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: procurement-grafana
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./configs/grafana-procurement-dashboard.json:/var/lib/grafana/dashboards/procurement.json
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
      - GF_USERS_ALLOW_SIGN_UP=false
    restart: unless-stopped

  alertmanager:
    image: prom/alertmanager:latest
    container_name: procurement-alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./configs/alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager_data:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
    restart: unless-stopped

volumes:
  prometheus_data:
  grafana_data:
  alertmanager_data:
EOF

echo "✅ Docker Compose配置已创建"

# 创建Alertmanager配置
cat > "$MONITORING_DIR/configs/alertmanager.yml" << 'EOF'
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'default-receiver'

receivers:
  - name: 'default-receiver'
    webhook_configs:
      - url: 'http://localhost:3000/api/procurement-intelligence/alerts/webhook'
        send_resolved: true

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'dev', 'instance']
EOF

echo "✅ Alertmanager配置已创建"

# 启动监控服务
echo "🐳 启动监控服务..."
cd "$MONITORING_DIR"
docker-compose up -d

if [ $? -eq 0 ]; then
    echo "✅ 监控服务启动成功"
else
    echo "❌ 监控服务启动失败"
    exit 1
fi

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 验证服务状态
echo "🔍 验证服务状态..."

# 检查Prometheus
if curl -s http://localhost:9090/-/healthy > /dev/null; then
    echo "✅ Prometheus服务运行正常"
else
    echo "❌ Prometheus服务异常"
fi

# 检查Grafana
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Grafana服务运行正常"
else
    echo "❌ Grafana服务异常"
fi

# 检查Alertmanager
if curl -s http://localhost:9093/-/ready > /dev/null; then
    echo "✅ Alertmanager服务运行正常"
else
    echo "❌ Alertmanager服务异常"
fi

# 检查应用指标端点
echo "📊 检查应用指标端点..."
if curl -s http://localhost:3000/api/procurement-intelligence/metrics > /dev/null; then
    echo "✅ 应用指标端点可用"
else
    echo "⚠️  应用指标端点暂时不可用（可能是应用尚未启动）"
fi

# 输出访问信息
echo ""
echo "=========================================="
echo "🎉 采购智能体监控体系部署完成！"
echo "=========================================="
echo ""
echo "🌐 访问地址:"
echo "  Prometheus: http://localhost:9090"
echo "  Grafana: http://localhost:3001 (用户名: admin, 密码: admin123)"
echo "  Alertmanager: http://localhost:9093"
echo ""
echo "📂 配置文件位置:"
echo "  $MONITORING_DIR/configs/"
echo ""
echo "🔧 管理命令:"
echo "  启动服务: cd $MONITORING_DIR && docker-compose up -d"
echo "  停止服务: cd $MONITORING_DIR && docker-compose down"
echo "  查看日志: cd $MONITORING_DIR && docker-compose logs -f"
echo "  重启服务: cd $MONITORING_DIR && docker-compose restart"
echo ""
echo "📝 注意事项:"
echo "  1. 请确保应用服务已在3000端口运行"
echo "  2. 首次登录Grafana后请及时修改默认密码"
echo "  3. 可在Grafana中导入采购智能体专用仪表板"
echo "  4. 告警规则可根据实际业务需求进行调整"