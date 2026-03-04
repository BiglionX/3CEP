/**
 * 宸ュ崟绠＄悊API璺敱
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { TicketManagementService } from '@/fcx-system/services/ticket-management.service';

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
          message: '宸ュ崟鍒涘缓鎴愬姛',
        });

      case 'auto_assign':
        const assigned = await ticketService.autoAssignTicket(params.ticketId);
        return NextResponse.json({
          success: true,
          data: { assigned },
          message: assigned ? '宸ュ崟鍒嗛厤鎴愬姛' : '鏆傛棤鍚堥€傚伐绋嬪笀',
        });

      case 'manual_assign':
        const manuallyAssigned = await ticketService.manualAssignTicket(
          params.ticketId,
          params.engineerId
        );
        return NextResponse.json({
          success: true,
          data: { assigned: manuallyAssigned },
          message: manuallyAssigned ? '宸ュ崟鍒嗛厤鎴愬姛' : '鍒嗛厤澶辫触',
        });

      case 'update_status':
        await ticketService.handleTicketStatusChange(
          params.ticketId,
          params.status,
          params.metadata
        );
        return NextResponse.json({
          success: true,
          message: '鐘舵€佹洿鏂版垚?,
        });

      case 'check_overdue':
        await ticketService.checkOverdueTickets();
        return NextResponse.json({
          success: true,
          message: '瓒呮椂妫€鏌ュ畬?,
        });

      case 'process_settlement':
        await ticketService.processAutoSettlement();
        return NextResponse.json({
          success: true,
          message: '缁撶畻澶勭悊瀹屾垚',
        });

      default:
        return NextResponse.json(
          { success: false, error: '鏈煡鎿嶄綔' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('宸ュ崟绠＄悊API閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鎿嶄綔澶辫触',
        details: (error as Error).message,
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
        // 杩欓噷搴旇瀹炵幇鑾峰彇鍏蜂綋宸ュ崟璇︽儏鐨勯€昏緫
        return NextResponse.json({
          success: true,
          data: {},
        });

      default:
        return NextResponse.json(
          { success: false, error: '鏈煡鎿嶄綔' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('宸ュ崟绠＄悊API閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鏌ヨ澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

