# FixCycle 监控配置指南

## 目录

1. [监控体系架构](#监控体系架构)
2. [监控脚本配置](#监控脚本配置)
3. [自动化调度设置](#自动化调度设置)
4. [告警规则配置](#告警规则配置)
5. [通知渠道集成](#通知渠道集成)
6. [监控仪表板](#监控仪表板)
7. [性能基准设定](#性能基准设定)
8. [故障排除](#故障排除)

---

## 监控体系架构

### 整体监控架构图

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   应用层监控    │    │   基础设施监控  │    │   业务监控      │
│                 │    │                 │    │                 │
│ • API响应时间   │    │ • CPU使用率     │    │ • 订单处理量    │
│ • 请求成功率    │    │ • 内存使用      │    │ • 数据质量      │
│ • 错误率        │    │ • 磁盘空间      │    │ • 业务指标      │
│ • 用户体验      │    │ • 网络延迟      │    │ • 关键流程      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    监控数据收集层                           │
│                                                             │
│  • check-*.js 脚本系列                                       │
│  • monitor-*.js 脚本系列                                     │
│  • Prometheus Exporter                                      │
│  • 自定义指标收集                                           │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    告警处理引擎                             │
│                                                             │
│  • 告警规则评估                                             │
│  • 告警去重和抑制                                           │
│  • 多渠道通知                                               │
│  • 告警升级机制                                             │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   邮件通知      │    │   Slack通知     │    │   企业微信      │
│                 │    │                 │    │                 │
│ • SMTP集成      │    │ • Webhook       │    │ • 机器人推送    │
│ • HTML模板      │    │ • 频道通知      │    │ • Markdown格式  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 监控层次结构

1. **基础设施层**: 服务器、网络、存储资源
2. **平台服务层**: 数据库、缓存、消息队列
3. **应用服务层**: API、业务逻辑、工作流引擎
4. **业务逻辑层**: 核心业务指标、用户体验
5. **安全合规层**: 访问控制、审计日志、安全事件

---

## 监控脚本配置

### 健康检查脚本系列

#### 1. 系统健康检查 (health-check-suite.js)

```javascript
// 配置文件: scripts/health-check-suite.js
const CHECK_SCRIPTS = [
  {
    name: '快速健康检查',
    script: 'quick-health-check.js',
    schedule: '*/15 * * * *',  // 每15分钟执行
    timeout: 30000  // 30秒超时
  },
  {
    name: '系统验证',
    script: 'system-validation.js',
    schedule: '0 * * * *',     // 每小时执行
    timeout: 60000  // 1分钟超时
  },
  {
    name: '环境检查',
    script: 'check-environment.js',
    schedule: '0 9 * * *',     // 每天上午9点执行
    timeout: 30000
  }
];

// 执行示例
node scripts/health-check-suite.js --environment production
```

#### 2. 数据库监控 (monitor-database.js)

```javascript
// 配置文件: scripts/monitor-database.js
const DB_MONITOR_CONFIG = {
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'fixcycle_db',
    user: process.env.DB_USER || 'postgres'
  },
  thresholds: {
    connections: {
      warning: 50,
      critical: 80
    },
    slow_queries: {
      threshold_ms: 1000,
      warning_count: 10,
      critical_count: 50
    },
    disk_space: {
      warning_percent: 80,
      critical_percent: 90
    }
  },
  schedule: '*/30 * * * *'  // 每30分钟执行
};

// 启动监控
node scripts/monitor-database.js --continuous --interval 1800000
```

#### 3. n8n 工作流监控 (n8n-monitor.js)

```javascript
// 配置文件: config/monitoring/n8n-monitor-config.json
{
  "monitoring": {
    "enabled": true,
    "check_interval_ms": 60000,
    "startup_delay_ms": 5000
  },
  "thresholds": {
    "failure_rate_percent": 10,
    "response_time_ms": 5000,
    "uptime_percent": 99.9,
    "consecutive_failures": 3
  },
  "notifications": {
    "channels": {
      "slack": {
        "enabled": true,
        "webhook_url": "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
      },
      "email": {
        "enabled": true,
        "smtp_config": {
          "host": "smtp.gmail.com",
          "port": 587,
          "secure": false
        }
      }
    }
  }
}

// 启动监控
node scripts/n8n-monitor.js --config config/monitoring/n8n-monitor-config.json
```

#### 4. 实时系统监控 (monitor-realtime-system.js)

```javascript
// 配置实时监控参数
const REALTIME_MONITOR_CONFIG = {
  metrics: {
    processing_rate: {
      warning_threshold: 100,  // 每秒处理事件数
      critical_threshold: 50
    },
    error_rate: {
      warning_threshold: 5,    // 错误率百分比
      critical_threshold: 15
    },
    queue_depth: {
      warning_threshold: 1000,
      critical_threshold: 5000
    }
  },
  reporting: {
    interval_seconds: 30,
    dashboard_port: 3001
  }
};

// 启动实时监控
node scripts/monitor-realtime-system.js --dashboard --port 3001
```

### 监控脚本使用说明

#### 批量执行健康检查

```bash
# 执行所有健康检查
node scripts/health-check-suite.js

# 指定环境执行
node scripts/health-check-suite.js --environment staging

# 输出JSON格式结果
node scripts/health-check-suite.js --format json > health-report.json

# 生成HTML报告
node scripts/health-check-suite.js --format html > health-report.html
```

#### 单独执行监控脚本

```bash
# 数据库监控（一次性）
node scripts/monitor-database.js --once

# 持续监控模式
node scripts/monitor-database.js --continuous --interval 30000

# n8n健康检查
node scripts/check-n8n-health.js --detailed

# 环境配置检查
node scripts/check-environment.js --verbose
```

---

## 自动化调度设置

### Windows 计划任务配置

#### 自动化部署脚本 (setup-windows-scheduler.bat)

```batch
@echo off
setlocal enabledelayedexpansion

echo ========================================
echo FixCycle Windows 监控调度配置工具
echo ========================================

REM 获取当前目录
set "PROJECT_DIR=%~dp0.."
cd /d "%PROJECT_DIR%"

echo 当前项目目录: %PROJECT_DIR%
echo.

REM 创建日志目录
if not exist "logs\scheduler" mkdir "logs\scheduler"

REM 配置健康检查任务（每小时执行）
echo [1/5] 配置健康检查任务...
schtasks /create /tn "FixCycle-HealthCheck" ^
  /tr "\"%PROGRAMFILES%\nodejs\node.exe\" \"%PROJECT_DIR%\scripts\health-check-suite.js\"" ^
  /sc hourly /mo 1 /ru "SYSTEM" ^
  /f >nul 2>&1

if !ERRORLEVEL! equ 0 (
  echo ✓ 健康检查任务配置成功
) else (
  echo ✗ 健康检查任务配置失败
)

REM 配置数据库监控任务（每30分钟执行）
echo [2/5] 配置数据库监控任务...
schtasks /create /tn "FixCycle-DB-Monitor" ^
  /tr "\"%PROGRAMFILES%\nodejs\node.exe\" \"%PROJECT_DIR%\scripts\monitor-database.js\" --continuous --interval 1800000" ^
  /sc minute /mo 30 /ru "SYSTEM" ^
  /f >nul 2>&1

if !ERRORLEVEL! equ 0 (
  echo ✓ 数据库监控任务配置成功
) else (
  echo ✗ 数据库监控任务配置失败
)

REM 配置备份任务（每日凌晨2点执行）
echo [3/5] 配置每日备份任务...
schtasks /create /tn "FixCycle-Daily-Backup" ^
  /tr "\"%PROGRAMFILES%\nodejs\node.exe\" \"%PROJECT_DIR%\scripts\backup-database.js\" backup" ^
  /sc daily /st 02:00 /ru "SYSTEM" ^
  /f >nul 2>&1

if !ERRORLEVEL! equ 0 (
  echo ✓ 备份任务配置成功
) else (
  echo ✗ 备份任务配置失败
)

REM 配置n8n监控任务（每5分钟执行）
echo [4/5] 配置n8n监控任务...
schtasks /create /tn "FixCycle-N8N-Monitor" ^
  /tr "\"%PROGRAMFILES%\nodejs\node.exe\" \"%PROJECT_DIR%\scripts\n8n-monitor.js\"" ^
  /sc minute /mo 5 /ru "SYSTEM" ^
  /f >nul 2>&1

if !ERRORLEVEL! equ 0 (
  echo ✓ n8n监控任务配置成功
) else (
  echo ✗ n8n监控任务配置失败
)

REM 配置实时系统监控（开机自启）
echo [5/5] 配置实时监控任务...
schtasks /create /tn "FixCycle-Realtime-Monitor" ^
  /tr "\"%PROGRAMFILES%\nodejs\node.exe\" \"%PROJECT_DIR%\scripts\monitor-realtime-system.js\" --daemon" ^
  /sc onstart /ru "SYSTEM" ^
  /f >nul 2>&1

if !ERRORLEVEL! equ 0 (
  echo ✓ 实时监控任务配置成功
) else (
  echo ✗ 实时监控任务配置失败
)

echo.
echo ========================================
echo 调度任务配置完成！
echo ========================================
echo 已配置的任务：
echo 1. FixCycle-HealthCheck (每小时)
echo 2. FixCycle-DB-Monitor (每30分钟)
echo 3. FixCycle-Daily-Backup (每日凌晨2点)
echo 4. FixCycle-N8N-Monitor (每5分钟)
echo 5. FixCycle-Realtime-Monitor (开机自启)
echo.
echo 查看任务状态：
echo schtasks /query /tn "FixCycle-*"
echo.
echo 手动运行任务：
echo schtasks /run /tn "FixCycle-HealthCheck"
echo.
pause
```

#### 管理 Windows 计划任务

```batch
REM 查看所有FixCycle相关任务
schtasks /query /tn "FixCycle-*" /fo LIST

REM 手动运行特定任务
schtasks /run /tn "FixCycle-HealthCheck"

REM 停止正在运行的任务
schtasks /end /tn "FixCycle-HealthCheck"

REM 删除任务
schtasks /delete /tn "FixCycle-HealthCheck" /f

REM 查看任务执行历史
wevtutil qe Microsoft-Windows-TaskScheduler/Operational /c:10 /rd:true /f:text
```

### Linux Cron 配置

#### 自动化部署脚本 (setup-linux-cron.sh)

```bash
#!/bin/bash

echo "========================================"
echo "FixCycle Linux 监控调度配置工具"
echo "========================================"

# 获取项目目录
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "当前项目目录: $PROJECT_DIR"
echo

# 创建日志目录
mkdir -p logs/scheduler

# 备份现有crontab
crontab -l > /tmp/old_crontab 2>/dev/null
echo "已备份现有crontab到 /tmp/old_crontab"

# 添加监控任务到crontab
(crontab -l 2>/dev/null; cat << EOF
# FixCycle 监控调度任务
# 每15分钟执行快速健康检查
*/15 * * * * cd "$PROJECT_DIR" && NODE_ENV=production timeout 60s node scripts/quick-health-check.js >> logs/scheduler/health-check.log 2>&1

# 每小时执行完整健康检查
0 * * * * cd "$PROJECT_DIR" && NODE_ENV=production timeout 120s node scripts/health-check-suite.js >> logs/scheduler/health-suite.log 2>&1

# 每30分钟执行数据库监控
*/30 * * * * cd "$PROJECT_DIR" && NODE_ENV=production timeout 90s node scripts/monitor-database.js --once >> logs/scheduler/db-monitor.log 2>&1

# 每日凌晨2点执行数据库备份
0 2 * * * cd "$PROJECT_DIR" && NODE_ENV=production timeout 300s node scripts/backup-database.js backup >> logs/scheduler/backup.log 2>&1

# 每5分钟检查n8n健康状态
*/5 * * * * cd "$PROJECT_DIR" && NODE_ENV=production timeout 60s node scripts/check-n8n-health.js >> logs/scheduler/n8n-health.log 2>&1

# 每10分钟清理旧日志（保留7天）
0 */2 * * * cd "$PROJECT_DIR" && find logs/ -name "*.log.*" -mtime +7 -delete

# 每周一凌晨3点清理旧备份（保留30天）
0 3 * * 1 cd "$PROJECT_DIR" && find backups/ -name "backup-*" -mtime +30 -delete

EOF
) | crontab -

if [ $? -eq 0 ]; then
    echo "✓ Cron任务配置成功"
else
    echo "✗ Cron任务配置失败"
    exit 1
fi

echo
echo "========================================"
echo "调度任务配置完成！"
echo "========================================"
echo "已配置的定时任务："
echo "*/15 * * * *  快速健康检查"
echo "0 * * * *     完整健康检查"
echo "*/30 * * * *  数据库监控"
echo "0 2 * * *     数据库备份"
echo "*/5 * * * *   n8n健康检查"
echo "0 */2 * * *   日志清理"
echo "0 3 * * 1     备份清理"
echo
echo "查看当前crontab："
echo "crontab -l"
echo
echo "查看任务执行日志："
echo "tail -f logs/scheduler/*.log"
echo
```

#### 管理 Linux Cron 任务

```bash
# 查看当前用户的crontab
crontab -l

# 编辑crontab
crontab -e

# 删除所有crontab任务
crontab -r

# 查看cron服务状态
systemctl status cron    # Ubuntu/Debian
systemctl status crond   # CentOS/RHEL

# 重启cron服务
sudo systemctl restart cron

# 查看cron日志
tail -f /var/log/cron    # CentOS/RHEL
tail -f /var/log/syslog | grep CRON  # Ubuntu/Debian
```

### 调度最佳实践

#### 任务执行时间规划

```
高峰时段 (9:00-18:00): 轻量级检查为主
低峰时段 (0:00-6:00): 重量级任务执行
```

#### 资源保护措施

```bash
# 使用timeout防止任务卡死
timeout 300s node scripts/heavy-task.js

# 使用nice降低任务优先级
nice -n 19 node scripts/background-task.js

# 内存限制（Linux）
ulimit -v 1048576  # 限制虚拟内存1GB
```

#### 任务依赖管理

```bash
# 确保任务顺序执行
0 2 * * * cd /project && ./scripts/pre-backup.sh && ./scripts/backup-database.js backup

# 使用锁文件防止并发执行
#!/bin/bash
LOCKFILE="/tmp/fixcycle-backup.lock"

if [ -f "$LOCKFILE" ]; then
    echo "备份任务已在运行" >&2
    exit 1
fi

touch "$LOCKFILE"
trap "rm -f $LOCKFILE" EXIT

# 执行备份任务
node scripts/backup-database.js backup
```

---

## 告警规则配置

### 告警级别定义

#### 告警严重程度分类

```javascript
const ALERT_LEVELS = {
  INFO: {
    threshold: 0,
    description: "信息性通知",
    color: "blue",
    notify_channels: ["slack"],
    escalation_time: null,
  },
  WARNING: {
    threshold: 70,
    description: "警告 - 需要关注",
    color: "yellow",
    notify_channels: ["slack", "email"],
    escalation_time: "2h", // 2小时后升级
  },
  CRITICAL: {
    threshold: 90,
    description: "严重 - 需要立即处理",
    color: "red",
    notify_channels: ["slack", "email", "sms"],
    escalation_time: "30m", // 30分钟后升级
  },
  EMERGENCY: {
    threshold: 95,
    description: "紧急 - 系统不可用",
    color: "red",
    notify_channels: ["slack", "email", "sms", "phone"],
    escalation_time: "5m", // 5分钟后升级
  },
};
```

### 核心告警规则

#### 1. 系统可用性告警

```javascript
const AVAILABILITY_RULES = {
  api_response_time: {
    metric: "http_response_time_avg",
    condition: ">",
    threshold: 2000, // 2秒
    duration: "5m", // 持续5分钟
    level: "WARNING",
    description: "API平均响应时间超过阈值",
  },
  service_uptime: {
    metric: "service_uptime_percent",
    condition: "<",
    threshold: 99.5, // 99.5%
    duration: "10m",
    level: "CRITICAL",
    description: "服务可用性低于标准",
  },
  error_rate: {
    metric: "http_error_rate",
    condition: ">",
    threshold: 5, // 5%错误率
    duration: "2m",
    level: "WARNING",
    description: "HTTP错误率异常升高",
  },
};
```

#### 2. 数据库告警规则

```javascript
const DATABASE_RULES = {
  db_connections: {
    metric: "postgresql_active_connections",
    condition: ">",
    threshold: 80, // 连接数阈值
    duration: "1m",
    level: "WARNING",
    description: "数据库连接数过高",
  },
  slow_queries: {
    metric: "postgresql_slow_queries_count",
    condition: ">",
    threshold: 10, // 慢查询数量
    duration: "5m",
    level: "WARNING",
    description: "慢查询数量异常",
  },
  disk_space: {
    metric: "disk_usage_percent",
    condition: ">",
    threshold: 85, // 磁盘使用率
    duration: "1m",
    level: "CRITICAL",
    description: "磁盘空间不足",
  },
  replication_lag: {
    metric: "postgresql_replication_lag_seconds",
    condition: ">",
    threshold: 30, // 30秒延迟
    duration: "1m",
    level: "CRITICAL",
    description: "数据库复制延迟过大",
  },
};
```

#### 3. 业务指标告警

```javascript
const BUSINESS_RULES = {
  order_processing: {
    metric: "orders_processed_per_minute",
    condition: "<",
    threshold: 10, // 每分钟订单处理数
    duration: "10m",
    level: "WARNING",
    description: "订单处理速度下降",
  },
  payment_success: {
    metric: "payment_success_rate",
    condition: "<",
    threshold: 95, // 支付成功率
    duration: "5m",
    level: "CRITICAL",
    description: "支付成功率异常降低",
  },
  data_quality: {
    metric: "data_quality_score",
    condition: "<",
    threshold: 80, // 数据质量评分
    duration: "15m",
    level: "WARNING",
    description: "数据质量评分偏低",
  },
};
```

### 告警配置文件示例

```json
{
  "alert_rules": {
    "system": {
      "api_response_time": {
        "enabled": true,
        "metric": "http_response_time_avg",
        "condition": "above",
        "threshold": 2000,
        "duration": "5m",
        "level": "warning",
        "cooldown": "10m",
        "notifications": ["slack", "email"]
      }
    },
    "database": {
      "high_connections": {
        "enabled": true,
        "metric": "db_active_connections",
        "condition": "above",
        "threshold": 80,
        "duration": "2m",
        "level": "warning",
        "cooldown": "15m",
        "notifications": ["slack", "email", "sms"]
      }
    }
  },
  "notification_settings": {
    "default_channels": ["slack", "email"],
    "escalation_policy": {
      "warning": {
        "initial": ["slack"],
        "after_30m": ["slack", "email"],
        "after_1h": ["slack", "email", "team_lead"]
      },
      "critical": {
        "initial": ["slack", "email", "sms"],
        "after_15m": ["slack", "email", "sms", "manager"],
        "after_1h": ["slack", "email", "sms", "manager", "oncall"]
      }
    }
  }
}
```

---

## 通知渠道集成

### 邮件通知配置

#### SMTP 配置示例

```javascript
// 配置文件: config/email-config.json
{
  "smtp": {
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": false,
    "auth": {
      "user": "monitoring@yourcompany.com",
      "pass": "your-app-password"
    }
  },
  "defaults": {
    "from": "FixCycle监控系统 <monitoring@yourcompany.com>",
    "to": ["admin@yourcompany.com", "ops-team@yourcompany.com"]
  },
  "templates": {
    "alert": {
      "subject": "[{{level}}] {{title}} - 系统告警",
      "body": "告警时间: {{timestamp}}\n告警级别: {{level}}\n告警内容: {{message}}\n\n详细信息: {{details}}"
    }
  }
}
```

#### 邮件发送脚本

```javascript
const nodemailer = require("nodemailer");

class EmailNotifier {
  constructor(config) {
    this.transporter = nodemailer.createTransporter({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.auth.user,
        pass: config.smtp.auth.pass,
      },
    });
    this.defaults = config.defaults;
  }

  async sendAlert(alert) {
    const mailOptions = {
      from: this.defaults.from,
      to: alert.recipients || this.defaults.to,
      subject: this.formatSubject(alert),
      html: this.formatHtmlBody(alert),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✓ 邮件告警已发送: ${alert.title}`);
    } catch (error) {
      console.error(`✗ 邮件发送失败: ${error.message}`);
    }
  }

  formatSubject(alert) {
    const levelEmoji =
      {
        info: "ℹ️",
        warning: "⚠️",
        critical: "🚨",
        emergency: "🆘",
      }[alert.level] || "📢";

    return `[${alert.level.toUpperCase()}] ${levelEmoji} ${alert.title}`;
  }

  formatHtmlBody(alert) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #ff4444;">${alert.title}</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>时间:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${new Date(
              alert.timestamp
            ).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>级别:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${alert.level.toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>来源:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${
              alert.source
            }</td>
          </tr>
        </table>
        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #007bff;">
          <h3>详细信息</h3>
          <pre style="white-space: pre-wrap;">${alert.message}</pre>
        </div>
        ${
          alert.metadata
            ? `
        <div style="margin-top: 20px;">
          <h3>附加信息</h3>
          <pre style="white-space: pre-wrap;">${JSON.stringify(
            alert.metadata,
            null,
            2
          )}</pre>
        </div>
        `
            : ""
        }
      </div>
    `;
  }
}
```

### Slack 通知集成

#### Slack Webhook 配置

```javascript
class SlackNotifier {
  constructor(webhookUrl) {
    this.webhookUrl = webhookUrl;
  }

  async sendAlert(alert) {
    const payload = {
      username: "FixCycle监控机器人",
      icon_emoji: this.getAlertEmoji(alert.level),
      attachments: [
        {
          color: this.getAlertColor(alert.level),
          title: alert.title,
          fields: [
            {
              title: "告警级别",
              value: alert.level.toUpperCase(),
              short: true,
            },
            {
              title: "时间",
              value: new Date(alert.timestamp).toLocaleString(),
              short: true,
            },
            {
              title: "来源",
              value: alert.source,
              short: true,
            },
          ],
          text: alert.message,
          footer: "FixCycle监控系统",
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    if (alert.metadata) {
      payload.attachments[0].fields.push({
        title: "详细信息",
        value: `\`\`\`${JSON.stringify(alert.metadata, null, 2)}\`\`\``,
        short: false,
      });
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log(`✓ Slack告警已发送: ${alert.title}`);
      } else {
        console.error(`✗ Slack发送失败: ${response.status}`);
      }
    } catch (error) {
      console.error(`✗ Slack请求错误: ${error.message}`);
    }
  }

  getAlertEmoji(level) {
    const emojis = {
      info: ":information_source:",
      warning: ":warning:",
      critical: ":rotating_light:",
      emergency: ":fire:",
    };
    return emojis[level] || ":bell:";
  }

  getAlertColor(level) {
    const colors = {
      info: "#439FE0",
      warning: "#FFA500",
      critical: "#E01E5A",
      emergency: "#FF0000",
    };
    return colors[level] || "#666666";
  }
}
```

### 企业微信通知

#### 企业微信机器人配置

```javascript
class WeChatNotifier {
  constructor(webhookUrl) {
    this.webhookUrl = webhookUrl;
  }

