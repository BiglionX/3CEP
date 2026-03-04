/**
 * API 权限验证使用示例
 * 展示如何在实际 API 控制器中使用权限装饰器
 */

const express = require('express');
const {
  requireApiPermission,
  requireMultiplePermissions,
  requireResourceOwnership,
  rateLimit,
  validateInput,
} = require('../decorators/api-permissions');
const { audit } = require('../lib/audit');

const router = express.Router();

/**
 * 用户管理相关 API
 */

// 获取用户列表 - 需要用户查看权限
router.get(
  '/users',
  requireApiPermission('users_read', { audit: true }),
  async (req, res) => {
    try {
      // 实际的用户列表查询逻辑
      const users = await getUsersList(req.query);

      res.json({
        success: true,
        data: users,
        count: users.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '获取用户列表失败',
      });
    }
  }
);

// 创建用户 - 需要用户创建权限和租户验证
router.post(
  '/users',
  rateLimit({ max: 10, windowMs: 60000 }), // 1分钟最多10次
  requireApiPermission(['users_create'], {
    checkTenant: true,
    audit: true,
  }),
  validateInput({
    body: {
      username: 'string|required|min:3|max:50',
      email: 'string|required|email',
      role: 'string|in:admin,manager,content_manager,viewer',
    },
  }),
  async (req, res) => {
    try {
      const userData = req.validatedBody;

      // 创建用户逻辑
      const newUser = await createUser(userData, req.user.tenant_id);

      // 记录审计日志
      await audit(
        'user_create',
        {
          id: req.user.id,
          roles: req.user.roles,
          tenant_id: req.user.tenant_id,
        },
        'users',
        { created_user_id: newUser.id, username: newUser.username },
        null,
        { ip: req.ip }
      );

      res.status(201).json({
        success: true,
        message: '用户创建成功',
        data: newUser,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '创建用户失败',
      });
    }
  }
);

// 更新用户 - 需要用户更新权限，管理员可更新所有用户，普通用户只能更新自己
router.put(
  '/users/:userId',
  requireMultiplePermissions([
    {
      permissions: ['users_update'],
      condition: req => req.params.userId !== req.user.id, // 不是更新自己时需要权限
      options: { errorMessage: '需要用户管理权限' },
    },
  ]),
  requireResourceOwnership('userId'), // 验证资源所有权
  validateInput({
    params: {
      userId: 'string|uuid',
    },
    body: {
      username: 'string|optional|min:3|max:50',
      email: 'string|optional|email',
      role: 'string|optional|in:admin,manager,content_manager,viewer',
    },
  }),
  async (req, res) => {
    try {
      const userId = req.validatedParams.userId;
      const updateData = req.validatedBody;

      // 更新用户逻辑
      const updatedUser = await updateUser(userId, updateData);

      res.json({
        success: true,
        message: '用户更新成功',
        data: updatedUser,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '更新用户失败',
      });
    }
  }
);

// 删除用户 - 需要用户删除权限
router.delete(
  '/users/:userId',
  requireApiPermission('users_delete', { audit: true }),
  requireResourceOwnership('userId'),
  async (req, res) => {
    try {
      const userId = req.params.userId;

      // 删除用户逻辑
      await deleteUser(userId);

      res.json({
        success: true,
        message: '用户删除成功',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '删除用户失败',
      });
    }
  }
);

/**
 * 内容管理相关 API
 */

// 获取内容列表 - 支持多种权限检查
router.get(
  '/content',
  requireMultiplePermissions([
    // 基础查看权限
    {
      permissions: ['content_read'],
      options: { errorMessage: '需要内容查看权限' },
    },
    // 如果指定了状态筛选，需要额外权限
    {
      permissions: ['content_approve'],
      condition: req => req.query.status === 'pending',
      options: { errorMessage: '需要内容审批权限' },
    },
  ]),
  async (req, res) => {
    try {
      const contentList = await getContentList(req.query, req.user);

      res.json({
        success: true,
        data: contentList,
        count: contentList.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '获取内容列表失败',
      });
    }
  }
);

// 创建内容 - 需要内容创建权限
router.post(
  '/content',
  rateLimit({ max: 30, windowMs: 3600000 }), // 1小时最多30次
  requireApiPermission('content_create', { audit: true }),
  validateInput({
    body: {
      title: 'string|required|min:1|max:200',
      content: 'string|required|min:1',
      category: 'string|optional',
      tags: 'array|optional',
    },
  }),
  async (req, res) => {
    try {
      const contentData = {
        ...req.validatedBody,
        author_id: req.user.id,
        tenant_id: req.user.tenant_id,
      };

      const newContent = await createContent(contentData);

      res.status(201).json({
        success: true,
        message: '内容创建成功',
        data: newContent,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '创建内容失败',
      });
    }
  }
);

// 审批内容 - 需要内容审批权限
router.patch(
  '/content/:contentId/approve',
  requireApiPermission('content_approve', { audit: true }),
  validateInput({
    params: {
      contentId: 'string|uuid',
    },
  }),
  async (req, res) => {
    try {
      const contentId = req.validatedParams.contentId;
      const { status, remarks } = req.body;

      const approvedContent = await approveContent(
        contentId,
        status,
        remarks,
        req.user.id
      );

      res.json({
        success: true,
        message: '内容审批成功',
        data: approvedContent,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '内容审批失败',
      });
    }
  }
);

/**
 * 店铺管理相关 API
 */

