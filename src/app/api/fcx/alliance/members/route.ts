/**
 * 鑱旂洘鎴愬憳鏌ヨAPI
 * 鑾峰彇鑱旂洘鎴愬憳鍒楄〃鍜屾帓琛屾
 */

import { NextResponse } from 'next/server';
import { AllianceService } from '@/fcx-system';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level') as any;
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type') || 'members'; // members or rankings

    const allianceService = new AllianceService();

    if (type === 'rankings') {
      // 鑾峰彇鎺掕?      const rankings = await allianceService.getRankings(limit);

      return NextResponse.json({
        success: true,
        data: {
          type: 'rankings',
          rankings: rankings,
          count: rankings.length,
        },
      });
    } else {
      // 鑾峰彇鎴愬憳鍒楄〃
      const members = await allianceService.listAllianceMembers(level);

      return NextResponse.json({
        success: true,
        data: {
          type: 'members',
          members: members,
          count: members.length,
          level: level || 'all',
        },
      });
    }
  } catch (error) {
    console.error('鏌ヨ鑱旂洘鎴愬憳閿欒:', error);
    return NextResponse.json(
      {
        error: '鏌ヨ澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

