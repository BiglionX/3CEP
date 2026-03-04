/**
 * 单个维修工单API路由
 * 处理工单详情获取和状态更新
 */

import { NextResponse } from 'next/server';
import { WorkOrderStatus, PriorityLevel } from '@/types/repair-shop.types';

// 模拟数据
const MOCK_WORK_ORDER = {
  id: 'wo_001',
  orderNumber: 'WO20260228001',
  customerId: 'cust_001',
  customerName: '张三',
  customerPhone: '138****1234',
  customerEmail: 'zhangsan@example.com',
  customerAddress: '北京市朝阳区建国路88号',
  deviceInfo: {
    type: '智能手机',
    brand: 'Apple',
    model: 'iPhone 14 Pro',
    serialNumber: 'F2LNY9D9Q6MJ',
    imei: '352098091234567',
    color: '深空黑色',
    storage: '256GB',
  },
  faultDescription: '屏幕碎裂，无法正常显示，触摸无响应',
  faultType: '屏幕维修',
  faultPhotos: [
    '/images/iphone-screen-damage-1.jpg',
    '/images/iphone-screen-damage-2.jpg',
  ],
  status: WorkOrderStatus.IN_PROGRESS,
  priority: PriorityLevel.HIGH,
  technicianId: 'tech_001',
  technicianName: '李师傅',
  technicianPhone: '139****9876',
  assignedAt: '2026-02-28T09:30:00Z',
  estimatedCompletion: '2026-02-28T15:00:00Z',
  actualCompletion: null,
  price: 880,
  partsCost: 650,
  laborCost: 230,
  totalPrice: 880,
  paymentStatus: 'pending',
  paymentMethod: null,
  notes: '客户急需使用，优先处理。需要更换原装屏幕总成。',
  repairNotes: [
    {
      timestamp: '2026-02-28T09:30:00Z',
      technician: '李师傅',
      note: '接单，开始拆机检查',
    },
    {
      timestamp: '2026-02-28T10:15:00Z',
      technician: '李师傅',
      note: '确认屏幕总成损坏，需要更换',
    },
    {
      timestamp: '2026-02-28T11:00:00Z',
      technician: '李师傅',
      note: '订购原装屏幕，预计下午到货',
    },
  ],
  timeline: [
    {
      status: 'created',
      timestamp: '2026-02-28T09:15:00Z',
      description: '工单创建',
    },
    {
      status: 'assigned',
      timestamp: '2026-02-28T09:30:00Z',
      description: '分配给李师傅',
    },
    {
      status: 'in_progress',
      timestamp: '2026-02-28T09:30:00Z',
      description: '开始维修处理',
    },
  ],
  warrantyPeriod: 90, // 保修期90天
  createdAt: '2026-02-28T09:15:00Z',
  updatedAt: '2026-02-28T14:20:00Z',
};

interface RouteParams {
  params: {
    orderId: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    // 模拟根据ID查找工单
    if (params.orderId !== 'wo_001') {
      return NextResponse.json(
        {
          success: false,
          error: '工单不存在',
        },
        { status: 404 }
      );
    }

    // 模拟延迟以测试加载状态
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      data: MOCK_WORK_ORDER,
    });
  } catch (error) {
    console.error('获取工单详情错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取工单详情失败',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    const { status, ...updates } = body;

    // 验证工单存在
    if (params.orderId !== 'wo_001') {
      return NextResponse.json(
        {
          success: false,
          error: '工单不存在',
        },
        { status: 404 }
      );
    }

    // 验证状态更新的有效性
    const validTransitions: Record<WorkOrderStatus, WorkOrderStatus[]> = {
      [WorkOrderStatus.PENDING]: [
        WorkOrderStatus.IN_PROGRESS,
        WorkOrderStatus.CANCELLED,
      ],
      [WorkOrderStatus.IN_PROGRESS]: [
        WorkOrderStatus.COMPLETED,
        WorkOrderStatus.ON_HOLD,
        WorkOrderStatus.CANCELLED,
      ],
      [WorkOrderStatus.ON_HOLD]: [
        WorkOrderStatus.IN_PROGRESS,
        WorkOrderStatus.CANCELLED,
      ],
      [WorkOrderStatus.COMPLETED]: [],
      [WorkOrderStatus.CANCELLED]: [],
    };

    const currentStatus = MOCK_WORK_ORDER.status;
    if (
      status &&
      !validTransitions[currentStatus].includes(status as WorkOrderStatus)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `无效的状态转换: ${currentStatus} -> ${status}`,
        },
        { status: 400 }
      );
    }

    // 模拟更新操作
    const updatedOrder = {
      ...MOCK_WORK_ORDER,
      ...(status && { status }),
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // 添加时间线记录
    if (status) {
      updatedOrder.timeline.push({
        status: status as WorkOrderStatus,
        timestamp: new Date().toISOString(),
        description: getStatusDescription(status as WorkOrderStatus),
      });
    }

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: '工单更新成功',
    });
  } catch (error) {
    console.error('更新工单错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: '更新工单失败',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// 辅助函数：获取状态描述
function getStatusDescription(status: WorkOrderStatus): string {
  const descriptions: Record<WorkOrderStatus, string> = {
    [WorkOrderStatus.PENDING]: '等待处理',
    [WorkOrderStatus.IN_PROGRESS]: '处理中',
    [WorkOrderStatus.COMPLETED]: '已完成',
    [WorkOrderStatus.CANCELLED]: '已取消',
    [WorkOrderStatus.ON_HOLD]: '暂停处理',
  };
  return descriptions[status];
}
