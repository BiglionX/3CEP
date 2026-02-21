export type UserRole = 
  | 'admin'
  | 'manager' 
  | 'content_manager'
  | 'shop_manager'
  | 'finance_manager'
  | 'procurement_specialist'
  | 'warehouse_operator'
  | 'agent_operator'
  | 'viewer';

export interface User {
  id: string;
  email: string;
  role?: UserRole;
  created_at?: string;
}

export interface AdminUser extends User {
  role: UserRole;
  is_active: boolean;
  tenant_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  role: UserRole;
  resource: string;
  action: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  roles: UserRole[];
  tenantId: string | null;
  isLoading: boolean;
  error: string | null;
}