  async sendAlert(alert) {
    const payload = {
      msgtype: "markdown",
      markdown: {
        content: this.formatMarkdown(alert),
      },
    };

    try {
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log(`✓ 企业微信告警已发送: ${alert.title}`);
      } else {
        console.error(`✗ 企业微信发送失败: ${response.status}`);
      }
    } catch (error) {
      console.error(`✗ 企业微信请求错误: ${error.message}`);
    }
  }

  formatMarkdown(alert) {
    const levelEmoji =
      {
        info: "ℹ️",
        warning: "⚠️",
        critical: "🚨",
        emergency: "🆘",
      }[alert.level] || "🔔";

    let content = `## ${levelEmoji} 系统告警通知\n`;
    content += `**标题:** ${alert.title}\n`;
    content += `**级别:** ${alert.level.toUpperCase()}\n`;
    content += `**时间:** ${new Date(alert.timestamp).toLocaleString()}\n`;
    content += `**来源:** ${alert.source}\n\n`;
    content += `### 告警详情\n${alert.message}\n\n`;

    if (alert.metadata) {
      content += `### 附加信息\n\`\`\`json\n${JSON.stringify(
        alert.metadata,
        null,
        2
      )}\n\`\`\``;
    }

    return content;
  }
}
```

### Telegram 通知

#### Telegram Bot 配置

```javascript
class TelegramNotifier {
  constructor(botToken, chatId) {
    this.botToken = botToken;
    this.chatId = chatId;
    this.apiUrl = `https://api.telegram.org/bot${botToken}`;
  }

