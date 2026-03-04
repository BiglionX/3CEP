/**
 * n8n 权限同步服务
 * 实现系统权限与 n8n 工作流权限的实时同步
 */

const axios = require('axios');
const { audit } = require('../lib/audit');
const { hasPermission } = require('../middleware/permissions');

// n8n API 配置
const N8N_CONFIG = {
  baseUrl: process.env.N8N_API_URL || 'http://localhost:5678',
  apiToken: process.env.N8N_API_TOKEN,
  webhookSecret: process.env.N8N_WEBHOOK_SECRET,
};

/**
 * n8n 权限同步服务类
 */
class N8nPermissionSyncService {
  constructor() {
    this.syncQueue = [];
    this.isProcessing = false;
    this.eventListeners = new Map();
    this.syncInterval = null;
  }

  /**
   * 初始化服务
   */
  async initialize() {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🔄 初始化 n8n 权限同步服务...')// 验证 n8n 连接
    await this.checkN8nConnection();

    // 启动定期同步
    this.startPeriodicSync();

    // 注册事件监听器
    this.registerEventListeners();

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('✅ n8n 权限同步服务初始化完成')}

  /**
   * 检查 n8n 连接状态
   */
  async checkN8nConnection() {
    try {
      const response = await axios.get(`${N8N_CONFIG.baseUrl}/healthz`, {
        timeout: 5000,
      });

      if (response.status === 200) {
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('✅ n8n 服务连接正常')return true;
      }
    } catch (error) {
      console.warn('⚠️ 无法连接到 n8n 服务:', error.message);
      return false;
    }
  }

  /**
   * 启动定期同步
   */
  startPeriodicSync() {
    // 每5分钟同步一次权限状态
    this.syncInterval = setInterval(
      async () => {
        try {
          await this.performPeriodicSync();
        } catch (error) {
          console.error('❌ 定期同步失败:', error.message);
        }
      },
      5 * 60 * 1000
    );
  }

  /**
   * 执行定期同步
   */
  async performPeriodicSync() {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🔄 执行定期权限同步...')// 同步用户角色变更
    await this.syncUserRoleChanges();

    // 同步工作流权限更新
    await this.syncWorkflowPermissions();

    // 清理过期权限
    await this.cleanupExpiredPermissions();

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('✅ 定期同步完成')}

  /**
   * 同步用户角色变更
   */
  async syncUserRoleChanges() {
    try {
      // 获取最近的角色变更记录
      const recentChanges = await this.getRecentRoleChanges();

      for (const change of recentChanges) {
        await this.updateN8nUserPermissions(change.userId, change.newRoles);

        // 记录审计日志
        await audit(
          'n8n_permission_sync',
          { id: 'system', type: 'service' },
          'n8n_users',
          {
            user_id: change.userId,
            old_roles: change.oldRoles,
            new_roles: change.newRoles,
            action: 'role_update',
          }
        );
      }
    } catch (error) {
      console.error('❌ 用户角色同步失败:', error.message);
    }
  }

