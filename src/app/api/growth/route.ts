import { NextResponse } from 'next/server';
import {
  UserGrowthIncentiveSystem,
  GrowthPathPresets,
  UserGrowthProfile,
} from '@/lib/user-growth-incentive-system';

// 鍏ㄥ眬鎴愰暱婵€鍔辩郴缁熷疄?let growthSystem: UserGrowthIncentiveSystem | null = null;

// 鍒濆鍖栫郴?function getGrowthSystem(): UserGrowthIncentiveSystem {
  if (!growthSystem) {
    const config = GrowthPathPresets.getStandardPath();
    growthSystem = new UserGrowthIncentiveSystem(config);
  }
  return growthSystem;
}

// GET /api/growth/profile?userId=user_123
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action') || 'get_profile';

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: '缂哄皯鐢ㄦ埛ID鍙傛暟',
        },
        { status: 400 }
      );
    }

    const growthSystem = getGrowthSystem();

    switch (action) {
      case 'get_profile':
        return await getUserGrowthProfile(growthSystem, userId);
      case 'get_rewards':
        return await getAvailableRewards(growthSystem, userId);
      case 'get_stats':
        return await getSystemStats(growthSystem);
      default:
        return NextResponse.json(
          {
            success: false,
            error: '涓嶆敮鎸佺殑鎿嶄綔',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('鐢ㄦ埛鎴愰暱婵€鍔辩郴缁熼敊?', error);
    return NextResponse.json(
      {
        success: false,
        error: '绯荤粺鏆傛椂涓嶅彲?,
      },
      { status: 500 }
    );
  }
}

// POST /api/growth/activity
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, activityType, activityDetails } = body;

    if (!userId || !activityType) {
      return NextResponse.json(
        {
          success: false,
          error: '缂哄皯蹇呰鍙傛暟',
        },
        { status: 400 }
      );
    }

    const growthSystem = getGrowthSystem();

    // 纭繚鐢ㄦ埛妗ｆ瀛樺湪
    let profile = growthSystem.getUserGrowthProfile(userId);
    if (!profile) {
      profile = growthSystem.initializeUserGrowthProfile(userId);
    }

    // 璁板綍鐢ㄦ埛娲诲姩
    const result = await growthSystem.recordUserActivity(
      userId,
      activityType,
      activityDetails || {}
    );

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        currentProfile: growthSystem.getUserGrowthProfile(userId),
      },
    });
  } catch (error) {
    console.error('璁板綍鐢ㄦ埛娲诲姩澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: '娲诲姩璁板綍澶辫触',
      },
      { status: 500 }
    );
  }
}

// PUT /api/growth/redeem
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, rewardId } = body;

    if (!userId || !rewardId) {
      return NextResponse.json(
        {
          success: false,
          error: '缂哄皯蹇呰鍙傛暟',
        },
        { status: 400 }
      );
    }

    const growthSystem = getGrowthSystem();
    const success = await growthSystem.redeemReward(userId, rewardId);

    if (success) {
      return NextResponse.json({
        success: true,
        message: '濂栧姳鍏戞崲鎴愬姛',
        data: {
          remainingPoints:
            growthSystem.getUserGrowthProfile(userId)?.totalPoints,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: '濂栧姳鍏戞崲澶辫触锛岀Н鍒嗕笉瓒虫垨濂栧姳涓嶅彲?,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('濂栧姳鍏戞崲澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鍏戞崲澶勭悊澶辫触',
      },
      { status: 500 }
    );
  }
}

// 杈呭姪鍑芥暟
async function getUserGrowthProfile(
  growthSystem: UserGrowthIncentiveSystem,
  userId: string
) {
  let profile = growthSystem.getUserGrowthProfile(userId);

  // 濡傛灉妗ｆ涓嶅瓨鍦紝鍒濆鍖栦竴?  if (!profile) {
    profile = growthSystem.initializeUserGrowthProfile(userId);
  }

  // 鑾峰彇绛夌骇閰嶇疆淇℃伅
  const levelConfig = growthSystem.getLevelConfig(profile.currentLevel);

  return NextResponse.json({
    success: true,
    data: {
      profile,
      levelConfig,
      nextLevelConfig: getNextLevelConfig(growthSystem, profile.currentLevel),
    },
  });
}

async function getAvailableRewards(
  growthSystem: UserGrowthIncentiveSystem,
  userId: string
) {
  const rewards = growthSystem.getAvailableRewards(userId);

  return NextResponse.json({
    success: true,
    data: {
      rewards,
      userPoints: growthSystem.getUserGrowthProfile(userId)?.totalPoints || 0,
    },
  });
}

async function getSystemStats(growthSystem: UserGrowthIncentiveSystem) {
  const stats = growthSystem.getSystemStats();

  return NextResponse.json({
    success: true,
    data: stats,
  });
}

function getNextLevelConfig(
  growthSystem: UserGrowthIncentiveSystem,
  currentLevelId: string
) {
  const config = GrowthPathPresets.getStandardPath();
  const currentLevel = config.levels.find(l => l.levelId === currentLevelId);

  if (currentLevel) {
    return config.levels.find(
      l => l.levelNumber === currentLevel.levelNumber + 1
    );
  }

  return null;
}

// 妯℃嫙涓€浜涘垵濮嬬敤鎴锋暟鎹敤浜庢紨?function initializeDemoData() {
  const growthSystem = getGrowthSystem();

  // 鍒涘缓鍑犱釜婕旂ず鐢ㄦ埛
  const demoUsers = [
    { id: 'demo_user_1', level: 'beginner', points: 150 },
    { id: 'demo_user_2', level: 'apprentice', points: 750 },
    { id: 'demo_user_3', level: 'expert', points: 2100 },
  ];

  demoUsers.forEach(user => {
    let profile = growthSystem.getUserGrowthProfile(user.id);
    if (!profile) {
      profile = growthSystem.initializeUserGrowthProfile(user.id);
    }

    // 妯℃嫙鐢ㄦ埛娲诲姩鏉ョ疮绉Н?    for (let i = 0; i < user.points / 10; i++) {
      growthSystem.recordUserActivity(user.id, 'login');
    }
  });
}

// 鍦ㄦā鍧楀姞杞芥椂鍒濆鍖栨紨绀烘暟?initializeDemoData();

