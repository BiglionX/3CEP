// 通用类型定义文件
import * as React from 'react';

// RBAC相关类型
export interface RbacConfig {
  permissions: Record<string, PermissionInfo>;
  roles: Record<string, RoleInfo>;
  role_permissions: Record<string, string[]>;
}

export interface PermissionInfo {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  category: string;
  created_at: string;
}

export interface RoleInfo {
  id: string;
  name: string;
  description: string;
  level: number;
  created_at: string;
}

// 设备相关类型
export interface Device {
  id: string;
  brand: string;
  model: string;
  series?: string;
  category?: string;
  release_year?: number;
  specifications?: Record<string, any>;
  os_type?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

// 故障类型
export interface FaultType {
  id: string;
  name: string;
  category: string;
  sub_category?: string;
  description?: string;
  difficulty_level?: number;
  estimated_time?: number;
  image_url?: string;
  repair_guide_url?: string;
  status?: string;
  created_at?: string;
}

// 用户角色类型
export type UserRole =
  | 'admin'
  | 'manager'
  | 'content_manager'
  | 'shop_manager'
  | 'finance_manager'
  | 'procurement_specialist'
  | 'warehouse_operator'
  | 'agent_operator'
  | 'viewer'
  | 'external_partner';

// 权限类型
export type Permission = string;

// 用户信息接口
export interface UserInfo {
  id: string;
  email: string;
  roles: UserRole[];
  tenant_id: string | null;
  exp?: number;
}

// 分页接口
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// API响应基础类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 错误边界状态
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}
