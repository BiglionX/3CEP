/**
 * 工单管理系统数据模型
 */

// 工程师技能标签枚?export enum EngineerSkill {
  MOBILE_REPAIR = 'mobile_repair', // 手机维修
  COMPUTER_REPAIR = 'computer_repair', // 电脑维修
  APPLIANCE_REPAIR = 'appliance_repair', // 家电维修
  DATA_RECOVERY = 'data_recovery', // 数据恢复
  SCREEN_REPLACEMENT = 'screen_replacement', // 屏幕更换
  BATTERY_REPLACEMENT = 'battery_replacement', // 电池更换
  WATER_DAMAGE = 'water_damage', // 进水维修
  SOFTWARE_ISSUES = 'software_issues', // 软件问题
  HARDWARE_DIAGNOSIS = 'hardware_diagnosis', // 硬件诊断
  UPGRADE_SERVICES = 'upgrade_services', // 升级服务
}

// 工程师状态枚?export enum EngineerStatus {
  AVAILABLE = 'available', // 空闲可用
  BUSY = 'busy', // 忙碌?  OFFLINE = 'offline', // 离线
  ON_LEAVE = 'on_leave', // 休假?  SUSPENDED = 'suspended', // 被暂?}

// 工单紧急程?export enum TicketPriority {
  LOW = 'low', // 低优先级
  NORMAL = 'normal', // 正常优先?  HIGH = 'high', // 高优先级
  URGENT = 'urgent', // 紧?  CRITICAL = 'critical', // 致命
}

// 工单分配策略
export enum AssignmentStrategy {
  SKILL_MATCH = 'skill_match', // 技能匹配优?  LOCATION_BASED = 'location_based', // 位置就近优先
  LOAD_BALANCED = 'load_balanced', // 负载均衡优先
  EXPERIENCE_BASED = 'experience_based', // 经验优先
}

// SLA级别定义
export enum SLALevel {
  STANDARD = 'standard', // 标准服务 (24小时响应)
  PRIORITY = 'priority', // 优先服务 (12小时响应)
  PREMIUM = 'premium', // 高级服务 (4小时响应)
  VIP = 'vip', // VIP服务 (1小时响应)
}

// 工单分配记录
export interface TicketAssignment {
  id: string;
  ticketId: string;
  engineerId: string;
  assignedAt: Date;
  assignedBy?: string; // 分配人ID
  assignmentReason: string; // 分配原因
  strategyUsed: AssignmentStrategy; // 使用的分配策?  estimatedCompletionTime?: Date; // 预计完成时间
  isAutoAssigned: boolean; // 是否自动分配
  status: 'assigned' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
}

// 工程师信?export interface Engineer {
  id: string;
  userId: string; // 关联的用户ID
  name: string;
  phone: string;
  email: string;
  skills: EngineerSkill[]; // 技能标签数?  specialization: string[]; // 专业领域
  experienceYears: number; // 经验年限
  rating: number; // 评分 (0-5)
  completedTickets: number; // 完成工单?  successRate: number; // 成功?(%)
  currentLoad: number; // 当前负载 (处理中的工单?
  maxCapacity: number; // 最大容?  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    region: string;
  };
  availability: {
    status: EngineerStatus;
    lastOnline: Date;
    workingHours: string; // 工作时间，如 "09:00-18:00"
    holidays: Date[]; // 休假日期
  };
  certifications: string[]; // 认证证书
  hourlyRate: number; // 时薪费率
  slaLevels: SLALevel[]; // 支持的SLA级别
  createdAt: Date;
  updatedAt: Date;
}

// 工单扩展信息
export interface ExtendedRepairOrder {
  id: string;
  orderNumber: string;
  consumerId: string;
  repairShopId: string;
  deviceInfo: Record<string, any>;
  faultDescription: string;
  fcxAmountLocked: number;
  status: string;
  rating: number | null;
  factoryId: string | null;
  createdAt: Date;
  confirmedAt: Date | null;
  completedAt: Date | null;

  // 扩展字段
  priority: TicketPriority; // 紧急程?  slaLevel: SLALevel; // SLA级别
  assignedEngineerId: string | null; // 分配的工程师ID
  assignedAt: Date | null; // 分配时间
  acceptedAt: Date | null; // 接受时间
  startedAt: Date | null; // 开始处理时?  estimatedCompletionAt: Date | null; // 预计完成时间
  actualCompletionAt: Date | null; // 实际完成时间
  slaDeadline: Date | null; // SLA截止时间
  isOverdue: boolean; // 是否超时
  overdueDuration: number | null; // 超时时长(分钟)
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
  }; // 故障地点
  requiredSkills: EngineerSkill[]; // 所需技?  complexity: number; // 复杂度评?(1-10)
  customerUrgency: number; // 客户紧急程?(1-5)
  escalationLevel: number; // 升级级别 (0-3)
  escalationHistory: Array<{
    level: number;
    escalatedAt: Date;
    reason: string;
    handledBy: string;
  }>; // 升级历史
}

// SLA监控规则
export interface SLAMonitorRule {
  id: string;
  ticketId: string;
  slaLevel: SLALevel;
  deadline: Date;
  warningThreshold: number; // 提前提醒阈?分钟)
  escalationRules: Array<{
    delayMinutes: number; // 延迟分钟?    action: 'remind' | 'escalate' | 'reassign' | 'notify_admin';
    targetRole: 'engineer' | 'supervisor' | 'admin';
    messageTemplate: string;
  }>;
  notificationsSent: Array<{
    type: 'warning' | 'overdue' | 'escalation';
    sentAt: Date;
    recipient: string;
    message: string;
  }>;
  isActive: boolean;
}

// 自动结算配置
export interface AutoSettlementConfig {
  id: string;
  isEnabled: boolean;
  minRatingForFullPayment: number; // 获得全额付款的最低评?  partialPaymentThreshold: number; // 部分付款阈?  penaltyRate: number; // 超时罚金比例
  qualityBonusRate: number; // 优质服务奖金比例
  settlementDelayMinutes: number; // 结算延迟时间(分钟)
  autoEscrowRelease: boolean; // 自动释放托管资金
  requireAdminApproval: boolean; // 是否需要管理员审批
}

// 工单分配算法参数
export interface AssignmentAlgorithmParams {
  strategy: AssignmentStrategy;
  maxDistanceKm: number; // 最大距离限?  maxLoadFactor: number; // 最大负载因?  skillWeight: number; // 技能匹配权?(0-1)
  locationWeight: number; // 位置权重 (0-1)
  experienceWeight: number; // 经验权重 (0-1)
  ratingWeight: number; // 评分权重 (0-1)
  excludeOffline: boolean; // 是否排除离线工程?  excludeOverloaded: boolean; // 是否排除超载工程?}

// 工单分配结果
export interface AssignmentResult {
  ticketId: string;
  assignedEngineerId: string;
  confidenceScore: number; // 匹配置信?(0-1)
  estimatedTravelTime: number; // 预估路程时间(分钟)
  estimatedWorkTime: number; // 预估工作时间(分钟)
  totalEstimatedTime: number; // 总预估时?分钟)
  reasons: string[]; // 分配理由
  alternativeEngineers: Array<{
    engineerId: string;
    score: number;
    reason: string;
  }>; // 备选工程师
}
