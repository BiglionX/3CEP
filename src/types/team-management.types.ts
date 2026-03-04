// 智能体团队管理数据模型定义
// 团队基本信息
export interface Team {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  status: 'active' | 'archived' | 'deleted';
  settings: TeamSettings;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  activeOrchestrations?: number;
}

// 团队设置配置
export interface TeamSettings {
  // 通知设置
  notifications: {
    email: boolean;
    inApp: boolean;
    webhookUrl?: string;
  };
  // 安全设置
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number; // 分钟
    ipWhitelist?: string[];
  };
  // 协作设置
  collaboration: {
    allowExternalSharing: boolean;
    requireApproval: boolean;
    commentOnReadOnly: boolean;
  };
  // 自定义字段
  customFields?: Record<string, any>;
}

// 团队成员信息
export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  permissions: PermissionSet;
  joinedAt: string;
  lastActiveAt?: string;
  // 用户详细信息
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

// 团队角色枚举
export type TeamRole = 'admin' | 'editor' | 'viewer' | 'executor';

// 权限集合定义
export interface PermissionSet {
  // 团队管理权限
  team: {
    view: boolean;
    edit: boolean;
    delete: boolean;
    manageMembers: boolean;
    changeSettings: boolean;
  };
  // 智能体权限
  agents: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    execute: boolean;
    viewLogs: boolean;
  };
  // 编排权限
  orchestrations: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    execute: boolean;
    schedule: boolean;
  };
  // 数据权限
  data: {
    viewAnalytics: boolean;
    exportData: boolean;
    deleteData: boolean;
  };
}

// 智能体编排定义
export interface AgentOrchestration {
  id: string;
  teamId: string;
  name: string;
  description: string;
  workflow: WorkflowDefinition;
  triggerType: TriggerType;
  scheduleConfig?: ScheduleConfig;
  eventTriggers?: EventTrigger[];
  status: OrchestrationStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastExecutedAt?: string;
  executionCount: number;
  successRate: number;
}

// 工作流定义
export interface WorkflowDefinition {
  nodes: WorkflowNode[];
  connections: Connection[];
  variables: Variable[];
  metadata: WorkflowMetadata;
}

// 工作流节点
export interface WorkflowNode {
  id: string;
  type: NodeType;
  name: string;
  position: { x: number; y: number };
  config: NodeConfig;
  inputs: NodeInput[];
  outputs: NodeOutput[];
}

// 节点类型枚举
export type NodeType =
  | 'agent' // 智能体节点
  | 'condition' // 条件判断节点
  | 'loop' // 循环节点
  | 'parallel' // 并行执行节点
  | 'merge' // 合并节点
  | 'data' // 数据处理节点
  | 'notification' // 通知节点
  | 'custom'; // 自定义节点
// 节点配置
export interface NodeConfig {
  [key: string]: any;
}

// 节点输入输出定义
export interface NodeInput {
  id: string;
  name: string;
  type: DataType;
  required: boolean;
  defaultValue?: any;
}

export interface NodeOutput {
  id: string;
  name: string;
  type: DataType;
  description?: string;
}

// 数据类型枚举
export type DataType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'any';

// 连接定义
export interface Connection {
  id: string;
  sourceNodeId: string;
  sourceOutputId: string;
  targetNodeId: string;
  targetInputId: string;
  condition?: ConditionExpression;
}

// 条件表达式
export interface ConditionExpression {
  field: string;
  operator: ComparisonOperator;
  value: any;
  type: 'simple' | 'complex';
}

// 比较操作符
export type ComparisonOperator =
  | 'equals'
  | 'notEquals'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'isNull'
  | 'isNotNull';

// 变量定义
export interface Variable {
  id: string;
  name: string;
  type: DataType;
  initialValue?: any;
  scope: 'global' | 'local';
  description?: string;
}

// 工作流元数据
export interface WorkflowMetadata {
  version: string;
  author: string;
  createdAt: string;
  lastModifiedBy: string;
  lastModifiedAt: string;
  tags: string[];
  estimatedExecutionTime: number; // 秒
  resourceRequirements: ResourceRequirements;
}

