/**
 * FCX璐︽埛API璺敱
 * 澶勭悊璐︽埛鍒涘缓銆佹煡璇㈢瓑鎿嶄綔
 */

import { NextResponse } from 'next/server';
import { FcxAccountService } from '@/fcx-system';
import { CreateFcxAccountDTO } from '@/fcx-system/models/fcx-account.model';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, accountType, initialBalance } = body;

    // 鍙傛暟楠岃瘉
    if (!userId || !accountType) {
      return NextResponse.json(
        { error: '缂哄皯蹇呰鍙傛暟: userId 锟?accountType' },
        { status: 400 }
      );
    }

    const dto: CreateFcxAccountDTO = {
      userId,
      accountType,
      initialBalance,
    };

    const accountService = new FcxAccountService();
    const account = await accountService.createAccount(dto);

    return NextResponse.json({
      success: true,
      data: account,
    });
  } catch (error) {
    console.error('鍒涘缓FCX璐︽埛閿欒:', error);
    return NextResponse.json(
      {
        error: '鍒涘缓璐︽埛澶辫触',
        details: (error as Error).message,
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
      return NextResponse.json({ error: '缂哄皯userId鍙傛暟' }, { status: 400 });
    }

    const accountService = new FcxAccountService();
    const account = await accountService.getAccountByUserId(userId);

    if (!account) {
      return NextResponse.json({ error: '璐︽埛涓嶅瓨? }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: account,
    });
  } catch (error) {
    console.error('鏌ヨFCX璐︽埛閿欒:', error);
    return NextResponse.json(
      {
        error: '鏌ヨ璐︽埛澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

