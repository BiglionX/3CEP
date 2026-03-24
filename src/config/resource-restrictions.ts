/**
 * 资源限制配置
 *
 * 定义哪些资源需要租户隔离、创建者过滤等权限控制
 *
 * @file src/config/resource-restrictions.ts
 */

/**
 * 需要创建者过滤的资源类型
 *
 * 这些资源只能被创建者本人查看和修改（管理员除外）
 */
export const CREATOR_RESTRICTED_RESOURCES = [
  'orders', // 订单
  'devices', // 设备
  'portals', // 门户
  'agent_subscriptions', // 智能体订阅
  'quotations', // 报价单
  'contracts', // 合同
  'diagnoses', // 诊断报告
];

/**
 * 需要租户隔离的资源类型
 *
 * 这些资源只能在同一租户内访问，跨租户访问需要特殊权限
 */
export const TENANT_ISOLATED_RESOURCES = [
  'users', // 用户
  'content', // 内容
  'shops', // 店铺
  'payments', // 支付
  'procurement', // 采购
  'inventory', // 库存
  'articles', // 文章
  'tutorials', // 教程
  'manuals', // 手册
  'parts', // 零件
  'finance', // 财务
  'diagnostics', // 诊断
  'valuation', // 估值
  'links', // 链接
  'tenants', // 租户
];

/**
 * 跨租户访问白名单资源
 *
 * 这些资源允许跨租户访问（通常用于系统管理）
 */
export const CROSS_TENANT_WHITELIST = [
  'admin',
  'system',
  'monitoring',
  'metrics',
  'alerts',
];

/**
 * 角色数据范围映射
 *
 * 定义不同角色可以访问的数据范围
 */
export const ROLE_DATA_SCOPE_MAP: Record<
  string,
  'self' | 'department' | 'tenant' | 'cross_tenant'
> = {
  admin: 'cross_tenant', // 管理员可访问所有租户数据
  manager: 'department', // 经理可访问本部门数据
  viewer: 'self', // 普通用户只能访问自己的数据
};

/**
 * 获取资源的限制配置
 */
export function getResourceRestrictions(resourceType: string): {
  isCreatorRestricted: boolean;
  isTenantIsolated: boolean;
  isCrossTenantAllowed: boolean;
} {
  const resourceTypeLower = resourceType.toLowerCase();

  return {
    isCreatorRestricted: CREATOR_RESTRICTED_RESOURCES.some(type =>
      resourceTypeLower.includes(type)
    ),
    isTenantIsolated: TENANT_ISOLATED_RESOURCES.some(type =>
      resourceTypeLower.includes(type)
    ),
    isCrossTenantAllowed: CROSS_TENANT_WHITELIST.some(type =>
      resourceTypeLower.includes(type)
    ),
  };
}