  async sendAlert(alert) {
    const message = this.formatMessage(alert);

    try {
      const response = await fetch(`${this.apiUrl}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
          parse_mode: "HTML",
        }),
      });

      if (response.ok) {
        console.log(`✓ Telegram告警已发送: ${alert.title}`);
      } else {
        console.error(`✗ Telegram发送失败: ${response.status}`);
      }
    } catch (error) {
      console.error(`✗ Telegram请求错误: ${error.message}`);
    }
  }

  formatMessage(alert) {
    const levelEmoji =
      {
        info: "ℹ️",
        warning: "⚠️",
        critical: "🚨",
        emergency: "🆘",
      }[alert.level] || "🔔";

    return (
      `<b>${levelEmoji} 系统告警</b>\n\n` +
      `<b>标题:</b> ${alert.title}\n` +
      `<b>级别:</b> ${alert.level.toUpperCase()}\n` +
      `<b>时间:</b> ${new Date(alert.timestamp).toLocaleString()}\n` +
      `<b>来源:</b> ${alert.source}\n\n` +
      `<b>详情:</b>\n<pre>${alert.message}</pre>`
    );
  }
}
```

---

## 监控仪表板

### Prometheus 集成配置

#### Prometheus 配置文件

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: "fixcycle-app"
    static_configs:
      - targets: ["localhost:3000"]
    metrics_path: "/api/metrics"

  - job_name: "fixcycle-database"
    static_configs:
      - targets: ["localhost:9187"] # PostgreSQL exporter

  - job_name: "fixcycle-n8n"
    static_configs:
      - targets: ["localhost:5678"]
    metrics_path: "/metrics"

rule_files:
  - "fixcycle-alerts.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets: ["localhost:9093"]
```

#### 自定义指标导出

```javascript
// 在应用中暴露Prometheus指标
const client = require("prom-client");

// 创建指标
const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
});

const activeConnections = new client.Gauge({
  name: "active_database_connections",
  help: "Number of active database connections",
});

const orderProcessingRate = new client.Counter({
  name: "orders_processed_total",
  help: "Total number of orders processed",
});

// 在中间件中记录指标
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on("finish", () => {
    end({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status_code: res.statusCode,
    });
  });
  next();
});
```

### Grafana 仪表板配置

#### 仪表板 JSON 配置示例

```json
{
  "dashboard": {
    "title": "FixCycle 系统监控",
    "panels": [
      {
        "title": "API响应时间",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "数据库连接数",
        "type": "gauge",
        "targets": [
          {
            "expr": "active_database_connections",
            "legendFormat": "连接数"
          }
        ]
      },
      {
        "title": "系统健康状态",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=\"fixcycle-app\"}",
            "legendFormat": "应用状态"
          }
        ]
      }
    ]
  }
}
```

---

## 性能基准设定

### 关键性能指标(KPI)基准

#### 响应时间基准

```javascript
const PERFORMANCE_BENCHMARKS = {
  api_response_time: {
    p50: 100, // 50%请求在100ms内完成
    p95: 500, // 95%请求在500ms内完成
    p99: 1000, // 99%请求在1000ms内完成
    max: 5000, // 最大响应时间5秒
  },
  database_query_time: {
    p50: 50,
    p95: 200,
    p99: 500,
    max: 2000,
  },
  page_load_time: {
    p50: 800,
    p95: 2000,
    p99: 3000,
    max: 5000,
  },
};
```

#### 吞吐量基准

```javascript
const THROUGHPUT_BENCHMARKS = {
  requests_per_second: {
    normal: 100,
    peak: 500,
    maximum: 1000,
  },
  database_transactions: {
    normal: 200,
    peak: 1000,
    maximum: 2000,
  },
  message_processing: {
    normal: 50,
    peak: 200,
    maximum: 500,
  },
};
```

### 基准测试脚本

```javascript
// benchmark-runner.js
const autocannon = require("autocannon");

