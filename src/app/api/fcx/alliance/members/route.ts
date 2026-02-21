/**
 * 联盟成员查询API
 * 获取联盟成员列表和排行榜
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
      // 获取排行榜
      const rankings = await allianceService.getRankings(limit);
      
      return NextResponse.json({
        success: true,
        data: {
          type: 'rankings',
          rankings: rankings,
          count: rankings.length
        }
      });
    } else {
      // 获取成员列表
      const members = await allianceService.listAllianceMembers(level);
      
      return NextResponse.json({
        success: true,
        data: {
          type: 'members',
          members: members,
          count: members.length,
          level: level || 'all'
        }
      });
    }

  } catch (error) {
    console.error('查询联盟成员错误:', error);
    return NextResponse.json(
      { 
        error: '查询失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}