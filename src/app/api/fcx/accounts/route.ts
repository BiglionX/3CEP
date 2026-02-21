/**
 * FCX账户API路由
 * 处理账户创建、查询等操作
 */

import { NextResponse } from 'next/server';
import { FcxAccountService } from '@/fcx-system';
import { CreateFcxAccountDTO } from '@/fcx-system/models/fcx-account.model';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, accountType, initialBalance } = body;

    // 参数验证
    if (!userId || !accountType) {
      return NextResponse.json(
        { error: '缺少必要参数: userId 和 accountType' },
        { status: 400 }
      );
    }

    const dto: CreateFcxAccountDTO = {
      userId,
      accountType,
      initialBalance
    };

    const accountService = new FcxAccountService();
    const account = await accountService.createAccount(dto);

    return NextResponse.json({
      success: true,
      data: account
    });

  } catch (error) {
    console.error('创建FCX账户错误:', error);
    return NextResponse.json(
      { 
        error: '创建账户失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: '缺少userId参数' },
        { status: 400 }
      );
    }

    const accountService = new FcxAccountService();
    const account = await accountService.getAccountByUserId(userId);

    if (!account) {
      return NextResponse.json(
        { error: '账户不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: account
    });

  } catch (error) {
    console.error('查询FCX账户错误:', error);
    return NextResponse.json(
      { 
        error: '查询账户失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}