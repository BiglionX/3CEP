/**
 * 渚涘簲鍟嗗鏍窤PI
 * 澶勭悊渚涘簲鍟嗙敵璇风殑瀹℃牳娴佺▼
 */

import { NextResponse } from 'next/server';
import { SupplierService } from '@/supply-chain';
import {
  ReviewSupplierDTO,
  ReviewStatus,
} from '@/supply-chain/models/supplier.model';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      supplierId,
      reviewerId,
      reviewResult,
      score,
      comments,
      nextReviewDate,
    } = body;

    // 鍙傛暟楠岃瘉
    if (!supplierId || !reviewerId || !reviewResult || score === undefined) {
      return NextResponse.json(
        { error: '缂哄皯蹇呰鍙傛暟: supplierId, reviewerId, reviewResult, score' },
        { status: 400 }
      );
    }

    // 楠岃瘉瀹℃牳缁撴灉
    if (!Object.values(ReviewStatus).includes(reviewResult as ReviewStatus)) {
      return NextResponse.json({ error: '鏃犳晥鐨勫鏍哥粨? }, { status: 400 });
    }

    // 楠岃瘉鍒嗘暟鑼冨洿
    if (score < 0 || score > 100) {
      return NextResponse.json(
        { error: '瀹℃牳鍒嗘暟蹇呴』?-100涔嬮棿' },
        { status: 400 }
      );
    }

    const dto: ReviewSupplierDTO = {
      supplierId,
      reviewerId,
      reviewResult: reviewResult as ReviewStatus,
      score,
      comments: comments || '',
      nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : undefined,
    };

    const supplierService = new SupplierService();
    const result = await supplierService.reviewApplication(dto);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          supplierId: result.supplierId,
          message: '渚涘簲鍟嗗鏍稿畬?,
        },
      });
    } else {
      return NextResponse.json(
        {
          error: '瀹℃牳澶辫触',
          details: result.errorMessage,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('渚涘簲鍟嗗鏍搁敊?', error);
    return NextResponse.json(
      {
        error: '瀹℃牳澶勭悊澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

