import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 妯℃嫙鐢ㄦ埛妗ｆ鏁版嵁
const mockUserProfiles: Record<string, any> = {
  user_123: {
    id: 'user_123',
    name: '寮犱笁',
    email: 'zhangsan@example.com',
    avatar: null,
    joinDate: '2024-01-15',
    lastActive: '2024-03-01T10:30:00Z',
    memberLevel: '闈掗摐氬憳',
    points: 1250,
    achievements: [
      {
        id: 'first_login',
        title: '鍒濇瑙侀潰',
        description: '瀹屾垚棣栨鐧诲綍',
        icon: '馃憢',
        earnedDate: '2024-01-15',
        isUnlocked: true,
      },
      {
        id: 'quick_learner',
        title: '蹇€熶笂,
        description: '瀹屾垚鏂版墜寮曞',
        icon: '馃帗',
        earnedDate: '2024-01-16',
        isUnlocked: true,
      },
      {
        id: 'explorer',
        title: '鎺㈢储,
        description: '璁块棶5涓笉鍚屽姛鑳芥ā,
        icon: '馃Л',
        earnedDate: '',
        isUnlocked: false,
      },
      {
        id: 'contributor',
        title: '璐＄尞,
        description: '鍒涘缓绗竴涓淮淇伐,
        icon: '馃敡',
        earnedDate: '',
        isUnlocked: false,
      },
    ],
    preferences: {
      favoriteModules: ['dashboard', 'repair'],
      notificationSettings: {
        email: true,
        push: true,
        sms: false,
      },
      theme: 'light',
      language: 'zh-CN',
    },
    recentActivity: [
      {
        id: 'act_1',
        type: 'login',
        title: '婃棩鐧诲綍',
        timestamp: '2灏忔椂,
        pointsEarned: 10,
      },
      {
        id: 'act_2',
        type: 'feature_use',
        title: '浣跨敤璁惧绠＄悊鍔熻兘',
        timestamp: '鏄ㄥぉ',
        pointsEarned: 25,
      },
      {
        id: 'act_3',
        type: 'completion',
        title: '瀹屾垚鏂版墜寮曞',
        timestamp: '3澶╁墠',
        pointsEarned: 100,
      },
    ],
  },
  user_456: {
    id: 'user_456',
    name: '鏉庡洓',
    email: 'lisi@example.com',
    avatar: null,
    joinDate: '2024-02-20',
    lastActive: '2024-03-01T09:15:00Z',
    memberLevel: '鐧介摱氬憳',
    points: 2800,
    achievements: [
      {
        id: 'first_login',
        title: '鍒濇瑙侀潰',
        description: '瀹屾垚棣栨鐧诲綍',
        icon: '馃憢',
        earnedDate: '2024-02-20',
        isUnlocked: true,
      },
      {
        id: 'quick_learner',
        title: '蹇€熶笂,
        description: '瀹屾垚鏂版墜寮曞',
        icon: '馃帗',
        earnedDate: '2024-02-21',
        isUnlocked: true,
      },
      {
        id: 'explorer',
        title: '鎺㈢储,
        description: '璁块棶5涓笉鍚屽姛鑳芥ā,
        icon: '馃Л',
        earnedDate: '2024-02-25',
        isUnlocked: true,
      },
      {
        id: 'contributor',
        title: '璐＄尞,
        description: '鍒涘缓绗竴涓淮淇伐,
        icon: '馃敡',
        earnedDate: '2024-02-28',
        isUnlocked: true,
      },
    ],
    preferences: {
      favoriteModules: ['analytics', 'inventory'],
      notificationSettings: {
        email: true,
        push: false,
        sms: true,
      },
      theme: 'dark',
      language: 'zh-CN',
    },
    recentActivity: [
      {
        id: 'act_1',
        type: 'login',
        title: '婃棩鐧诲綍',
        timestamp: '3灏忔椂,
        pointsEarned: 10,
      },
      {
        id: 'act_2',
        type: 'feature_use',
        title: '浣跨敤鏁版嵁鍒嗘瀽鍔熻兘',
        timestamp: '1澶╁墠',
        pointsEarned: 30,
      },
      {
        id: 'act_3',
        type: 'completion',
        title: '瀹屾垚楂樼骇鏁欑▼',
        timestamp: '1鍛ㄥ墠',
        pointsEarned: 150,
      },
    ],
  },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // 巆ookie鑾峰彇鐢ㄦ埛淇℃伅浣滀负澶囩敤
    const cookieStore = cookies();
    const userCookie = cookieStore.get('user-profile');

    let userProfile;

    if (userId && mockUserProfiles[userId]) {
      userProfile = mockUserProfiles[userId];
    } else if (userCookie) {
      try {
        userProfile = JSON.parse(userCookie.value);
      } catch (e) {
        // 濡傛灉cookie瑙ｆ瀽澶辫触锛屼娇鐢ㄩ粯璁ら厤        userProfile = mockUserProfiles['user_123'];
      }
    } else {
      // 杩斿洖榛樿鐢ㄦ埛妗ｆ
      userProfile = mockUserProfiles['user_123'];
    }

    // 娣诲姞鍔ㄦ€佽绠楃殑瀛楁
    const enhancedProfile = {
      ...userProfile,
      weeklyStats: {
        loginDays: 5,
        featuresUsed: 12,
        pointsEarned: 245,
      },
      quickActions: [
        {
          title: '璁惧绠＄悊',
          description: '鏌ョ湅鍜岀鐞嗘偍鐨勮澶囪祫,
          icon: '馃摫',
          href: '/devices',
          color: 'blue',
        },
        {
          title: '缁翠慨宸ュ崟',
          description: '鍒涘缓鍜岃窡韪淮淇,
          icon: '馃敡',
          href: '/tickets',
          color: 'green',
        },
        {
          title: '鏁版嵁鍒嗘瀽',
          description: '鏌ョ湅涓氬姟娲炲療鍜屾姤,
          icon: '馃搳',
          href: '/analytics',
          color: 'purple',
        },
        {
          title: '涓汉涓績',
          description: '绠＄悊璐︽埛鍜屽亸濂借,
          icon: '馃懁',
          href: '/profile',
          color: 'orange',
        },
      ],
    };

    return NextResponse.json({
      success: true,
      data: enhancedProfile,
    });
  } catch (error) {
    console.error('鑾峰彇鐢ㄦ埛妗ｆ澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鑾峰彇鐢ㄦ埛妗ｆ澶辫触',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, updates } = body;

    // 妯℃嫙鏇存柊鐢ㄦ埛妗ｆ
    if (mockUserProfiles[userId]) {
      mockUserProfiles[userId] = {
        ...mockUserProfiles[userId],
        ...updates,
        lastUpdated: new Date().toISOString(),
      };

      // 鏇存柊cookie
      const cookieStore = cookies();
      cookieStore.set(
        'user-profile',
        JSON.stringify(mockUserProfiles[userId]),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 7, // 7          path: '/',
        }
      );

      return NextResponse.json({
        success: true,
        message: '鐢ㄦ埛妗ｆ鏇存柊鎴愬姛',
        data: mockUserProfiles[userId],
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: '鐢ㄦ埛涓嶅,
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('鏇存柊鐢ㄦ埛妗ｆ澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鏇存柊鐢ㄦ埛妗ｆ澶辫触',
      },
      { status: 500 }
    );
  }
}

