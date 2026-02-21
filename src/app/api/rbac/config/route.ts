/**
 * RBAC 配置 API 端点
 * 提供前端访问 RBAC 配置的能力
 */

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // 读取 rbac.json 配置文件
    const configPath = path.join(process.cwd(), 'config', 'rbac.json');
    const configFile = fs.readFileSync(configPath, 'utf8');
    const rbacConfig = JSON.parse(configFile);
    
    return NextResponse.json(rbacConfig);
    
  } catch (error) {
    console.error('读取 RBAC 配置失败:', error);
    return NextResponse.json(
      { error: '无法加载 RBAC 配置' }, 
      { status: 500 }
    );
  }
}