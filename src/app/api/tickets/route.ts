/**
 * 任务管理API路由
 */
import { TicketManagementService } from '@/modules/fcx-alliance/services/ticket-management.service';
import { NextResponse } from 'next/server';

const ticketService = new TicketManagementService();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'create_ticket':
        const ticket = await ticketService.createAndInitializeTicket(params);
        return NextResponse.json({
          success: true,
          data: ticket,
          message: '任务创建成功',
        });

      case 'auto_assign':
        const assigned = await ticketService.autoAssignTicket(params.ticketId);
        return NextResponse.json({
          success: true,
          data: { assigned },
          message: assigned ? '任务分配成功' : '暂无合适工程师',
        });

      case 'manual_assign':
        const manuallyAssigned = await ticketService.manualAssignTicket(
          params.ticketId,
          params.engineerId
        );
        return NextResponse.json({
          success: true,
          data: { assigned: manuallyAssigned },
          message: manuallyAssigned ? '任务分配成功' : '分配失败',
        });

      case 'update_status':
        await ticketService.handleTicketStatusChange(
          params.ticketId,
          params.status,
          params.metadata
        );
        return NextResponse.json({
          success: true,
          message: '状态更新成功',
        });

      case 'check_overdue':
        await ticketService.checkOverdueTickets();
        return NextResponse.json({
          success: true,
          message: '超时检查完成',
        });

      case 'process_settlement':
        await ticketService.processAutoSettlement();
        return NextResponse.json({
          success: true,
          message: '结算处理完成',
        });

      default:
        return NextResponse.json(
          { success: false, error: '未知操作' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('任务管理API错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: '操作失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'statistics':
        const stats = await ticketService.getSystemStatistics();
        return NextResponse.json({
          success: true,
          data: stats,
        });

      case 'ticket_details':
        // 这里应该实现获取具体任务详情的逻辑
        return NextResponse.json({
          success: true,
          data: {},
        });

      default:
        return NextResponse.json(
          { success: false, error: '未知操作' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('任务管理API错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: '查询失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
