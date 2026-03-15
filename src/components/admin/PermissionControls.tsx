/**
 * 动态权限控制组件
 * 根据用户权限动态显示或隐藏界面元素
 */

'use client';

import { usePermission } from '@/modules/common/permissions/hooks/use-permission';

interface PermissionControlProps {
  /** 需要的权限标识 */
  permission?: string | string[];
  /** 需要的角色 */
  role?: string | string[];
  /** 是否需要满足所有角色 */
  requireAll?: boolean;
  /** 权限不足时显示的内容 */
  fallback?: React.ReactNode;
  /** 子元素 */
  children: React.ReactNode;
  /** 元素类型 */
  as?: keyof JSX.IntrinsicElements | React.ComponentType<any>;
  /** 其他 props */
  [key: string]: any;
}

/**
 * 权限控制容器组件
 * 根据权限决定是否渲染子元素
 */
export function PermissionControl({
  permission,
  role,
  requireAll = false,
  fallback = null,
  children,
  as: Component = 'div',
  ...props
}: PermissionControlProps) {
  const { hasAnyPermission, hasAllPermissions } = usePermission();

  // 权限检查
  let hasAccess = true;

  if (permission) {
    const permissions = Array.isArray(permission) ? permission : [permission];
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  // 角色检查 - 简化处理，实际项目中应该有角色相关的方法
  if (role && hasAccess) {
    const _roles = Array.isArray(role) ? role : [role];
    // TODO: 实现角色检查逻辑
    hasAccess = true;
  }

  if (!hasAccess) {
    return fallback;
  }

  return <Component {...props}>{children}</Component>;
}

interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 需要的权限标识 */
  permission?: string | string[];
  /** 需要的角色 */
  requiredRole?: string | string[];
  /** 权限不足时的提示信息 */
  tooltip?: string;
  /** 权限不足时是否禁用而不是隐藏 */
  disableInsteadOfHide?: boolean;
}

/**
 * 权限控制按钮组件
 * 根据权限动态启用/禁用按钮
 */
export function PermissionButton({
  permission,
  requiredRole,
  tooltip,
  disableInsteadOfHide = false,
  children,
  ...props
}: PermissionButtonProps) {
  const { hasAnyPermission } = usePermission();

  // 权限检查
  let hasAccess = true;

  if (permission) {
    const permissions = Array.isArray(permission) ? permission : [permission];
    hasAccess = hasAnyPermission(permissions);
  }

  // 角色检查 - 简化处理
  if (requiredRole && hasAccess) {
    const _roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    // TODO: 实现角色检查逻辑
    hasAccess = true;
  }

  // 如果权限不足且选择隐藏，则不渲染
  if (!hasAccess && !disableInsteadOfHide) {
    return null;
  }

  return (
    <button
      {...props}
      disabled={!hasAccess || props.disabled}
      title={!hasAccess ? tooltip || '权限不足' : props.title}
      className={`${props.className || ''} ${
        !hasAccess ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {children}
    </button>
  );
}

interface PermissionMenuItemProps {
  /** 菜单项标题 */
  title: string;
  /** 菜单项图标 */
  icon?: React.ReactNode;
  /** 路径 */
  href?: string;
  /** 点击回调 */
  onClick?: () => void;
  /** 需要的权限 */
  permission?: string | string[];
  /** 需要的角色 */
  requiredRole?: string | string[];
  /** 子菜单项 */
  children?: PermissionMenuItemProps[];
}

/**
 * 权限控制菜单项组件
 */
export function PermissionMenuItem({
  title,
  icon,
  href,
  onClick,
  permission,
  requiredRole,
  children,
}: PermissionMenuItemProps) {
  const { hasAnyPermission } = usePermission();

  // 权限检查
  let hasAccess = true;

  if (permission) {
    const permissions = Array.isArray(permission) ? permission : [permission];
    hasAccess = hasAnyPermission(permissions);
  }

  // 角色检查 - 简化处理
  if (requiredRole && hasAccess) {
    const _roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    // TODO: 实现角色检查逻辑
    hasAccess = true;
  }

  // 过滤子菜单项
  const accessibleChildren =
    children?.filter(child => {
      if (child.permission) {
        const childPermissions = Array.isArray(child.permission)
          ? child.permission
          : [child.permission];
        return hasAnyPermission(childPermissions);
      }
      if (child.requiredRole) {
        // TODO: 实现角色检查逻辑
        return true;
      }
      return true;
    }) || [];

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="menu-item">
      {href ? (
        <a href={href} onClick={onClick} className="menu-link">
          {icon && <span className="menu-icon">{icon}</span>}
          <span className="menu-text">{title}</span>
        </a>
      ) : (
        <button onClick={onClick} className="menu-button">
          {icon && <span className="menu-icon">{icon}</span>}
          <span className="menu-text">{title}</span>
        </button>
      )}

      {accessibleChildren.length > 0 && (
        <div className="submenu">
          {accessibleChildren.map((child, index) => (
            <PermissionMenuItem key={index} {...child} />
          ))}
        </div>
      )}
    </div>
  );
}

interface PermissionFieldProps {
  permission?: string | string[];
  requiredRole?: string | string[];
  label: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * 权限感知的表单字段组件
 */
export function PermissionField({
  permission,
  requiredRole,
  label,
  children,
  className = '',
}: PermissionFieldProps) {
  const { hasAnyPermission } = usePermission();

  let hasAccess = true;

  if (permission) {
    const permissions = Array.isArray(permission) ? permission : [permission];
    hasAccess = hasAnyPermission(permissions);
  }

  if (requiredRole && hasAccess) {
    // TODO: 实现角色检查逻辑
    hasAccess = true;
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className={`form-field ${className}`}>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

/**
 * 权限感知的表格列组件
 */
export function PermissionColumn({
  permission,
  role,
  header,
  cell,
  accessor,
}: {
  permission?: string | string[];
  role?: string | string[];
  header: string;
  cell: (row: any) => React.ReactNode;
  accessor: string;
}) {
  const { hasAnyPermission } = usePermission();

  let hasAccess = true;

  if (permission) {
    const permissions = Array.isArray(permission) ? permission : [permission];
    hasAccess = hasAnyPermission(permissions);
  }

  if (role && hasAccess) {
    // TODO: 实现角色检查逻辑
    hasAccess = true;
  }

  if (!hasAccess) {
    return null;
  }

  return {
    header,
    cell,
    accessor,
  };
}

interface ActionMenuProps {
  actions: Array<{
    label: string;
    onClick: (data: any) => void;
    permission?: string | string[];
    requiredRole?: string | string[];
    icon?: React.ReactNode;
  }>;
  rowData: any;
}

/**
 * 权限感知的动作菜单组件
 */
export function ActionMenu({ actions, rowData }: ActionMenuProps) {
  const { hasAnyPermission } = usePermission();

  const accessibleActions = actions.filter(action => {
    if (action.permission) {
      const permissions = Array.isArray(action.permission)
        ? action.permission
        : [action.permission];
      return hasAnyPermission(permissions);
    }
    if (action.requiredRole) {
      // TODO: 实现角色检查逻辑
      return true;
    }
    return true;
  });

  if (accessibleActions.length === 0) {
    return null;
  }

  return (
    <div className="action-menu">
      {accessibleActions.map((action, index) => (
        <button
          key={index}
          onClick={() => action.onClick(rowData)}
          className="action-button"
        >
          {action.icon && <span className="action-icon">{action.icon}</span>}
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}
