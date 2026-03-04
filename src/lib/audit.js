/**
 * 审计日志基础设施
 * 记录敏感操作的审计信息
 */

const fs = require('fs');
const path = require('path');
const { createWriteStream } = require('fs');

// 审计日志配置
const AUDIT_LOG_PATH = process.env.AUDIT_LOG_PATH || './logs';
const LOG_RETENTION_DAYS = parseInt(process.env.AUDIT_LOG_RETENTION_DAYS) || 90;

// 确保日志目录存在
function ensureLogDirectory() {
  if (!fs.existsSync(AUDIT_LOG_PATH)) {
    fs.mkdirSync(AUDIT_LOG_PATH, { recursive: true });
  }
}

/**
 * 生成日志文件名（按日期分割）
 * @param {Date} date - 日期对象
 * @returns {String} 日志文件路径
 */
function getLogFileName(date = new Date()) {
  const dateString = date.toISOString().split('T')[0].replace(/-/g, '');
  return path.join(AUDIT_LOG_PATH, `audit-${dateString}.ndjson`);
}

/**
 * 记录审计日志
 * @param {String} action - 操作类型
 * @param {Object} actor - 操作者信息
 * @param {String} resource - 操作资源
 * @param {Object} changes - 变更详情
 * @param {String} traceId - 追踪ID
 * @param {Object} metadata - 元数据
 */
async function audit(
  action,
  actor,
  resource,
  changes = null,
  traceId = null,
  metadata = {}
) {
  try {
    ensureLogDirectory();

    const logEntry = {
      timestamp: new Date().toISOString(),
      action: action,
      actor: {
        id: actor.id,
        type: actor.type || 'user',
        roles: actor.roles || [],
        tenant_id: actor.tenant_id || null,
      },
      resource: resource,
      changes: changes,
      trace_id: traceId,
      metadata: {
        ip: metadata.ip || null,
        user_agent: metadata.userAgent || null,
        session_id: metadata.sessionId || null,
        ...metadata,
      },
    };

    const logFilePath = getLogFileName();
    const logLine = `${JSON.stringify(logEntry)  }\n`;

    // 异步写入日志文件
    return new Promise((resolve, reject) => {
      fs.appendFile(logFilePath, logLine, 'utf8', err => {
        if (err) {
          console.error('❌ 审计日志写入失败:', err);
          reject(err);
        } else {
          // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`📝 审计日志已记录: ${action} on ${resource}`)resolve(logEntry);
        }
      });
    });
  } catch (error) {
    console.error('❌ 审计日志记录异常:', error);
    throw error;
  }
}

/**
 * 批量记录审计日志
 * @param {Array} auditEntries - 审计条目数组
 */
async function auditBatch(auditEntries) {
  const promises = auditEntries.map(entry =>
    audit(
      entry.action,
      entry.actor,
      entry.resource,
      entry.changes,
      entry.traceId,
      entry.metadata
    )
  );
  return Promise.all(promises);
}

/**
 * 查询审计日志
 * @param {Object} filters - 查询过滤条件
 * @param {Date} startDate - 开始日期
 * @param {Date} endDate - 结束日期
 * @returns {Promise<Array>} 审计日志条目数组
 */
async function queryAuditLogs(filters = {}, startDate = null, endDate = null) {
  try {
    const logs = [];
    const currentDate =
      startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 默认最近7天
    const endDateObj = endDate || new Date();

    // 遍历日期范围内的日志文件
    for (
      let date = new Date(currentDate);
      date <= endDateObj;
      date.setDate(date.getDate() + 1)
    ) {
      const logFilePath = getLogFileName(date);

      if (fs.existsSync(logFilePath)) {
        const fileContent = fs.readFileSync(logFilePath, 'utf8');
        const lines = fileContent.split('\n').filter(line => line.trim());

        lines.forEach(line => {
          try {
            const logEntry = JSON.parse(line);

            // 应用过滤条件
            let matches = true;

            if (filters.action && logEntry.action !== filters.action) {
              matches = false;
            }

            if (filters.actorId && logEntry.actor.id !== filters.actorId) {
              matches = false;
            }

            if (filters.resource && logEntry.resource !== filters.resource) {
              matches = false;
            }

            if (
              filters.tenantId &&
              logEntry.actor.tenant_id !== filters.tenantId
            ) {
              matches = false;
            }

            if (matches) {
              logs.push(logEntry);
            }
          } catch (parseError) {
            console.warn('⚠️ 解析审计日志行失败:', parseError);
          }
        });
      }
    }

    // 按时间排序（最新的在前）
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error('❌ 查询审计日志失败:', error);
    throw error;
  }
}

