/**
 * 供应商审核API
 * 处理供应商申请的审核流程
 */

import { NextResponse } from 'next/server';
import { SupplierService } from '@/supply-chain';
import { ReviewSupplierDTO, ReviewStatus } from '@/supply-chain/models/supplier.model';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { supplierId, reviewerId, reviewResult, score, comments, nextReviewDate } = body;

    // 参数验证
    if (!supplierId || !reviewerId || !reviewResult || score === undefined) {
      return NextResponse.json(
        { error: '缺少必要参数: supplierId, reviewerId, reviewResult, score' },
        { status: 400 }
      );
    }

    // 验证审核结果
    if (!Object.values(ReviewStatus).includes(reviewResult as ReviewStatus)) {
      return NextResponse.json(
        { error: '无效的审核结果' },
        { status: 400 }
      );
    }

    // 验证分数范围
    if (score < 0 || score > 100) {
      return NextResponse.json(
        { error: '审核分数必须在0-100之间' },
        { status: 400 }
      );
    }

    const dto: ReviewSupplierDTO = {
      supplierId,
      reviewerId,
      reviewResult: reviewResult as ReviewStatus,
      score,
      comments: comments || '',
      nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : undefined
    };

    const supplierService = new SupplierService();
    const result = await supplierService.reviewApplication(dto);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          supplierId: result.supplierId,
          message: '供应商审核完成'
        }
      });
    } else {
      return NextResponse.json(
        { 
          error: '审核失败',
          details: result.errorMessage 
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('供应商审核错误:', error);
    return NextResponse.json(
      { 
        error: '审核处理失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}