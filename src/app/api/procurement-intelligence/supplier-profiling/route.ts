import { NextResponse } from 'next/server';
import { supplierProfilingService } from '@/modules/procurement-intelligence/services/supplier-profiling.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: '缂哄皯蹇呰鍙傛暟: action' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'create_profile':
        const createResult =
          await supplierProfilingService.createOrUpdateSupplierProfile(params);
        return NextResponse.json(createResult);

      case 'get_profile':
        if (!params.supplierId) {
          return NextResponse.json(
            { success: false, error: '缂哄皯supplierId鍙傛暟' },
            { status: 400 }
          );
        }
        const getResult = await supplierProfilingService.getSupplierProfile(
          params.supplierId
        );
        return NextResponse.json(getResult);

      case 'update_scores':
        if (!params.supplierId) {
          return NextResponse.json(
            { success: false, error: '缂哄皯supplierId鍙傛暟' },
            { status: 400 }
          );
        }
        const updateResult =
          await supplierProfilingService.updateSupplierScores(
            params.supplierId,
            params.scores
          );
        return NextResponse.json(updateResult);

      case 'search_suppliers':
        const searchResult = await supplierProfilingService.searchSuppliers(
          params.filters || {}
        );
        return NextResponse.json(searchResult);

      default:
        return NextResponse.json(
          { success: false, error: `涓嶆敮鎸佺殑鎿嶄綔: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('渚涘簲鍟嗙敾鍍廇PI閿欒:', error);
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
    const supplierId = searchParams.get('supplierId');

    if (!action) {
      return NextResponse.json(
        { success: false, error: '缂哄皯蹇呰鍙傛暟: action' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'get_profile':
        if (!supplierId) {
          return NextResponse.json(
            { success: false, error: '缂哄皯supplierId鍙傛暟' },
            { status: 400 }
          );
        }
        const getResult =
          await supplierProfilingService.getSupplierProfile(supplierId);
        return NextResponse.json(getResult);

      case 'health_check':
        return NextResponse.json({
          success: true,
          message: '渚涘簲鍟嗙敾鍍忔湇鍔¤繍琛屾?,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { success: false, error: `涓嶆敮鎸佺殑鎿嶄綔: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('渚涘簲鍟嗙敾鍍廏ET API閿欒:', error);
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