/**
 * 清理过期审计日志
 * @param {Number} retentionDays - 保留天数
 */
async function cleanupExpiredLogs(retentionDays = LOG_RETENTION_DAYS) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const files = fs.readdirSync(AUDIT_LOG_PATH);
    const expiredFiles = files.filter(file => {
      if (file.startsWith('audit-') && file.endsWith('.ndjson')) {
        const datePart = file.substring(6, 14); // 提取 YYYYMMDD
        const fileDate = new Date(
          parseInt(datePart.substring(0, 4)), // 年
          parseInt(datePart.substring(4, 6)) - 1, // 月（0-indexed）
          parseInt(datePart.substring(6, 8)) // 日
        );
        return fileDate < cutoffDate;
      }
      return false;
    });

    const deletedCount = expiredFiles.length;

    expiredFiles.forEach(file => {
      const filePath = path.join(AUDIT_LOG_PATH, file);
      fs.unlinkSync(filePath);
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`🗑️ 已删除过期审计日志: ${file}`)});

    return {
      deleted_count: deletedCount,
      cutoff_date: cutoffDate.toISOString(),
    };
  } catch (error) {
    console.error('❌ 清理过期审计日志失败:', error);
    throw error;
  }
}

/**
 * 获取审计统计信息
 * @param {Date} startDate - 开始日期
 * @param {Date} endDate - 结束日期
 * @returns {Promise<Object>} 统计信息
 */
async function getAuditStats(startDate = null, endDate = null) {
  try {
    const logs = await queryAuditLogs({}, startDate, endDate);

    const stats = {
      total_entries: logs.length,
      by_action: {},
      by_resource: {},
      by_actor: {},
      by_date: {},
    };

    logs.forEach(log => {
      // 按操作类型统计
      stats.by_action[log.action] = (stats.by_action[log.action] || 0) + 1;

      // 按资源统计
      stats.by_resource[log.resource] =
        (stats.by_resource[log.resource] || 0) + 1;

      // 按操作者统计
      stats.by_actor[log.actor.id] = (stats.by_actor[log.actor.id] || 0) + 1;

      // 按日期统计
      const date = log.timestamp.split('T')[0];
      stats.by_date[date] = (stats.by_date[date] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('❌ 获取审计统计失败:', error);
    throw error;
  }
}

/**
 * 审计日志中间件（Express）
 * @param {Object} options - 配置选项
 */
function auditMiddleware(options = {}) {
  const {
    excludePaths = [],
    includeActions = ['create', 'update', 'delete', 'approve', 'reject'],
    logSuccessOnly = false,
  } = options;

  return function (req, res, next) {
    // 检查是否需要跳过审计
    if (excludePaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    const startTime = Date.now();
    const originalSend = res.send;

    // 重写 res.send 方法来捕获响应
    res.send = function (body) {
      const duration = Date.now() - startTime;

      // 只有在需要审计的操作上记录日志
      const method = req.method.toLowerCase();
      const shouldAudit = includeActions.some(
        action => method === action || req.path.includes(action)
      );

      if (shouldAudit && (!logSuccessOnly || res.statusCode < 400)) {
        const actor = req.user
          ? {
              id: req.user.id,
              type: 'user',
              roles: req.user.roles || [],
              tenant_id: req.user.tenant_id || null,
            }
          : {
              id: 'anonymous',
              type: 'system',
            };

        const changes = {
          method: req.method,
          url: req.url,
          status_code: res.statusCode,
          duration_ms: duration,
          request_body: req.body
            ? JSON.stringify(req.body).substring(0, 1000)
            : null,
          response_body:
            typeof body === 'string'
              ? body.substring(0, 1000)
              : JSON.stringify(body || '').substring(0, 1000),
        };

        audit(
          `${method}_${req.path.split('/').pop()}`,
          actor,
          req.path,
          changes,
          req.headers['x-trace-id'] || null,
          {
            ip: req.ip || req.connection.remoteAddress,
            user_agent: req.get('User-Agent'),
            session_id: req.sessionID,
          }
        ).catch(err => {
          console.error('❌ 审计日志记录失败:', err);
        });
      }

      // 调用原始的 send 方法
      originalSend.call(this, body);
    };

    next();
  };
}

// 初始化审计日志系统
ensureLogDirectory();

// 导出公共接口
module.exports = {
  audit,
  auditBatch,
  queryAuditLogs,
  cleanupExpiredLogs,
  getAuditStats,
  auditMiddleware,

  // 配置常量
  AUDIT_LOG_PATH,
  LOG_RETENTION_DAYS,
};
