import { NextResponse } from 'next/server';
import { smartProcurementAgentService } from '@/b2b-procurement-agent/services/smart-procurement-agent.service';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      action,
      orderId,
      userId,
      modifications,
      quotationPlan,
      quotationRequestId,
    } = body;

    // 楠岃瘉蹇呰鍙傛暟
    if (!action || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: '缂哄皯蹇呰鍙傛暟: action, userId',
        },
        { status: 400 }
      );
    }

    switch (action) {
      case 'create_smart_quotation':
        // 鍩轰簬鍘嗗彶璁㈠崟鍒涘缓鏅鸿兘璇环璁″垝
        if (!orderId) {
          return NextResponse.json(
            { success: false, error: '缂哄皯orderId鍙傛暟' },
            { status: 400 }
          );
        }

        const useHistoricalSuppliers = body.useHistoricalSuppliersOnly ?? true;
        const createResult =
          await smartProcurementAgentService.createSmartQuotationFromHistory(
            orderId,
            userId,
            useHistoricalSuppliers,
            modifications
          );

        return NextResponse.json(createResult);

      case 'execute_quotation':
        // 鎵ц鏅鸿兘璇环
        if (!quotationPlan) {
          return NextResponse.json(
            { success: false, error: '缂哄皯quotationPlan鍙傛暟' },
            { status: 400 }
          );
        }

        const executeResult =
          await smartProcurementAgentService.executeSmartQuotation(
            quotationPlan,
            userId
          );

        return NextResponse.json(executeResult);

      case 'auto_complete':
        // 鑷姩瀹屾垚璇环?        if (!quotationRequestId) {
          return NextResponse.json(
            { success: false, error: '缂哄皯quotationRequestId鍙傛暟' },
            { status: 400 }
          );
        }

        const autoCompleteResult =
          await smartProcurementAgentService.autoCompleteQuotation(
            quotationRequestId,
            userId
          );

        return NextResponse.json(autoCompleteResult);

      case 'modify_and_resend':
        // 淇敼骞堕噸鍙戣?        if (!orderId || !modifications) {
          return NextResponse.json(
            { success: false, error: '缂哄皯orderId鎴杕odifications鍙傛暟' },
            { status: 400 }
          );
        }

        const modifyResult =
          await smartProcurementAgentService.modifyAndResendOrder(
            orderId,
            modifications,
            userId
          );

        return NextResponse.json(modifyResult);

      default:
        return NextResponse.json(
          { success: false, error: `涓嶆敮鎸佺殑鎿嶄綔: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('鏅鸿兘閲囪喘浠ｇ悊API閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊?,
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
    const userId = searchParams.get('userId');

    if (!action || !userId) {
      return NextResponse.json(
        { success: false, error: '缂哄皯蹇呰鍙傛暟: action, userId' },
        { status: 400 }
      );
    }

    // 杩欓噷鍙互娣诲姞鏌ヨ鍘嗗彶璁板綍绛夊姛?    return NextResponse.json({
      success: true,
      message: '鏅鸿兘閲囪喘浠ｇ悊鏈嶅姟杩愯姝ｅ父',
      action,
      userId,
    });
  } catch (error) {
    console.error('鏅鸿兘閲囪喘浠ｇ悊GET閿欒:', error);
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