// 资源需求定义
export interface ResourceRequirements {
  cpu: number; // 核心数
  memory: number; // MB
  timeout: number; // 秒
  maxConcurrent: number;
}

// 触发类型
export type TriggerType = 'manual' | 'scheduled' | 'event';

// 定时配置
export interface ScheduleConfig {
  type: 'cron' | 'interval' | 'specific';
  expression: string; // Cron表达式或间隔时间
  timezone: string;
  startDate?: string;
  endDate?: string;
  enabled: boolean;
}

// 事件触发器
export interface EventTrigger {
  id: string;
  eventType: EventType;
  source: string; // 事件来源
  filter?: EventFilter;
  debounce?: number; // 防抖时间 (ms)
}

// 事件类型
export type EventType =
  | 'agent.completed'
  | 'agent.failed'
  | 'data.updated'
  | 'user.action'
  | 'system.event'
  | 'custom';

// 事件过滤器
export interface EventFilter {
  conditions: FilterCondition[];
  operator: 'and' | 'or';
}

// 过滤条件
export interface FilterCondition {
  field: string;
  operator: ComparisonOperator;
  value: any;
}

// 编排状态
export type OrchestrationStatus = 'draft' | 'active' | 'paused' | 'archived';

// 执行实例
export interface ExecutionInstance {
  id: string;
  orchestrationId: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  triggeredBy: string;
  inputs: Record<string, any>;
  outputs?: Record<string, any>;
  logs: ExecutionLog[];
  error?: ExecutionError;
}

// 执行状态
export type ExecutionStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

// 执行日志
export interface ExecutionLog {
  timestamp: string;
  nodeId: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: any;
}

// 执行错误
export interface ExecutionError {
  code: string;
  message: string;
  details?: any;
  nodeId?: string;
  timestamp: string;
}

// 团队统计信息
export interface TeamStatistics {
  id: string;
  memberCount: number;
  activeMembers: number;
  totalOrchestrations: number;
  activeOrchestrations: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  resourceUsage: ResourceUsage;
  recentActivity: Activity[];
}

// 资源使用情况
export interface ResourceUsage {
  cpuPercentage: number;
  memoryMB: number;
  storageMB: number;
  networkMB: number;
  lastUpdated: string;
}

// 活动记录
export interface Activity {
  id: string;
  type: ActivityType;
  userId: string;
  userName: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

// 活动类型
export type ActivityType =
  | 'team.created'
  | 'team.updated'
  | 'member.added'
  | 'member.removed'
  | 'orchestration.created'
  | 'orchestration.executed'
  | 'orchestration.failed'
  | 'permission.changed';

// API请求/响应类型

// 创建团队请求
export interface CreateTeamRequest {
  name: string;
  description: string;
  settings?: Partial<TeamSettings>;
}

// 更新团队请求
export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  settings?: Partial<TeamSettings>;
  status?: Team['status'];
}

// 添加成员请求
export interface AddMemberRequest {
  userId: string;
  role: TeamRole;
  permissions?: Partial<PermissionSet>;
}

// 更新成员权限请求
export interface UpdateMemberPermissionsRequest {
  role?: TeamRole;
  permissions?: Partial<PermissionSet>;
}

// 创建编排请求
export interface CreateOrchestrationRequest {
  name: string;
  description: string;
  workflow: WorkflowDefinition;
  triggerType: TriggerType;
  scheduleConfig?: ScheduleConfig;
  eventTriggers?: EventTrigger[];
}

// 执行编排请求
export interface ExecuteOrchestrationRequest {
  inputs?: Record<string, any>;
  triggeredBy?: string;
}

// 查询参数类型
export interface TeamListQuery {
  page?: number;
  limit?: number;
  status?: Team['status'];
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'memberCount';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface OrchestrationListQuery {
  page?: number;
  limit?: number;
  status?: OrchestrationStatus;
  sortBy?: 'name' | 'createdAt' | 'lastExecutedAt' | 'executionCount';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}
