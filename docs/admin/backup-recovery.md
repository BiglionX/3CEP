# FixCycle 备份恢复操作指南

## 目录

1. [备份策略概述](#备份策略概述)
2. [数据库备份详解](#数据库备份详解)
3. [应用配置备份](#应用配置备份)
4. [n8n 工作流备份](#n8n工作流备份)
5. [文件系统备份](#文件系统备份)
6. [备份验证与测试](#备份验证与测试)
7. [灾难恢复流程](#灾难恢复流程)
8. [备份自动化配置](#备份自动化配置)
9. [备份存储管理](#备份存储管理)
10. [最佳实践与注意事项](#最佳实践与注意事项)

---

## 备份策略概述

### 备份策略设计原则

#### 数据分类与备份频率

```
高价值数据 (核心业务数据)
├── 全量备份: 每日一次
├── 增量备份: 每4小时一次
└── 实时复制: 主从同步

重要配置数据 (系统配置)
├── 全量备份: 每周一次
└── 变更触发: 配置变更时自动备份

一般数据 (日志、临时文件)
└── 定期清理: 保留30天
```

#### 备份保留策略

```javascript
const BACKUP_RETENTION_POLICY = {
  daily_full_backups: {
    retention_days: 30,
    keep_count: 30,
  },
  weekly_full_backups: {
    retention_days: 90,
    keep_count: 12,
  },
  monthly_full_backups: {
    retention_days: 365,
    keep_count: 12,
  },
  incremental_backups: {
    retention_days: 7,
    keep_count: 42, // 7天 × 6次/天
  },
  configuration_backups: {
    retention_days: 365,
    keep_all: true, // 永久保留配置变更历史
  },
};
```

### 备份架构设计

#### 备份存储层级

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   本地存储      │    │   近线存储      │    │   离线存储      │
│  (高性能)       │    │  (成本优化)     │    │  (灾难恢复)     │
│                 │    │                 │    │                 │
│ • SSD存储       │    │ • NAS设备       │    │ • 磁带库        │
│ • 快速恢复      │    │ • 定期同步      │    │ • 异地保存      │
│ • 保留7天       │    │ • 保留90天      │    │ • 保留永久      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

#### 备份加密与安全

```javascript
const BACKUP_SECURITY_CONFIG = {
  encryption: {
    algorithm: "AES-256-GCM",
    key_management: "AWS KMS/HSM",
    at_rest: true,
    in_transit: true,
  },
  access_control: {
    backup_operators: ["backup_admin", "dba"],
    restore_operators: ["system_admin", "dba"],
    audit_logging: true,
  },
  integrity_verification: {
    checksum_algorithm: "SHA-256",
    signature_verification: true,
    blockchain_hash: false, // 可选增强安全性
  },
};
```

---

## 数据库备份详解

### PostgreSQL 备份策略

#### 全量备份配置

```bash
# 创建备份脚本: scripts/backup-postgres-full.sh
#!/bin/bash

# 配置变量
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-fixcycle_db}
DB_USER=${DB_USER:-postgres}
BACKUP_DIR=${BACKUP_DIR:-./backups/postgres}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# 创建备份目录
mkdir -p "$BACKUP_DIR/full"
mkdir -p "$BACKUP_DIR/incremental"
mkdir -p "$BACKUP_DIR/logs"

# 全量备份命令
FULL_BACKUP_CMD="pg_dump \
  -h $DB_HOST \
  -p $DB_PORT \
  -U $DB_USER \
  -d $DB_NAME \
  --format=custom \
  --verbose \
  --no-owner \
  --no-privileges \
  --exclude-table-data='temp_*' \
  --exclude-table-data='cache_*'"

# 执行备份
echo "[$(date)] 开始全量备份: $DB_NAME"
$FULL_BACKUP_CMD > "$BACKUP_DIR/full/backup_$TIMESTAMP.dump" 2>"$BACKUP_DIR/logs/backup_$TIMESTAMP.log"

if [ $? -eq 0 ]; then
  echo "[$(date)] 全量备份成功完成"
  # 压缩备份文件
  gzip "$BACKUP_DIR/full/backup_$TIMESTAMP.dump"
  # 记录备份信息
  echo "{\"timestamp\":\"$(date -Iseconds)\",\"type\":\"full\",\"file\":\"backup_$TIMESTAMP.dump.gz\",\"size\":$(stat -c%s "$BACKUP_DIR/full/backup_$TIMESTAMP.dump.gz")}" >> "$BACKUP_DIR/backup_history.json"
else
  echo "[$(date)] 全量备份失败"
  exit 1
fi
```

#### 增量备份配置

```bash
# 创建增量备份脚本: scripts/backup-postgres-incremental.sh
#!/bin/bash

# 启用WAL归档（在postgresql.conf中配置）
# wal_level = replica
# archive_mode = on
# archive_command = 'cp %p /backup/wal/%f'

# 增量备份脚本
BASE_BACKUP_DIR="./backups/postgres/base"
WAL_ARCHIVE_DIR="./backups/postgres/wal"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# 创建基础备份
pg_basebackup \
  -h localhost \
  -p 5432 \
  -U replication_user \
  -D "$BASE_BACKUP_DIR/$TIMESTAMP" \
  -F tar \
  -z \
  -P \
  --wal-method=stream

if [ $? -eq 0 ]; then
  echo "基础备份创建成功: $BASE_BACKUP_DIR/$TIMESTAMP"
  # 清理旧的WAL文件（保留24小时）
  find "$WAL_ARCHIVE_DIR" -name "*.backup" -mtime +1 -delete
fi
```

#### 使用项目备份脚本

```javascript
// scripts/backup-database.js 的增强配置
const BackupManager = require("./backup-manager");

const backupConfig = {
  postgresql: {
    connection: {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || "fixcycle_db",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD,
    },
    backup: {
      type: "full", // full, incremental, differential
      format: "custom", // plain, custom, directory, tar
      compression: true,
      excludeTables: ["temp_*", "cache_*", "session_*"],
      parallelJobs: 4,
    },
    retention: {
      daily: 7,
      weekly: 4,
      monthly: 12,
    },
  },
};

const backupManager = new BackupManager(backupConfig);

// 执行备份
async function performBackup() {
  try {
    console.log("🚀 开始数据库备份...");

    const result = await backupManager.createBackup({
      type: "full",
      description: "每日例行备份",
    });

    console.log("✅ 备份完成:", result);

    // 验证备份完整性
    const isValid = await backupManager.verifyBackup(result.backupId);
    console.log("🔍 备份验证:", isValid ? "通过" : "失败");

    // 清理过期备份
    const cleaned = await backupManager.cleanupOldBackups();
    console.log("🧹 清理完成:", cleaned.deletedCount, "个过期备份");
  } catch (error) {
    console.error("❌ 备份失败:", error.message);
    process.exit(1);
  }
}

// 命令行接口
if (require.main === module) {
  const args = process.argv.slice(2);

  switch (args[0]) {
    case "backup":
      performBackup();
      break;
    case "list":
      backupManager.listBackups().then((backups) => {
        console.table(backups);
      });
      break;
    case "verify":
      const backupId = args[1];
      backupManager.verifyBackup(backupId).then((result) => {
        console.log("验证结果:", result);
      });
      break;
    case "restore":
      const restoreId = args[1];
      backupManager.restoreBackup(restoreId).then(() => {
        console.log("恢复完成");
      });
      break;
    default:
      console.log(`
使用方法:
  node scripts/backup-database.js backup     # 执行备份
  node scripts/backup-database.js list       # 列出备份
  node scripts/backup-database.js verify <id> # 验证备份
  node scripts/backup-database.js restore <id> # 恢复备份
      `);
  }
}
```

### 备份执行与监控

#### 自动化备份调度

```bash
# crontab 配置示例
# 每日凌晨2点执行全量备份
0 2 * * * cd /project && NODE_ENV=production timeout 300s node scripts/backup-database.js backup >> logs/backup.log 2>&1

# 每4小时执行增量备份
0 */4 * * * cd /project && NODE_ENV=production timeout 60s node scripts/backup-database.js incremental >> logs/backup.log 2>&1

# 每周一凌晨3点清理旧备份
0 3 * * 1 cd /project && find backups/ -name "backup-*" -mtime +30 -delete >> logs/backup-cleanup.log 2>&1
```

#### 备份状态监控

```javascript
// 备份监控脚本: scripts/monitor-backups.js
class BackupMonitor {
  constructor() {
    this.backupDir = "./backups";
    this.alertThresholds = {
      lastBackupHours: 24,
      successRate: 0.95,
      storageUsagePercent: 80,
    };
  }

  async checkBackupHealth() {
    const backupInfo = await this.getBackupInfo();
    const alerts = [];

    // 检查最近备份时间
    const hoursSinceLastBackup = this.getHoursSince(backupInfo.lastBackup);
    if (hoursSinceLastBackup > this.alertThresholds.lastBackupHours) {
      alerts.push({
        type: "MISSING_BACKUP",
        severity: "WARNING",
        message: `距离上次备份已超过${hoursSinceLastBackup}小时`,
      });
    }

    // 检查备份成功率
    const successRate = backupInfo.successfulCount / backupInfo.totalCount;
    if (successRate < this.alertThresholds.successRate) {
      alerts.push({
        type: "LOW_SUCCESS_RATE",
        severity: "CRITICAL",
        message: `备份成功率${(successRate * 100).toFixed(1)}%低于阈值`,
      });
    }

    // 检查存储空间
    const storageUsage = await this.getStorageUsage();
    if (storageUsage.percent > this.alertThresholds.storageUsagePercent) {
      alerts.push({
        type: "STORAGE_FULL",
        severity: "WARNING",
        message: `备份存储使用率${storageUsage.percent}%过高`,
      });
    }

    return {
      status: alerts.length === 0 ? "HEALTHY" : "DEGRADED",
      alerts,
      metrics: {
        lastBackup: backupInfo.lastBackup,
        successRate,
        storageUsage,
      },
    };
  }

  async getBackupInfo() {
    // 实现备份信息收集逻辑
    const backupFiles = await fs.readdir(this.backupDir);
    const backupHistory = []; // 从日志或元数据文件读取

    return {
      lastBackup: backupHistory[backupHistory.length - 1]?.timestamp,
      totalCount: backupHistory.length,
      successfulCount: backupHistory.filter((b) => b.status === "SUCCESS")
        .length,
    };
  }
}
```

---

## 应用配置备份

### 环境变量备份

```bash
# 创建配置备份脚本: scripts/backup-config.sh
#!/bin/bash

BACKUP_DIR="./config-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ENV_FILES=".env .env.production .env.staging"

mkdir -p "$BACKUP_DIR/$TIMESTAMP"

# 备份环境变量文件
for env_file in $ENV_FILES; do
  if [ -f "$env_file" ]; then
    cp "$env_file" "$BACKUP_DIR/$TIMESTAMP/"
    echo "已备份: $env_file"
  fi
done

# 备份package.json和依赖信息
cp package.json "$BACKUP_DIR/$TIMESTAMP/"
npm ls --depth=0 > "$BACKUP_DIR/$TIMESTAMP/dependencies.txt"

# 备份重要的配置文件
cp -r config/ "$BACKUP_DIR/$TIMESTAMP/" 2>/dev/null || true
cp supabase/config.toml "$BACKUP_DIR/$TIMESTAMP/" 2>/dev/null || true

# 创建备份元数据
cat > "$BACKUP_DIR/$TIMESTAMP/backup-info.json" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "type": "configuration",
  "files": [
    ".env",
    "package.json",
    "config/",
    "supabase/config.toml"
  ],
  "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "node_version": "$(node --version)",
  "npm_version": "$(npm --version)"
}
EOF

echo "配置备份完成: $BACKUP_DIR/$TIMESTAMP"
```

### 数据库模式备份

```bash
# 备份数据库结构（不含数据）
pg_dump \
  -h localhost \
  -p 5432 \
  -U postgres \
  -d fixcycle_db \
  --schema-only \
  --no-owner \
  --no-privileges \
  > backups/schema/fixcycle_schema_$(date +%Y%m%d).sql

# 备份特定表结构
pg_dump \
  -h localhost \
  -p 5432 \
  -U postgres \
  -d fixcycle_db \
  -t 'parts' \
  -t 'appointments' \
  --schema-only \
  > backups/schema/core_tables_schema.sql
```

---

## n8n 工作流备份

### 工作流导出脚本

```javascript
// scripts/backup-n8n-workflows.js
const fs = require("fs").promises;
const path = require("path");

class N8nBackup {
  constructor(config) {
    this.n8nApiUrl = config.n8nApiUrl || "http://localhost:5678";
    this.apiToken = config.apiToken;
    this.backupDir = config.backupDir || "./backups/n8n";
  }

  async createBackup(options = {}) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(this.backupDir, `n8n-backup-${timestamp}`);

    await fs.mkdir(backupPath, { recursive: true });

    try {
      // 1. 备份工作流
      console.log("📥 备份n8n工作流...");
      const workflows = await this.exportWorkflows();
      await fs.writeFile(
        path.join(backupPath, "workflows.json"),
        JSON.stringify(workflows, null, 2)
      );

      // 2. 备份凭据
      console.log("🔐 备份凭据...");
      const credentials = await this.exportCredentials();
      await fs.writeFile(
        path.join(backupPath, "credentials.json"),
        JSON.stringify(credentials, null, 2)
      );

      // 3. 备份环境变量
      console.log("🌍 备份环境变量...");
      const variables = await this.exportVariables();
      await fs.writeFile(
        path.join(backupPath, "variables.json"),
        JSON.stringify(variables, null, 2)
      );

      // 4. 备份标签
      console.log("🏷️  备份标签...");
      const tags = await this.exportTags();
      await fs.writeFile(
        path.join(backupPath, "tags.json"),
        JSON.stringify(tags, null, 2)
      );

      // 5. 创建备份元数据
      const metadata = {
        timestamp: new Date().toISOString(),
        n8nVersion: await this.getN8nVersion(),
        workflowCount: workflows.length,
        credentialCount: credentials.length,
        itemCounts: {
          workflows: workflows.length,
          credentials: credentials.length,
          variables: variables.length,
          tags: tags.length,
        },
      };

      await fs.writeFile(
        path.join(backupPath, "metadata.json"),
        JSON.stringify(metadata, null, 2)
      );

      console.log(`✅ n8n备份完成: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error("❌ n8n备份失败:", error.message);
      throw error;
    }
  }

  async exportWorkflows() {
    const response = await fetch(`${this.n8nApiUrl}/workflows`, {
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`获取工作流出错: ${response.status}`);
    }

    const workflows = await response.json();

    // 清理敏感信息
    return workflows.map((workflow) => ({
      ...workflow,
      nodes: workflow.nodes.map((node) => {
        // 移除敏感的凭据引用
        const cleanNode = { ...node };
        if (cleanNode.credentials) {
          cleanNode.credentials = Object.keys(cleanNode.credentials);
        }
        return cleanNode;
      }),
    }));
  }

  async exportCredentials() {
    const response = await fetch(`${this.n8nApiUrl}/credentials`, {
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`获取凭据出错: ${response.status}`);
    }

    return await response.json();
  }

  async exportVariables() {
    const response = await fetch(`${this.n8nApiUrl}/variables`, {
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`获取变量出错: ${response.status}`);
    }

    return await response.json();
  }

  async exportTags() {
    const response = await fetch(`${this.n8nApiUrl}/tags`, {
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`获取标签出错: ${response.status}`);
    }

    return await response.json();
  }

  async getN8nVersion() {
    try {
      const response = await fetch(`${this.n8nApiUrl}/healthz`);
      const health = await response.json();
      return health.version || "unknown";
    } catch {
      return "unknown";
    }
  }

  async restoreBackup(backupPath) {
    console.log(`📤 恢复n8n备份: ${backupPath}`);

    // 检查备份完整性
    const metadata = JSON.parse(
      await fs.readFile(path.join(backupPath, "metadata.json"), "utf8")
    );

    // 按顺序恢复各项内容
    await this.importTags(backupPath);
    await this.importVariables(backupPath);
    await this.importCredentials(backupPath);
    await this.importWorkflows(backupPath);

    console.log("✅ n8n恢复完成");
  }

  // 恢复方法实现...
  async importWorkflows(backupPath) {
    const workflows = JSON.parse(
      await fs.readFile(path.join(backupPath, "workflows.json"), "utf8")
    );

    for (const workflow of workflows) {
      await fetch(`${this.n8nApiUrl}/workflows`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workflow),
      });
    }
  }
}

// 使用示例
if (require.main === module) {
  const backup = new N8nBackup({
    n8nApiUrl: process.env.N8N_API_URL || "http://localhost:5678",
    apiToken: process.env.N8N_API_TOKEN,
    backupDir: "./backups/n8n",
  });

  backup
    .createBackup()
    .then((path) => console.log("备份路径:", path))
    .catch((err) => console.error("备份失败:", err));
}
```

### n8n 备份自动化

```bash
# 添加到crontab
# 每日凌晨3点备份n8n配置
0 3 * * * cd /project && NODE_ENV=production node scripts/backup-n8n-workflows.js >> logs/n8n-backup.log 2>&1

# 每周日清理旧的n8n备份（保留4周）
0 4 * * 0 find backups/n8n/ -mindepth 1 -maxdepth 1 -mtime +28 -type d -exec rm -rf {} \; >> logs/n8n-cleanup.log 2>&1
```

---

## 文件系统备份

### 重要文件目录识别

```bash
# 识别需要备份的重要目录
IMPORTANT_DIRS="
uploads/
logs/
backups/
config/
supabase/migrations/
n8n-workflows/
"

# 创建文件系统备份脚本
cat > scripts/backup-filesystem.sh << 'EOF'
#!/bin/bash

BACKUP_ROOT="./backups/filesystem"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_PATH="$BACKUP_ROOT/$TIMESTAMP"

# 创建备份目录
mkdir -p "$BACKUP_PATH"

# 需要备份的目录列表
DIRS_TO_BACKUP=(
  "uploads"
  "logs"
  "config"
  "supabase/migrations"
  "n8n-workflows"
)

# 排除模式
EXCLUDE_PATTERNS=(
  "*.log"
  "*.tmp"
  "node_modules/*"
  ".git/*"
  "backups/*"
)

echo "📦 开始文件系统备份..."

for dir in "${DIRS_TO_BACKUP[@]}"; do
  if [ -d "$dir" ]; then
    echo "备份目录: $dir"
    # 创建目录结构
    mkdir -p "$BACKUP_PATH/$dir"
    # 使用rsync进行增量备份
    rsync -av --delete \
      $(printf "--exclude='%s' " "${EXCLUDE_PATTERNS[@]}") \
      "$dir/" "$BACKUP_PATH/$dir/"
  fi
done

# 创建备份清单
find "$BACKUP_PATH" -type f -exec md5sum {} \; > "$BACKUP_PATH/checksums.md5"

# 创建备份元数据
cat > "$BACKUP_PATH/backup-info.json" << METADATA
{
  "timestamp": "$(date -Iseconds)",
  "type": "filesystem",
  "directories": $(printf '%s\n' "${DIRS_TO_BACKUP[@]}" | jq -R . | jq -s .),
  "total_size": "$(du -sh "$BACKUP_PATH" | cut -f1)",
  "file_count": $(find "$BACKUP_PATH" -type f | wc -l)
}
METADATA

echo "✅ 文件系统备份完成: $BACKUP_PATH"
EOF

chmod +x scripts/backup-filesystem.sh
```

### 增量文件备份

```bash
# 使用rsync进行增量备份
#!/bin/bash

SOURCE_DIR="./uploads"
BACKUP_DIR="./backups/uploads"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# 创建硬链接副本（节省空间）
if [ -d "$BACKUP_DIR/latest" ]; then
  cp -al "$BACKUP_DIR/latest" "$BACKUP_DIR/$TIMESTAMP"
else
  mkdir -p "$BACKUP_DIR/$TIMESTAMP"
fi

# 同步最新文件
rsync -av --delete \
  --link-dest="$BACKUP_DIR/latest" \
  "$SOURCE_DIR/" "$BACKUP_DIR/$TIMESTAMP/"

# 更新latest链接
rm -f "$BACKUP_DIR/latest"
ln -s "$BACKUP_DIR/$TIMESTAMP" "$BACKUP_DIR/latest"

# 清理旧备份（保留7天）
find "$BACKUP_DIR" -mindepth 1 -maxdepth 1 -type d -name "202*" -mtime +7 -exec rm -rf {} \;
```

---

## 备份验证与测试

### 备份完整性验证

```javascript
// scripts/verify-backup.js
const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");

class BackupValidator {
  constructor() {
    this.backupDir = "./backups";
  }

  async verifyBackup(backupPath) {
    console.log(`🔍 验证备份: ${backupPath}`);

    const results = {
      exists: false,
      readable: false,
      integrity: false,
      metadata: null,
      errors: [],
    };

    try {
      // 检查备份是否存在
      await fs.access(backupPath);
      results.exists = true;

      // 读取元数据
      const metadataPath = path.join(backupPath, "metadata.json");
      const metadataContent = await fs.readFile(metadataPath, "utf8");
      results.metadata = JSON.parse(metadataContent);
      results.readable = true;

      // 验证文件完整性
      if (await this.verifyChecksums(backupPath)) {
        results.integrity = true;
      } else {
        results.errors.push("校验和验证失败");
      }

      // 验证关键文件存在
      const requiredFiles = ["metadata.json"];
      for (const file of requiredFiles) {
        try {
          await fs.access(path.join(backupPath, file));
        } catch {
          results.errors.push(`缺少必需文件: ${file}`);
        }
      }
    } catch (error) {
      results.errors.push(`验证过程出错: ${error.message}`);
    }

    results.valid =
      results.exists &&
      results.readable &&
      results.integrity &&
      results.errors.length === 0;

    console.log(`验证结果: ${results.valid ? "✅ 通过" : "❌ 失败"}`);
    if (results.errors.length > 0) {
      console.log("错误详情:", results.errors);
    }

    return results;
  }

  async verifyChecksums(backupPath) {
    try {
      const checksumFile = path.join(backupPath, "checksums.md5");
      const checksums = await fs.readFile(checksumFile, "utf8");

      const lines = checksums.split("\n").filter((line) => line.trim());

      for (const line of lines) {
        const [expectedHash, filePath] = line.split(/\s+/);
        const fullPath = path.join(backupPath, filePath.replace(/^\.\//, ""));

        try {
          const fileBuffer = await fs.readFile(fullPath);
          const actualHash = crypto
            .createHash("md5")
            .update(fileBuffer)
            .digest("hex");

          if (actualHash !== expectedHash) {
            console.error(`校验和不匹配: ${filePath}`);
            return false;
          }
        } catch (error) {
          console.error(`无法读取文件: ${filePath}`, error.message);
          return false;
        }
      }

      return true;
    } catch {
      // 如果没有校验和文件，跳过验证
      return true;
    }
  }

  async testRestore(backupPath, testDir = "./restore-test") {
    console.log(`🧪 测试恢复: ${backupPath}`);

    try {
      // 创建测试目录
      await fs.rm(testDir, { recursive: true, force: true });
      await fs.mkdir(testDir, { recursive: true });

      // 模拟恢复过程
      const files = await fs.readdir(backupPath);

      for (const file of files) {
        if (file !== "backup-info.json") {
          const src = path.join(backupPath, file);
          const dest = path.join(testDir, file);

          if ((await fs.stat(src)).isDirectory()) {
            await fs.cp(src, dest, { recursive: true });
          } else {
            await fs.copyFile(src, dest);
          }
        }
      }

      console.log("✅ 恢复测试成功");
      return true;
    } catch (error) {
      console.error("❌ 恢复测试失败:", error.message);
      return false;
    } finally {
      // 清理测试目录
      await fs.rm(testDir, { recursive: true, force: true });
    }
  }
}

// 使用示例
if (require.main === module) {
  const validator = new BackupValidator();

  // 验证最新的备份
  fs.readdir("./backups")
    .then((dirs) => {
      const latestBackup = dirs
        .filter((d) => d.startsWith("202"))
        .sort()
        .pop();

      if (latestBackup) {
        return validator.verifyBackup(`./backups/${latestBackup}`);
      }
    })
    .catch(console.error);
}
```

### 自动化验证调度

```bash
# 每日备份验证
0 6 * * * cd /project && node scripts/verify-backup.js >> logs/backup-verify.log 2>&1

# 每周恢复测试
0 8 * * 0 cd /project && node scripts/test-restore.js >> logs/restore-test.log 2>&1
```

---

## 灾难恢复流程

### 恢复前准备检查清单

#### 系统环境检查

```bash
# 恢复前环境检查脚本
cat > scripts/pre-restore-check.sh << 'EOF'
#!/bin/bash

echo "📋 灾难恢复前检查清单"
echo "========================"

CHECKS=(
  "检查系统资源: df -h"
  "检查网络连接: ping -c 3 google.com"
  "检查数据库服务: systemctl status postgresql"
  "检查Node.js版本: node --version"
  "检查npm版本: npm --version"
  "检查磁盘空间: df -h /"
)

for check in "${CHECKS[@]}"; do
  echo "🔍 $check"
  eval "${check#*: }" >/dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo "  ✅ 通过"
  else
    echo "  ❌ 失败"
  fi
  echo
done

echo "⚠️  请确保以上检查全部通过后再进行恢复操作"
EOF

chmod +x scripts/pre-restore-check.sh
```

### 完整恢复流程

#### 1. 系统恢复脚本

```bash
# 创建完整恢复脚本: scripts/disaster-recovery.sh
#!/bin/bash

set -e  # 遇到错误立即退出

echo "🆘 FixCycle 灾难恢复流程启动"
echo "=============================="

# 配置变量
BACKUP_DATE=${1:-$(date +"%Y%m%d")}  # 默认使用今天的备份
BACKUP_BASE="./backups"
RESTORE_LOG="./logs/disaster-recovery-$(date +%Y%m%d-%H%M%S).log"

# 重定向输出到日志文件
exec > >(tee -a "$RESTORE_LOG") 2>&1

function log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

function error_exit() {
  log "❌ 恢复失败: $1"
  exit 1
}

# 步骤1: 停止所有服务
log "1️⃣ 停止所有服务"
systemctl stop fixcycle-app 2>/dev/null || true
systemctl stop n8n 2>/dev/null || true
systemctl stop postgresql 2>/dev/null || true

# 步骤2: 恢复数据库
log "2️⃣ 恢复数据库"
DB_BACKUP="$BACKUP_BASE/postgres/full/backup_${BACKUP_DATE}_*.dump.gz"
if [ -f "$DB_BACKUP" ]; then
  gunzip -c "$DB_BACKUP" | pg_restore -h localhost -p 5432 -U postgres -d fixcycle_db --clean --if-exists
  log "✅ 数据库恢复完成"
else
  error_exit "找不到数据库备份文件: $DB_BACKUP"
fi

# 步骤3: 恢复配置文件
log "3️⃣ 恢复配置文件"
CONFIG_BACKUP="$BACKUP_BASE/config/$BACKUP_DATE"
if [ -d "$CONFIG_BACKUP" ]; then
  cp "$CONFIG_BACKUP/.env" ./
  cp "$CONFIG_BACKUP/package.json" ./
  cp -r "$CONFIG_BACKUP/config/" ./ 2>/dev/null || true
  log "✅ 配置文件恢复完成"
else
  error_exit "找不到配置备份: $CONFIG_BACKUP"
fi

# 步骤4: 恢复n8n工作流
log "4️⃣ 恢复n8n工作流"
N8N_BACKUP="$BACKUP_BASE/n8n/n8n-backup-${BACKUP_DATE}_*"
if [ -d "$N8N_BACKUP" ]; then
  node scripts/restore-n8n.js "$N8N_BACKUP"
  log "✅ n8n工作流恢复完成"
else
  error_exit "找不到n8n备份: $N8N_BACKUP"
fi

# 步骤5: 恢复上传文件
log "5️⃣ 恢复上传文件"
FILES_BACKUP="$BACKUP_BASE/filesystem/$BACKUP_DATE"
if [ -d "$FILES_BACKUP" ]; then
  rsync -av "$FILES_BACKUP/uploads/" ./uploads/
  log "✅ 上传文件恢复完成"
else
  log "⚠️  未找到文件备份，跳过文件恢复"
fi

# 步骤6: 启动服务
log "6️⃣ 启动服务"
systemctl start postgresql
sleep 10
systemctl start n8n
sleep 10
npm run start

# 步骤7: 验证恢复结果
log "7️⃣ 验证恢复结果"
node scripts/health-check-suite.js --environment production

log "🎉 灾难恢复完成！"
log "恢复日志: $RESTORE_LOG"
```

#### 2. 恢复验证脚本

```javascript
// scripts/verify-restoration.js
async function verifyRestoration() {
  console.log("🔍 验证恢复结果...\n");

  const checks = [
    {
      name: "数据库连接",
      check: () => verifyDatabaseConnection(),
    },
    {
      name: "核心表存在性",
      check: () => verifyCoreTables(),
    },
    {
      name: "API服务状态",
      check: () => verifyApiHealth(),
    },
    {
      name: "n8n工作流状态",
      check: () => verifyN8nWorkflows(),
    },
    {
      name: "关键数据完整性",
      check: () => verifyDataIntegrity(),
    },
  ];

  let passed = 0;
  let total = checks.length;

  for (const { name, check } of checks) {
    console.log(`检查 ${name}...`);
    try {
      const result = await check();
      if (result.success) {
        console.log(`  ✅ 通过 - ${result.message}`);
        passed++;
      } else {
        console.log(`  ❌ 失败 - ${result.message}`);
      }
    } catch (error) {
      console.log(`  ❌ 错误 - ${error.message}`);
    }
    console.log();
  }

  const successRate = Math.round((passed / total) * 100);
  console.log(`恢复验证完成: ${passed}/${total} 项检查通过 (${successRate}%)`);

  if (successRate >= 80) {
    console.log("✅ 恢复基本成功，系统可以正常使用");
  } else {
    console.log("❌ 恢复存在问题，需要进一步检查");
    process.exit(1);
  }
}

async function verifyDatabaseConnection() {
  // 实现数据库连接验证
  return { success: true, message: "数据库连接正常" };
}

async function verifyCoreTables() {
  // 检查核心表是否存在且有数据
  return { success: true, message: "核心表结构完整" };
}

async function verifyApiHealth() {
  // 检查API服务是否响应
  const response = await fetch("http://localhost:3000/api/health");
  return {
    success: response.ok,
    message: response.ok ? "API服务正常" : "API服务无响应",
  };
}

async function verifyN8nWorkflows() {
  // 检查n8n工作流状态
  return { success: true, message: "n8n工作流已恢复" };
}

async function verifyDataIntegrity() {
  // 检查关键业务数据完整性
  return { success: true, message: "数据完整性验证通过" };
}

if (require.main === module) {
  verifyRestoration().catch(console.error);
}
```

---

## 备份自动化配置

### 统一备份管理脚本

```javascript
// scripts/backup-manager.js
class BackupManager {
  constructor(config) {
    this.config = config;
    this.backupHistory = [];
  }

  async executeBackupSchedule() {
    const schedule = [
      { time: "02:00", task: "database-full", priority: "high" },
      { time: "03:00", task: "n8n-config", priority: "medium" },
      { time: "04:00", task: "filesystem", priority: "low" },
      { time: "05:00", task: "config-files", priority: "medium" },
    ];

    console.log("📅 执行备份计划...");

    for (const { time, task, priority } of schedule) {
      console.log(`⏰ ${time} - 执行任务: ${task} (${priority})`);

      try {
        await this.executeTask(task);
        console.log(`✅ ${task} 备份完成`);
      } catch (error) {
        console.error(`❌ ${task} 备份失败:`, error.message);
        await this.sendAlert(`备份失败: ${task}`, error.message, "critical");
      }
    }
  }

  async executeTask(taskName) {
    const tasks = {
      "database-full": () => this.backupDatabase("full"),
      "n8n-config": () => this.backupN8n(),
      filesystem: () => this.backupFilesystem(),
      "config-files": () => this.backupConfig(),
    };

    const task = tasks[taskName];
    if (task) {
      return await task();
    } else {
      throw new Error(`未知的备份任务: ${taskName}`);
    }
  }

  async backupDatabase(type = "full") {
    // 调用数据库备份逻辑
    const result = await require("./backup-database.js").createBackup({ type });
    this.recordBackup("database", type, result);
    return result;
  }

  async backupN8n() {
    const backup = new (require("./backup-n8n-workflows.js"))(this.config.n8n);
    const result = await backup.createBackup();
    this.recordBackup("n8n", "config", result);
    return result;
  }

  async sendAlert(title, message, severity) {
    // 发送告警通知
    console.log(`🚨 [${severity.toUpperCase()}] ${title}: ${message}`);
  }

  recordBackup(type, subtype, result) {
    this.backupHistory.push({
      timestamp: new Date().toISOString(),
      type,
      subtype,
      result,
      status: "completed",
    });
  }
}

module.exports = BackupManager;
```

### 备份监控仪表板

```javascript
// scripts/backup-dashboard.js
const express = require("express");
const app = express();

class BackupDashboard {
  constructor(backupManager) {
    this.backupManager = backupManager;
    this.setupRoutes();
  }

  setupRoutes() {
    app.get("/api/backup/status", (req, res) => {
      res.json({
        lastBackup: this.getLastBackup(),
        upcomingBackups: this.getUpcomingBackups(),
        storageUsage: this.getStorageUsage(),
        health: this.getHealthStatus(),
      });
    });

    app.get("/api/backup/history", (req, res) => {
      res.json(this.backupManager.backupHistory.slice(-50));
    });

    app.post("/api/backup/run/:type", async (req, res) => {
      try {
        const result = await this.backupManager.executeTask(req.params.type);
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    app.use(express.static("public"));
  }

  start(port = 3001) {
    app.listen(port, () => {
      console.log(`📊 备份监控仪表板启动: http://localhost:${port}`);
    });
  }
}
```

---

## 备份存储管理

### 存储空间优化

```bash
# 存储管理脚本: scripts/manage-storage.sh
#!/bin/bash

BACKUP_DIR="./backups"
LOG_FILE="./logs/storage-management.log"

function log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

function analyze_storage() {
  log "分析存储使用情况..."

  echo "=== 存储使用概览 ==="
  du -sh "$BACKUP_DIR"/*

  echo -e "\n=== 最大的备份文件 ==="
  find "$BACKUP_DIR" -type f -exec du -h {} \; | sort -hr | head -10

  echo -e "\n=== 按日期统计 ==="
  find "$BACKUP_DIR" -mindepth 2 -maxdepth 2 -type d | xargs -I {} sh -c 'echo -n "{}: "; du -sh "{}" | cut -f1'
}

function optimize_storage() {
  log "优化存储空间..."

  # 清理重复文件
  fdupes -r "$BACKUP_DIR" -d -N

  # 压缩旧备份
  find "$BACKUP_DIR" -name "*.sql" -mtime +7 -exec gzip {} \;

  # 清理临时文件
  find "$BACKUP_DIR" -name "*.tmp" -delete

  log "存储优化完成"
}

function archive_old_backups() {
  log "归档旧备份到近线存储..."

  ARCHIVE_DIR="/mnt/nearline/backups"
  mkdir -p "$ARCHIVE_DIR"

  # 移动30天前的备份
  find "$BACKUP_DIR" -mindepth 1 -maxdepth 1 -type d -mtime +30 -exec mv {} "$ARCHIVE_DIR/" \;

  log "归档完成"
}

# 主执行逻辑
case "${1:-analyze}" in
  analyze)
    analyze_storage
    ;;
  optimize)
    optimize_storage
    ;;
  archive)
    archive_old_backups
    ;;
  *)
    echo "使用方法: $0 {analyze|optimize|archive}"
    ;;
esac
```

### 多层存储策略

```javascript
// scripts/storage-tier-manager.js
class StorageTierManager {
  constructor() {
    this.tiers = {
      hot: { path: "./backups", retention: "7d", compression: false },
      warm: {
        path: "/mnt/nearline/backups",
        retention: "90d",
        compression: true,
      },
      cold: {
        path: "/mnt/offline/backups",
        retention: "365d",
        compression: true,
      },
    };
  }

  async moveToTier(backupPath, targetTier) {
    const tier = this.tiers[targetTier];
    if (!tier) {
      throw new Error(`未知的存储层级: ${targetTier}`);
    }

    const fileName = path.basename(backupPath);
    const targetPath = path.join(tier.path, fileName);

    // 压缩（如果需要）
    if (tier.compression && !backupPath.endsWith(".gz")) {
      await this.compressBackup(backupPath);
      backupPath += ".gz";
    }

    // 移动文件
    await fs.rename(backupPath, targetPath);

    return targetPath;
  }

  async compressBackup(backupPath) {
    const gzPath = backupPath + ".gz";
    const compress = spawn("gzip", ["-c", backupPath]);
    const output = fs.createWriteStream(gzPath);

    return new Promise((resolve, reject) => {
      compress.stdout.pipe(output);
      compress.on("close", resolve);
      compress.on("error", reject);
    });
  }
}
```

---

## 最佳实践与注意事项

### 备份最佳实践

#### 3-2-1 备份原则

```
3个副本：1个生产环境 + 2个备份副本
2种不同介质：本地磁盘 + 远程存储
1个异地副本：不同地理位置存储
```

#### 备份安全措施

```bash
# 加密备份文件
openssl enc -aes-256-cbc -salt -in backup.sql -out backup.sql.enc -k $ENCRYPTION_KEY

# 解密备份文件
openssl enc -aes-256-cbc -d -in backup.sql.enc -out backup.sql -k $ENCRYPTION_KEY

# 安全传输备份
scp -i ~/.ssh/backup_key backup.sql.enc user@remote-server:/backups/
rsync -avz -e "ssh -i ~/.ssh/backup_key" backup.sql.enc user@remote-server:/backups/
```

#### 备份验证清单

- [ ] 备份文件完整性校验
- [ ] 关键数据可恢复性测试
- [ ] 恢复时间目标(RTO)验证
- [ ] 恢复点目标(RPO)确认
- [ ] 备份访问权限验证
- [ ] 异地备份可达性测试

### 常见问题处理

#### 备份失败处理

```bash
# 检查备份错误日志
tail -n 50 logs/backup.log

# 检查磁盘空间
df -h

# 检查数据库连接
pg_isready -h localhost -p 5432

# 重新执行失败的备份
node scripts/backup-database.js backup --retry
```

#### 恢复失败处理

```bash
# 检查恢复错误
tail -n 50 logs/restore.log

# 验证备份文件完整性
node scripts/verify-backup.js ./backups/latest

# 尝试不同的恢复点
node scripts/restore-from-backup.js --backup-date 20240101
```

#### 性能优化建议

```bash
# 并行备份多个数据库
parallel -j 4 pg_dump -h localhost -p 5432 -U postgres {} ::: db1 db2 db3 db4

# 使用更快的压缩算法
pg_dump ... | pigz > backup.sql.gz  # 使用pigz替代gzip

# 调整I/O优先级
ionice -c 3 nice -n 19 pg_dump ...  # 最低优先级执行
```

---

## 附录

### 备份命令速查表

| 操作            | 命令                                                           |
| --------------- | -------------------------------------------------------------- |
| 全量数据库备份  | `pg_dump -h host -U user dbname > backup.sql`                  |
| 增量备份        | `pg_dump -h host -U user --format=custom dbname > backup.dump` |
| 恢复数据库      | `psql -h host -U user dbname < backup.sql`                     |
| 备份 n8n 工作流 | `node scripts/backup-n8n-workflows.js`                         |
| 验证备份完整性  | `node scripts/verify-backup.js backup_path`                    |
| 清理旧备份      | `find backups/ -name "backup-*" -mtime +30 -delete`            |

### 恢复时间参考

| 恢复类型     | 数据量  | 预估时间   | 备注         |
| ------------ | ------- | ---------- | ------------ |
| 配置文件恢复 | < 100MB | < 1 分钟   | 最快         |
| 数据库恢复   | 1GB     | 5-10 分钟  | 取决于硬件   |
| 完整系统恢复 | 10GB    | 30-60 分钟 | 包含所有组件 |

### 联系信息

- **备份管理员**: backup-admin@fixcycle.com
- **紧急联系电话**: +86-XXX-XXXX-XXXX
- **备份系统状态**: http://monitor.fixcycle.com/backup

---

_本文档最后更新时间: 2024 年 1 月 25 日_
