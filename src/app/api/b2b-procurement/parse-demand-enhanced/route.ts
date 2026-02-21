/**
 * BERT增强版B2B采购需求解析API端点
 */

import { NextResponse } from 'next/server';
import { BertEnhancedParserService } from '@/b2b-procurement-agent/services/bert-enhanced-parser.service';
import { RawProcurementRequest } from '@/b2b-procurement-agent/models/procurement.model';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { description, companyId, requesterId } = body;

    // 参数验证
    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: '请提供有效的采购需求描述' 
        },
        { status: 400 }
      );
    }

    if (!companyId || !requesterId) {
      return NextResponse.json(
        { 
          success: false, 
          error: '缺少必要的公司ID或请求者ID' 
        },
        { status: 400 }
      );
    }

    // 创建原始请求对象
    const rawRequest: RawProcurementRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      companyId,
      requesterId,
      rawDescription: description.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 调用BERT增强解析服务
    const parserService = new BertEnhancedParserService();
    const parsedRequest = await parserService.parseDemand(rawRequest);

    return NextResponse.json({
      success: true,
      data: {
        rawRequest,
        parsedRequest,
        enhancement: 'BERT + 规则混合架构',
        confidenceImprovement: parsedRequest.aiConfidence > 85 ? '显著提升' : '保持稳定'
      },
      message: '采购需求解析成功（增强版）'
    });

  } catch (error) {
    console.error('采购需求解析错误:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: '采购需求解析失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// GET方法用于健康检查
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'BERT增强版B2B采购需求解析服务运行正常',
    enhancement: '集成BERT模型的混合架构',
    timestamp: new Date().toISOString()
  });
}