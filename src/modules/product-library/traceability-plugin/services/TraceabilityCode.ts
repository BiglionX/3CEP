import { v4 as uuidv4 } from 'uuid';

export type TraceabilityCodeType = 'qr' | 'rfid' | 'nfc';
export type LifecycleEventType =
  | 'production' // 生产
  | 'quality_check' // 质检
  | 'warehouse_in' // 入库
  | 'warehouse_out' // 出库
  | 'sales' // 销售
  | 'delivery' // 配送
  | 'received' // 签收
  | 'after_sales' // 售后
  | 'return' // 退货
  | 'recycle'; // 回收

export interface LifecycleEvent {
  id: string;
  type: LifecycleEventType;
  timestamp: Date;
  location?: string;
  operator?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface TraceabilityCodeProps {
  id?: string;
  code?: string;
  codeType: TraceabilityCodeType;
  tenantProductId: string;
  productLibraryId?: string;
  sku?: string;
  productName?: string;
  status: 'active' | 'inactive' | 'expired';
  lifecycleEvents?: LifecycleEvent[];
  qrCodeImageUrl?: string;
  qrCodeBase64?: string;
  rfidTagId?: string;
  nfcUid?: string;
  activatedAt?: Date;
  expiredAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class TraceabilityCode {
  public readonly id: string;
  public code: string;
  public codeType: TraceabilityCodeType;
  public tenantProductId: string;
  public productLibraryId?: string;
  public sku?: string;
  public productName?: string;
  public status: 'active' | 'inactive' | 'expired';
  public lifecycleEvents: LifecycleEvent[];
  public qrCodeImageUrl?: string;
  public qrCodeBase64?: string;
  public rfidTagId?: string;
  public nfcUid?: string;
  public activatedAt?: Date;
  public expiredAt?: Date;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: TraceabilityCodeProps) {
    this.id = props.id || uuidv4();
    this.code = props.code || this.generateCode();
    this.codeType = props.codeType;
    this.tenantProductId = props.tenantProductId;
    this.productLibraryId = props.productLibraryId;
    this.sku = props.sku;
    this.productName = props.productName;
    this.status = props.status || 'active';
    this.lifecycleEvents = props.lifecycleEvents || [];
    this.qrCodeImageUrl = props.qrCodeImageUrl;
    this.qrCodeBase64 = props.qrCodeBase64;
    this.rfidTagId = props.rfidTagId;
    this.nfcUid = props.nfcUid;
    this.activatedAt = props.activatedAt;
    this.expiredAt = props.expiredAt;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  /**
   * 生成全局唯一的溯源码
   * 格式: TRC-{UUIDv4}-{Timestamp}
   */
  private generateCode(): string {
    const uuid = uuidv4().replace(/-/g, '').substring(0, 16);
    const timestamp = Date.now().toString(36).toUpperCase();
    return `TRC-${uuid}-${timestamp}`;
  }

  /**
   * 添加生命周期事件
   */
  public addLifecycleEvent(
    event: Omit<LifecycleEvent, 'id' | 'timestamp'>
  ): LifecycleEvent {
    const newEvent: LifecycleEvent = {
      id: uuidv4(),
      timestamp: new Date(),
      ...event,
    };

    this.lifecycleEvents.push(newEvent);
    this.updatedAt = new Date();

    return newEvent;
  }

  /**
   * 获取完整的产品溯源历史
   */
  public getTraceabilityHistory(): LifecycleEvent[] {
    return [...this.lifecycleEvents].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
  }

  /**
   * 激活溯源码
   */
  public activate(): void {
    if (this.status === 'expired') {
      throw new Error('已过期的溯源码无法激活');
    }

    this.status = 'active';
    this.activatedAt = new Date();
    this.updatedAt = new Date();

    this.addLifecycleEvent({
      type: 'production',
      notes: '溯源码激活',
    });
  }

  /**
   * 停用溯源码
   */
  public deactivate(reason?: string): void {
    this.status = 'inactive';
    this.updatedAt = new Date();

    this.addLifecycleEvent({
      type: 'after_sales',
      notes: `溯源码停用${reason ? `: ${reason}` : ''}`,
    });
  }

  /**
   * 设置过期时间
   */
  public setExpiration(expiredAt: Date): void {
    this.expiredAt = expiredAt;
    this.updatedAt = new Date();

    // 如果已过期，自动更新状态
    if (new Date() > expiredAt && this.status === 'active') {
      this.status = 'expired';
    }
  }

  /**
   * 检查是否过期
   */
  public isExpired(): boolean {
    if (!this.expiredAt) return false;
    return new Date() > this.expiredAt;
  }

  /**
   * 验证溯源码有效性
   */
  public isValid(): boolean {
    return this.status === 'active' && !this.isExpired();
  }

  /**
   * 记录入库事件
   */
  public recordWarehouseIn(location: string, operator?: string): void {
    this.addLifecycleEvent({
      type: 'warehouse_in',
      location,
      operator,
      notes: '产品入库',
    });
  }

  /**
   * 记录出库事件
   */
  public recordWarehouseOut(location: string, operator?: string): void {
    this.addLifecycleEvent({
      type: 'warehouse_out',
      location,
      operator,
      notes: '产品出库',
    });
  }

  /**
   * 记录销售事件
   */
  public recordSales(customerInfo?: Record<string, any>): void {
    this.addLifecycleEvent({
      type: 'sales',
      notes: '产品销售',
      metadata: customerInfo,
    });
  }

  /**
   * 记录配送事件
   */
  public recordDelivery(trackingNumber?: string, carrier?: string): void {
    this.addLifecycleEvent({
      type: 'delivery',
      notes: `产品配送${carrier ? ` - ${carrier}` : ''}`,
      metadata: trackingNumber ? { trackingNumber } : undefined,
    });
  }

  /**
   * 记录签收事件
   */
  public recordReceived(location?: string): void {
    this.addLifecycleEvent({
      type: 'received',
      location,
      notes: '客户签收',
    });
  }

  /**
   * 记录售后事件
   */
  public recordAfterSales(issue: string, resolution?: string): void {
    this.addLifecycleEvent({
      type: 'after_sales',
      notes: `售后问题: ${issue}${resolution ? ` | 解决方案: ${resolution}` : ''}`,
    });
  }

  /**
   * 记录退货事件
   */
  public recordReturn(reason: string): void {
    this.addLifecycleEvent({
      type: 'return',
      notes: `退货原因: ${reason}`,
    });
  }

  /**
   * 记录回收事件
   */
  public recordRecycle(recyclingCenter?: string): void {
    this.addLifecycleEvent({
      type: 'recycle',
      location: recyclingCenter,
      notes: '产品回收',
    });
  }
}
