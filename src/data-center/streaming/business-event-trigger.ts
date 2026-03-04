// 业务事件触发?// 在关键业务操作中自动发布实时事件

import {
  enhancedRealTimeService,
  EnhancedEventType,
  EventPriority,
} from './enhanced-realtime-service';

// 业务实体接口
export interface BusinessEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

// 价格相关事件
export interface PriceUpdatePayload {
  partId: string;
  oldPrice: number;
  newPrice: number;
  changePercent: number;
  platform: string;
  currency: string;
  supplierId?: string;
  effectiveTime?: string;
}

// 库存相关事件
export interface InventoryChangePayload {
  partId: string;
  oldQuantity: number;
  newQuantity: number;
  changeAmount: number;
  warehouseId?: string;
  minStock: number;
  maxStock: number;
  location?: string;
}

// 订单相关事件
export interface OrderStatusChangePayload {
  orderId: string;
  oldStatus: string;
  newStatus: string;
  userId?: string;
  timestamp: string;
  reason?: string;
  metadata?: Record<string, any>;
}

// 用户行为事件
export interface UserActionPayload {
  userId: string;
  actionType: string;
  resourceId?: string;
  resourceType?: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  additionalData?: Record<string, any>;
}

// 系统告警事件
export interface SystemAlertPayload {
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  source: string;
  timestamp: string;
  details?: Record<string, any>;
  autoFix?: boolean;
}

// 数据质量问题事件
export interface DataQualityIssuePayload {
  issueType: string;
  entityId: string;
  entityType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

// 供应商通知事件
export interface SupplierNotificationPayload {
  supplierId: string;
  notificationType: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  timestamp: string;
  relatedEntityId?: string;
  actionRequired?: boolean;
}

// 维护告警事件
export interface MaintenanceAlertPayload {
  system: string;
  component: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  autoFix: boolean;
  metrics?: Record<string, number>;
}

// 性能指标事件
export interface PerformanceMetricPayload {
  name: string;
  value: number;
  unit?: string;
  threshold?: number;
  timestamp: string;
  source: string;
  tags?: Record<string, string>;
  trendAnalysis?: {
    direction: 'increasing' | 'decreasing' | 'stable';
    consecutivePeriods: number;
    rateOfChange?: number;
  };
}

// 安全事件
export interface SecurityEventPayload {
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  sourceIp?: string;
  userId?: string;
  resourceId?: string;
  timestamp: string;
  details?: Record<string, any>;
  mitigationActions?: string[];
}

// 批量操作事件
export interface BatchOperationPayload {
  operationType: string;
  totalCount: number;
  successCount: number;
  failureCount: number;
  startTime: string;
  endTime: string;
  durationMs: number;
  entityIds?: string[];
  errorDetails?: Array<{
    entityId: string;
    error: string;
  }>;
}

// 事务提交事件
export interface TransactionCommitPayload {
  transactionId: string;
  operationType: string;
  entitiesAffected: Array<{
    entityType: string;
    entityId: string;
    action: 'create' | 'update' | 'delete';
  }>;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  durationMs: number;
  isolationLevel: string;
}

// 批量数据导入事件
export interface BulkDataImportPayload {
  importId: string;
  source: string;
  targetType: string;
  totalRecords: number;
  processedRecords: number;
  successRecords: number;
  errorRecords: number;
  startTime: string;
  endTime?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorSummary?: string;
  fieldMappings?: Record<string, string>;
}

// 业务事件触发器类
export class BusinessEventTrigger {
  private static instance: BusinessEventTrigger;

  private constructor() {}

  static getInstance(): BusinessEventTrigger {
    if (!BusinessEventTrigger.instance) {
      BusinessEventTrigger.instance = new BusinessEventTrigger();
    }
    return BusinessEventTrigger.instance;
  }

  // 价格更新事件
  async triggerPriceUpdate(payload: PriceUpdatePayload): Promise<string> {
    const priority =
      Math.abs(payload.changePercent) > 20
        ? EventPriority.HIGH
        : EventPriority.NORMAL;

    return await enhancedRealTimeService.publishEvent({
      type: 'price_update',
      payload,
      source: 'pricing_service',
      priority,
    });
  }

  // 库存变更事件
  async triggerInventoryChange(
    payload: InventoryChangePayload
  ): Promise<string> {
    let priority = EventPriority.NORMAL;

    // 库存预警逻辑
    if (payload.newQuantity <= payload.minStock) {
      priority = EventPriority.HIGH;
    } else if (payload.newQuantity === 0) {
      priority = EventPriority.CRITICAL;
    }

    return await enhancedRealTimeService.publishEvent({
      type: 'inventory_change',
      payload,
      source: 'inventory_service',
      priority,
    });
  }

  // 订单状态变更事?  async triggerOrderStatusChange(
    payload: OrderStatusChangePayload
  ): Promise<string> {
    let priority = EventPriority.NORMAL;

    // 关键状态变更使用高优先?    const criticalStatuses = ['cancelled', 'refunded', 'disputed'];
    if (criticalStatuses.includes(payload.newStatus)) {
      priority = EventPriority.HIGH;
    }

    return await enhancedRealTimeService.publishEvent({
      type: 'order_status_change',
      payload,
      source: 'order_service',
      priority,
    });
  }

  // 用户行为事件
  async triggerUserAction(payload: UserActionPayload): Promise<string> {
    const priority =
      payload.actionType === 'login_failure'
        ? EventPriority.HIGH
        : EventPriority.LOW;

    return await enhancedRealTimeService.publishEvent({
      type: 'user_action',
      payload,
      source: 'user_service',
      priority,
    });
  }

