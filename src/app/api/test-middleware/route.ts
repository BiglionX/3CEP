import { NextResponse } from 'next/server';

export async function GET() {
  // 杩欎釜绔偣涓昏鐢ㄤ簬娴嬭瘯涓棿浠舵槸鍚︽纭缃簡鍝嶅簲?  const response = NextResponse.json({
    message: '涓棿浠舵祴璇曠?,
    timestamp: new Date().toISOString(),
  });

  // 涓棿浠跺簲璇ヨ嚜鍔ㄦ坊鍔犺繖浜涘ご?  // x-admin-authorized
  // x-debug-info
  // x-dev-exemption (濡傛灉鍦ㄥ紑鍙戠幆?

  return response;
}

