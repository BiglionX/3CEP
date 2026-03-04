// 鏁版嵁涓績缁熶竴API缃戝叧
// 鏁村悎鍚勬ā鍧楁暟鎹垎鏋怉PI鍒扮粺涓€鍏ュ彛?
import { NextRequest, NextResponse } from 'next/server';
import { apiGatewayService } from '@/data-center/core/api-gateway.service';

export async function GET(request: NextRequest) {
  return await apiGatewayService.handleRequest(request);
}

export async function POST(request: NextRequest) {
  return await apiGatewayService.handleRequest(request);
}