  // 系统告警事件
  async triggerSystemAlert(payload: SystemAlertPayload): Promise<string> {
    const priorityMap: Record<string, EventPriority> = {
      low: EventPriority.LOW,
      medium: EventPriority.NORMAL,
      high: EventPriority.HIGH,
      critical: EventPriority.CRITICAL,
    };

    return await enhancedRealTimeService.publishEvent({
      type: 'system_alert',
      payload,
      source: payload.source,
      priority: priorityMap[payload.severity] || EventPriority.NORMAL,
    });
  }

  // 数据质量问题事件
  async triggerDataQualityIssue(
    payload: DataQualityIssuePayload
  ): Promise<string> {
    const priorityMap: Record<string, EventPriority> = {
      low: EventPriority.LOW,
      medium: EventPriority.NORMAL,
      high: EventPriority.HIGH,
      critical: EventPriority.CRITICAL,
    };

    return await enhancedRealTimeService.publishEvent({
      type: 'data_quality_issue',
      payload,
      source: 'data_quality_service',
      priority: priorityMap[payload.severity] || EventPriority.NORMAL,
    });
  }

  // 供应商通知事件
  async triggerSupplierNotification(
    payload: SupplierNotificationPayload
  ): Promise<string> {
    const priorityMap: Record<string, EventPriority> = {
      low: EventPriority.LOW,
      normal: EventPriority.NORMAL,
      high: EventPriority.HIGH,
      urgent: EventPriority.CRITICAL,
    };

    return await enhancedRealTimeService.publishEvent({
      type: 'supplier_notification',
      payload,
      source: 'supplier_service',
      priority: priorityMap[payload.priority] || EventPriority.NORMAL,
    });
  }

  // 维护告警事件
  async triggerMaintenanceAlert(
    payload: MaintenanceAlertPayload
  ): Promise<string> {
    const priorityMap: Record<string, EventPriority> = {
      info: EventPriority.LOW,
      warning: EventPriority.HIGH,
      critical: EventPriority.CRITICAL,
    };

    return await enhancedRealTimeService.publishEvent({
      type: 'maintenance_alert',
      payload,
      source: 'maintenance_service',
      priority: priorityMap[payload.level] || EventPriority.NORMAL,
    });
  }

  // 性能指标事件
  async triggerPerformanceMetric(
    payload: PerformanceMetricPayload
  ): Promise<string> {
    let priority = EventPriority.LOW;

    // 性能异常检?    if (payload.threshold && payload.value > payload.threshold) {
      priority = EventPriority.HIGH;
    }

    return await enhancedRealTimeService.publishEvent({
      type: 'performance_metric',
      payload,
      source: payload.source,
      priority,
    });
  }

  // 安全事件
  async triggerSecurityEvent(payload: SecurityEventPayload): Promise<string> {
    const priorityMap: Record<string, EventPriority> = {
      low: EventPriority.LOW,
      medium: EventPriority.NORMAL,
      high: EventPriority.HIGH,
      critical: EventPriority.CRITICAL,
    };

    return await enhancedRealTimeService.publishEvent({
      type: 'security_event',
      payload,
      source: 'security_service',
      priority: priorityMap[payload.severity] || EventPriority.NORMAL,
    });
  }

  // 批量操作事件
  async triggerBatchOperation(payload: BatchOperationPayload): Promise<string> {
    const successRate =
      payload.totalCount > 0 ? payload.successCount / payload.totalCount : 1;
    let priority = EventPriority.NORMAL;

    if (successRate < 0.8 || payload.failureCount > 0) {
      priority = EventPriority.HIGH;
    }

    return await enhancedRealTimeService.publishEvent({
      type: 'batch_operation',
      payload,
      source: 'batch_processor',
      priority,
    });
  }

  // 事务提交事件
  async triggerTransactionCommit(
    payload: TransactionCommitPayload
  ): Promise<string> {
    return await enhancedRealTimeService.publishEvent({
      type: 'transaction_commit',
      payload,
      source: 'transaction_manager',
      priority: EventPriority.NORMAL,
    });
  }

  // 批量数据导入事件
  async triggerBulkDataImport(payload: BulkDataImportPayload): Promise<string> {
    let priority = EventPriority.NORMAL;

    if (payload.status === 'failed') {
      priority = EventPriority.HIGH;
    } else if (payload.errorRecords > 0) {
      const errorRate =
        payload.totalRecords > 0
          ? payload.errorRecords / payload.totalRecords
          : 0;
      if (errorRate > 0.1) {
        priority = EventPriority.HIGH;
      }
    }

    return await enhancedRealTimeService.publishEvent({
      type: 'bulk_data_import',
      payload,
      source: 'data_import_service',
      priority,
    });
  }

  // 通用事件触发方法
  async triggerEvent<T>(
    eventType: EnhancedEventType,
    payload: T,
    source: string,
    priority: EventPriority = EventPriority.NORMAL
  ): Promise<string> {
    return await enhancedRealTimeService.publishEvent({
      type: eventType,
      payload,
      source,
      priority,
    });
  }
}

// 装饰器：自动触发事件
export function AutoTriggerEvent(
  eventType: EnhancedEventType,
  getSource: (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => string = () => 'unknown_service'
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);

      // 根据方法名和参数构造事件负?      const payload = {
        methodName: propertyKey,
        args: args,
        result: result,
        timestamp: new Date().toISOString(),
      };

      const source = getSource(this, propertyKey, descriptor);

      try {
        await BusinessEventTrigger.getInstance().triggerEvent(
          eventType,
          payload,
          source,
          EventPriority.NORMAL
        );
      } catch (error) {
        console.error(`�?自动事件触发失败:`, error);
      }

      return result;
    };

    return descriptor;
  };
}

// 导出默认实例
export const businessEventTrigger = BusinessEventTrigger.getInstance();