// 获取店铺列表
router.get('/shops', requireApiPermission('shops_read'), async (req, res) => {
  try {
    const shops = await getShopsList(req.query, req.user);

    res.json({
      success: true,
      data: shops,
      count: shops.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取店铺列表失败',
    });
  }
});

// 审批店铺入驻申请
router.patch(
  '/shops/:shopId/approve',
  requireApiPermission('shops_approve', { audit: true }),
  async (req, res) => {
    try {
      const { shopId } = req.params;
      const { approved, remarks } = req.body;

      const result = await approveShop(shopId, approved, remarks, req.user.id);

      res.json({
        success: true,
        message: '店铺审批完成',
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '店铺审批失败',
      });
    }
  }
);

/**
 * 财务相关 API
 */

// 获取支付记录
router.get(
  '/payments',
  requireApiPermission('payments_read'),
  async (req, res) => {
    try {
      const payments = await getPaymentsList(req.query, req.user);

      res.json({
        success: true,
        data: payments,
        count: payments.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '获取支付记录失败',
      });
    }
  }
);

// 处理退款申请
router.post(
  '/payments/:paymentId/refund',
  requireApiPermission('payments_refund', { audit: true }),
  async (req, res) => {
    try {
      const { paymentId } = req.params;
      const { amount, reason } = req.body;

      const refundResult = await processRefund(
        paymentId,
        amount,
        reason,
        req.user.id
      );

      res.json({
        success: true,
        message: '退款处理成功',
        data: refundResult,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '退款处理失败',
      });
    }
  }
);

/**
 * 系统管理 API
 */

// 获取系统配置
router.get(
  '/settings',
  requireApiPermission('settings_read'),
  async (req, res) => {
    try {
      const settings = await getSystemSettings();

      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '获取系统配置失败',
      });
    }
  }
);

// 更新系统配置
router.put(
  '/settings',
  requireApiPermission('settings_update', { audit: true }),
  async (req, res) => {
    try {
      const settings = req.body;

      const updatedSettings = await updateSystemSettings(settings, req.user.id);

      res.json({
        success: true,
        message: '系统配置更新成功',
        data: updatedSettings,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '更新系统配置失败',
      });
    }
  }
);

// 批量操作示例
router.post(
  '/batch/users',
  requireMultiplePermissions(
    [
      {
        permissions: ['users_create'],
        options: { errorMessage: '需要用户创建权限' },
      },
      {
        permissions: ['users_update'],
        options: { errorMessage: '需要用户更新权限' },
      },
    ],
    { requireAll: true }
  ), // 需要同时具备两个权限
  async (req, res) => {
    try {
      const { operations } = req.body;

      const results = await batchUserOperations(operations, req.user.id);

      res.json({
        success: true,
        message: '批量操作完成',
        data: results,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '批量操作失败',
      });
    }
  }
);

// 辅助函数（模拟实现）
async function getUsersList(query) {
  // 模拟数据库查询
  return [
    { id: '1', username: 'admin', email: 'admin@example.com' },
    { id: '2', username: 'user1', email: 'user1@example.com' },
  ];
}

async function createUser(userData, tenantId) {
  // 模拟用户创建
  return {
    id: 'new-user-id',
    ...userData,
    tenant_id: tenantId,
    created_at: new Date().toISOString(),
  };
}

async function updateUser(userId, updateData) {
  // 模拟用户更新
  return {
    id: userId,
    ...updateData,
    updated_at: new Date().toISOString(),
  };
}

async function deleteUser(userId) {
  // 模拟用户删除
  return { success: true };
}

async function getContentList(query, user) {
  // 模拟内容查询
  return [
    { id: '1', title: '示例内容1', author_id: user.id },
    { id: '2', title: '示例内容2', author_id: 'other-user' },
  ];
}

async function createContent(contentData) {
  // 模拟内容创建
  return {
    id: 'new-content-id',
    ...contentData,
    created_at: new Date().toISOString(),
  };
}

async function approveContent(contentId, status, remarks, approverId) {
  // 模拟内容审批
  return {
    id: contentId,
    status,
    remarks,
    approved_by: approverId,
    approved_at: new Date().toISOString(),
  };
}

async function getShopsList(query, user) {
  // 模拟店铺查询
  return [
    { id: '1', name: '示例店铺1', owner_id: user.id },
    { id: '2', name: '示例店铺2', owner_id: 'other-user' },
  ];
}

async function approveShop(shopId, approved, remarks, approverId) {
  // 模拟店铺审批
  return {
    id: shopId,
    approved,
    remarks,
    approved_by: approverId,
    approved_at: new Date().toISOString(),
  };
}

async function getPaymentsList(query, user) {
  // 模拟支付记录查询
  return [
    { id: '1', amount: 100, user_id: user.id },
    { id: '2', amount: 200, user_id: 'other-user' },
  ];
}

async function processRefund(paymentId, amount, reason, processorId) {
  // 模拟退款处理
  return {
    payment_id: paymentId,
    refunded_amount: amount,
    reason,
    processed_by: processorId,
    processed_at: new Date().toISOString(),
  };
}

async function getSystemSettings() {
  // 模拟系统配置查询
  return {
    site_name: '管理系统',
    maintenance_mode: false,
    max_upload_size: '10MB',
  };
}

async function updateSystemSettings(settings, updaterId) {
  // 模拟系统配置更新
  return {
    ...settings,
    updated_by: updaterId,
    updated_at: new Date().toISOString(),
  };
}

async function batchUserOperations(operations, userId) {
  // 模拟批量操作
  return {
    total: operations.length,
    success: operations.length,
    failed: 0,
  };
}

module.exports = router;