async function runBenchmark(target, config) {
  const result = await autocannon({
    url: target,
    connections: config.connections,
    pipelining: config.pipelining,
    duration: config.duration,
    requests: config.requests,
  });

  return {
    requests: {
      average: result.requests.average,
      mean: result.requests.mean,
      stddev: result.stddev,
    },
    latency: {
      average: result.latency.average,
      p50: result.latency.p50,
      p95: result.latency.p95,
      p99: result.latency.p99,
    },
    throughput: result.throughput,
    errors: result.errors,
  };
}

// 执行基准测试
const benchmarks = {
  "api-endpoint": {
    target: "http://localhost:3000/api/health",
    config: {
      connections: 100,
      duration: 60,
      pipelining: 1,
    },
  },
};

Object.entries(benchmarks).forEach(async ([name, { target, config }]) => {
  console.log(`运行基准测试: ${name}`);
  const result = await runBenchmark(target, config);
  console.log(JSON.stringify(result, null, 2));
});
```

---

## 故障排除

### 常见监控问题及解决方案

#### 1. 监控脚本执行失败

```bash
# 检查脚本权限
ls -la scripts/*.js
chmod +x scripts/*.js

# 检查Node.js版本
node --version
npm --version

# 检查依赖包
npm list | grep missing

# 查看脚本执行日志
tail -f logs/scheduler/*.log
```

#### 2. 告警不触发

```bash
# 检查告警规则配置
cat config/alert-rules.json

# 测试告警条件
node scripts/test-alert-conditions.js

# 检查通知渠道配置
node scripts/test-notifications.js

# 查看告警日志
grep "ALERT" logs/app.log
```

#### 3. 性能监控数据异常

```bash
# 检查Prometheus抓取状态
curl http://localhost:9090/targets

# 验证指标端点
curl http://localhost:3000/api/metrics

# 检查系统资源
top
iostat -x 1
```

#### 4. 调度任务不执行

```bash
# Windows检查计划任务
schtasks /query /tn "FixCycle-*"

# Linux检查cron任务
crontab -l
systemctl status cron

# 检查任务执行日志
journalctl -u cron
```

### 监控系统维护清单

#### 日常检查项目

- [ ] 检查监控脚本执行状态
- [ ] 验证告警通知渠道可用性
- [ ] 审查告警历史和处理情况
- [ ] 检查监控数据完整性和准确性

#### 周期性维护任务

- [ ] 更新告警阈值和规则
- [ ] 优化监控查询性能
- [ ] 清理过期的监控数据
- [ ] 验证备份和恢复流程

#### 月度评审项目

- [ ] 分析监控覆盖率
- [ ] 评估告警有效性
- [ ] 审查系统性能趋势
- [ ] 更新监控策略和配置

---

## 附录

### 监控术语表

| 术语     | 说明             |
| -------- | ---------------- |
| SLA      | 服务等级协议     |
| SLO      | 服务等级目标     |
| SLI      | 服务等级指标     |
| MTTR     | 平均修复时间     |
| MTBF     | 平均故障间隔时间 |
| 百分位数 | 性能分布统计     |

### 参考资料

- Prometheus 官方文档: https://prometheus.io/docs/
- Grafana 仪表板示例: https://grafana.com/grafana/dashboards/
- Node.js 性能监控最佳实践
- 微服务监控模式

---

_本文档最后更新时间: 2024 年 1 月 25 日_
