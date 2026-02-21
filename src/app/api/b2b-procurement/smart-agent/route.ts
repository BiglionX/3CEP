import { NextResponse } from 'next/server';
import { smartProcurementAgentService } from '@/b2b-procurement-agent/services/smart-procurement-agent.service';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, orderId, userId, modifications, quotationPlan, quotationRequestId } = body;
    
    // 验证必要参数
    if (!action || !userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: '缺少必要参数: action, userId' 
        },
        { status: 400 }
      );
    }
    
    switch (action) {
      case 'create_smart_quotation':
        // 基于历史订单创建智能询价计划
        if (!orderId) {
          return NextResponse.json(
            { success: false, error: '缺少orderId参数' },
            { status: 400 }
          );
        }
        
        const useHistoricalSuppliers = body.useHistoricalSuppliersOnly ?? true;
        const createResult = await smartProcurementAgentService.createSmartQuotationFromHistory(
          orderId,
          userId,
          useHistoricalSuppliers,
          modifications
        );
        
        return NextResponse.json(createResult);
        
      case 'execute_quotation':
        // 执行智能询价
        if (!quotationPlan) {
          return NextResponse.json(
            { success: false, error: '缺少quotationPlan参数' },
            { status: 400 }
          );
        }
        
        const executeResult = await smartProcurementAgentService.executeSmartQuotation(
          quotationPlan,
          userId
        );
        
        return NextResponse.json(executeResult);
        
      case 'auto_complete':
        // 自动完成询价单
        if (!quotationRequestId) {
          return NextResponse.json(
            { success: false, error: '缺少quotationRequestId参数' },
            { status: 400 }
          );
        }
        
        const autoCompleteResult = await smartProcurementAgentService.autoCompleteQuotation(
          quotationRequestId,
          userId
        );
        
        return NextResponse.json(autoCompleteResult);
        
      case 'modify_and_resend':
        // 修改并重发订单
        if (!orderId || !modifications) {
          return NextResponse.json(
            { success: false, error: '缺少orderId或modifications参数' },
            { status: 400 }
          );
        }
        
        const modifyResult = await smartProcurementAgentService.modifyAndResendOrder(
          orderId,
          modifications,
          userId
        );
        
        return NextResponse.json(modifyResult);
        
      default:
        return NextResponse.json(
          { success: false, error: `不支持的操作: ${action}` },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('智能采购代理API错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '服务器内部错误',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    
    if (!action || !userId) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数: action, userId' },
        { status: 400 }
      );
    }
    
    // 这里可以添加查询历史记录等功能
    return NextResponse.json({
      success: true,
      message: '智能采购代理服务运行正常',
      action,
      userId
    });
    
  } catch (error) {
    console.error('智能采购代理GET错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '查询失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}