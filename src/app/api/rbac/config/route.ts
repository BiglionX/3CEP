/**
 * RBAC 閰嶇疆 API 绔偣
 * 鎻愪緵鍓嶇璁块棶 RBAC 閰嶇疆鐨勮兘? */

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // 璇诲彇 rbac.json 閰嶇疆鏂囦欢
    const configPath = path.join(process.cwd(), 'config', 'rbac.json');
    const configFile = fs.readFileSync(configPath, 'utf8');
    const rbacConfig = JSON.parse(configFile);

    return NextResponse.json(rbacConfig);
  } catch (error) {
    console.error('璇诲彇 RBAC 閰嶇疆澶辫触:', error);
    return NextResponse.json(
      { error: '鏃犳硶鍔犺浇 RBAC 閰嶇疆' },
      { status: 500 }
    );
  }
}