  /**
   * 更新 n8n 用户权限
   */
  async updateN8nUserPermissions(userId, roles) {
    try {
      // 获取用户在 n8n 中的对应账户
      const n8nUser = await this.getN8nUserBySystemId(userId);

      if (!n8nUser) {
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`ℹ️ 用户 ${userId} 在 n8n 中无对应账户`)return;
      }

      // 根据角色映射确定 n8n 权限
      const n8nPermissions = this.mapSystemRolesToN8nPermissions(roles);

      // 更新 n8n 用户权限
      await axios.patch(
        `${N8N_CONFIG.baseUrl}/api/users/${n8nUser.id}`,
        {
          permissions: n8nPermissions,
        },
        {
          headers: {
            Authorization: `Bearer ${N8N_CONFIG.apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`✅ 更新用户 ${userId} 的 n8n 权限:`, n8nPermissions)} catch (error) {
      console.error(`❌ 更新用户 ${userId} 权限失败:`, error.message);
      throw error;
    }
  }

  /**
   * 同步工作流权限
   */
  async syncWorkflowPermissions() {
    try {
      // 获取所有工作流
      const workflows = await this.getAllWorkflows();

      for (const workflow of workflows) {
        // 检查工作流权限配置
        const permissionConfig = await this.getWorkflowPermissionConfig(
          workflow.id
        );

        if (permissionConfig) {
          // 更新工作流访问控制
          await this.updateWorkflowAccessControl(workflow.id, permissionConfig);
        }
      }
    } catch (error) {
      console.error('❌ 工作流权限同步失败:', error.message);
    }
  }

  /**
   * 更新工作流访问控制
   */
  async updateWorkflowAccessControl(workflowId, permissionConfig) {
    try {
      const accessRules = this.generateAccessRules(permissionConfig);

      await axios.patch(
        `${N8N_CONFIG.baseUrl}/api/workflows/${workflowId}`,
        {
          meta: {
            ...permissionConfig,
            accessRules: accessRules,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${N8N_CONFIG.apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`✅ 更新工作流 ${workflowId} 访问控制`)} catch (error) {
      console.error(`❌ 更新工作流 ${workflowId} 访问控制失败:`, error.message);
    }
  }

  /**
   * 生成访问规则
   */
  generateAccessRules(permissionConfig) {
    const rules = [];

    // 读取权限
    if (permissionConfig.readRoles) {
      rules.push({
        action: 'read',
        roles: permissionConfig.readRoles,
        condition: permissionConfig.readCondition || 'allow',
      });
    }

    // 执行权限
    if (permissionConfig.executeRoles) {
      rules.push({
        action: 'execute',
        roles: permissionConfig.executeRoles,
        condition: permissionConfig.executeCondition || 'allow',
      });
    }

    // 管理权限
    if (permissionConfig.manageRoles) {
      rules.push({
        action: 'manage',
        roles: permissionConfig.manageRoles,
        condition: permissionConfig.manageCondition || 'allow',
      });
    }

    return rules;
  }

  /**
   * 清理过期权限
   */
  async cleanupExpiredPermissions() {
    try {
      // 获取过期的临时权限
      const expiredPermissions = await this.getExpiredTemporaryPermissions();

      for (const permission of expiredPermissions) {
        await this.removeTemporaryPermission(permission);
      }

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`✅ 清理了 ${expiredPermissions.length} 个过期权限`)} catch (error) {
      console.error('❌ 清理过期权限失败:', error.message);
    }
  }

  /**
   * 注册事件监听器
   */
  registerEventListeners() {
    // 用户角色变更事件
    this.addEventListener('user.role.changed', async event => {
      await this.queueSyncOperation('user_role_change', event.data);
    });

    // 工作流创建事件
    this.addEventListener('workflow.created', async event => {
      await this.queueSyncOperation('workflow_created', event.data);
    });

    // 工作流更新事件
    this.addEventListener('workflow.updated', async event => {
      await this.queueSyncOperation('workflow_updated', event.data);
    });

    // 权限策略更新事件
    this.addEventListener('permission.policy.updated', async event => {
      await this.queueSyncOperation('policy_update', event.data);
    });
  }

  /**
   * 添加事件监听器
   */
  addEventListener(eventType, handler) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType).push(handler);
  }

  /**
   * 触发事件
   */
  async emitEvent(eventType, eventData) {
    const handlers = this.eventListeners.get(eventType) || [];

    for (const handler of handlers) {
      try {
        await handler({ type: eventType, data: eventData });
      } catch (error) {
        console.error(`❌ 事件处理器执行失败 (${eventType}):`, error.message);
      }
    }
  }

  /**
   * 队列同步操作
   */
  async queueSyncOperation(operationType, data) {
    this.syncQueue.push({
      type: operationType,
      data: data,
      timestamp: Date.now(),
    });

    // 如果没有正在处理，则开始处理队列
    if (!this.isProcessing) {
      await this.processSyncQueue();
    }
  }

  /**
   * 处理同步队列
   */
  async processSyncQueue() {
    if (this.isProcessing || this.syncQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.syncQueue.length > 0) {
        const operation = this.syncQueue.shift();

        try {
          await this.executeSyncOperation(operation);

          // 记录成功审计日志
          await audit(
            'n8n_sync_operation',
            { id: 'system', type: 'service' },
            'sync_queue',
            {
              operation: operation.type,
              data: operation.data,
              status: 'success',
            }
          );
        } catch (error) {
          console.error(`❌ 同步操作失败 (${operation.type}):`, error.message);

          // 记录失败审计日志
          await audit(
            'n8n_sync_operation',
            { id: 'system', type: 'service' },
            'sync_queue',
            {
              operation: operation.type,
              data: operation.data,
              status: 'failed',
              error: error.message,
            }
          );

          // 重试机制
          if (operation.retryCount < 3) {
            operation.retryCount = (operation.retryCount || 0) + 1;
            operation.timestamp = Date.now() + operation.retryCount * 5000; // 递增延迟
            this.syncQueue.push(operation);
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * 执行同步操作
   */
  async executeSyncOperation(operation) {
    switch (operation.type) {
      case 'user_role_change':
        await this.handleUserRoleChange(operation.data);
        break;

      case 'workflow_created':
        await this.handleWorkflowCreated(operation.data);
        break;

      case 'workflow_updated':
        await this.handleWorkflowUpdated(operation.data);
        break;

      case 'policy_update':
        await this.handlePolicyUpdate(operation.data);
        break;

      default:
        console.warn(`⚠️ 未知的同步操作类型: ${operation.type}`);
    }
  }

  /**
   * 处理用户角色变更
   */
  async handleUserRoleChange(data) {
    const { userId, newRoles, oldRoles } = data;
    await this.updateN8nUserPermissions(userId, newRoles);

    // 触发相关工作流的权限更新
    await this.updateRelatedWorkflowPermissions(userId, newRoles);
  }

  /**
   * 处理工作流创建
   */
  async handleWorkflowCreated(data) {
    const { workflowId, creatorId, permissionConfig } = data;

    // 应用默认权限配置
    if (permissionConfig) {
      await this.updateWorkflowAccessControl(workflowId, permissionConfig);
    }

    // 通知相关人员
    await this.notifyWorkflowAccess(workflowId, creatorId);
  }

  /**
   * 处理工作流更新
   */
  async handleWorkflowUpdated(data) {
    const { workflowId, permissionChanges } = data;

    if (permissionChanges) {
      await this.updateWorkflowAccessControl(workflowId, permissionChanges);
    }
  }

  /**
   * 处理策略更新
   */
  async handlePolicyUpdate(data) {
    const { policyType, changes } = data;

    // 根据策略类型执行相应同步
    switch (policyType) {
      case 'workflow_access':
        await this.syncAllWorkflowPermissions();
        break;

      case 'user_permissions':
        await this.syncAllUserPermissions();
        break;

      default:
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`ℹ️ 未知策略类型: ${policyType}`)}
  }

  /**
   * 验证权限一致性
   */
  async validatePermissionConsistency() {
    try {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🔍 验证 n8n 权限一致性...')const inconsistencies = [];

      // 验证用户权限一致性
      const userInconsistencies = await this.validateUserPermissions();
      inconsistencies.push(...userInconsistencies);

      // 验证工作流权限一致性
      const workflowInconsistencies = await this.validateWorkflowPermissions();
      inconsistencies.push(...workflowInconsistencies);

      if (inconsistencies.length > 0) {
        console.warn(`⚠️ 发现 ${inconsistencies.length} 个权限不一致问题:`);
        inconsistencies.forEach(issue => console.warn(`  - ${issue}`));

        // 记录审计日志
        await audit(
          'permission_consistency_check',
          { id: 'system', type: 'service' },
          'permissions',
          {
            status: 'inconsistent',
            issues: inconsistencies,
            count: inconsistencies.length,
          }
        );

        return { consistent: false, issues: inconsistencies };
      } else {
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('✅ 权限一致性验证通过')await audit(
          'permission_consistency_check',
          { id: 'system', type: 'service' },
          'permissions',
          { status: 'consistent' }
        );

        return { consistent: true };
      }
    } catch (error) {
      console.error('❌ 权限一致性验证失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取同步状态报告
   */
  async getSyncStatusReport() {
    return {
      service: 'n8n-permission-sync',
      status: 'running',
      lastSync: new Date().toISOString(),
      queueLength: this.syncQueue.length,
      isProcessing: this.isProcessing,
      nextSync: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      connectionStatus: await this.checkN8nConnection(),
    };
  }

  // 辅助方法
  async getRecentRoleChanges() {
    /* 实现获取最近角色变更 */ return [];
  }
  async getN8nUserBySystemId(userId) {
    /* 实现用户映射查询 */ return null;
  }
  mapSystemRolesToN8nPermissions(roles) {
    /* 实现角色映射 */ return {};
  }
  getAllWorkflows() {
    /* 实现获取所有工作流 */ return [];
  }
  getWorkflowPermissionConfig(workflowId) {
    /* 实现获取权限配置 */ return null;
  }
  getExpiredTemporaryPermissions() {
    /* 实现获取过期权限 */ return [];
  }
  removeTemporaryPermission(permission) {
    /* 实现移除临时权限 */
  }
  validateUserPermissions() {
    /* 实现用户权限验证 */ return [];
  }
  validateWorkflowPermissions() {
    /* 实现工作流权限验证 */ return [];
  }
  updateRelatedWorkflowPermissions(userId, roles) {
    /* 实现相关权限更新 */
  }
  syncAllWorkflowPermissions() {
    /* 实现全部工作流权限同步 */
  }
  syncAllUserPermissions() {
    /* 实现全部用户权限同步 */
  }
  notifyWorkflowAccess(workflowId, userId) {
    /* 实现访问通知 */
  }
}

// 导出单例实例
const n8nPermissionSyncService = new N8nPermissionSyncService();

module.exports = {
  N8nPermissionSyncService,
  n8nPermissionSyncService,
};
