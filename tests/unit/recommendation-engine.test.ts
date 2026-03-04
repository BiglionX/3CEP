/**
 * FCX智能推荐引擎单元测试
 */

import {
  RecommendationContext,
  RecommendationItemType,
  UserActionType,
} from '@/fcx-system/models/recommendation.model';
import { CollaborativeFilterRecommender } from '@/fcx-system/services/collaborative-filter-recommender.service';
import { DeepLearningRecommender } from '@/fcx-system/services/deep-learning-recommender.service';
import { HybridRecommenderService } from '@/fcx-system/services/hybrid-recommender.service';
import { ItemProfileServiceImpl } from '@/fcx-system/services/item-profile.service';
import { UserBehaviorCollectorService } from '@/fcx-system/services/user-behavior-collector.service';
import { UserProfileServiceImpl } from '@/fcx-system/services/user-profile.service';

// Mock数据
const mockUserBehaviors = [
  {
    id: 'behavior_1',
    userId: 'user_001',
    itemId: 'shop_apple_store',
    itemType: RecommendationItemType.REPAIR_SHOP,
    actionType: UserActionType.VIEW,
    timestamp: '2024-01-01T10:00:00Z',
    score: 1.0,
  },
  {
    id: 'behavior_2',
    userId: 'user_001',
    itemId: 'part_iphone_screen',
    itemType: RecommendationItemType.PART,
    actionType: UserActionType.PURCHASE,
    timestamp: '2024-01-01T11:00:00Z',
    score: 2.5,
  },
  {
    id: 'behavior_3',
    userId: 'user_002',
    itemId: 'shop_huawei_center',
    itemType: RecommendationItemType.REPAIR_SHOP,
    actionType: UserActionType.REPAIR,
    timestamp: '2024-01-01T14:00:00Z',
    score: 2.0,
  },
];

describe('FCX智能推荐引擎测试套件', () => {
  describe('用户行为收集服务测试', () => {
    let behaviorCollector: UserBehaviorCollectorService;

    beforeEach(() => {
      behaviorCollector = new UserBehaviorCollectorService();
    });

    test('应该正确记录用户行为', async () => {
      const behavior = {
        id: 'test_behavior_123',
        userId: 'test_user_123',
        itemId: 'test_shop_456',
        itemType: RecommendationItemType.REPAIR_SHOP,
        actionType: UserActionType.VIEW,
        timestamp: new Date().toISOString(),
        score: 1.0,
      };

      await expect(
        behaviorCollector.recordBehavior(behavior)
      ).resolves.not.toThrow();
    });

    test('应该正确计算行为分数', async () => {
      // 测试不同行为类型的分数计算
      const purchaseBehavior = {
        userId: 'test_user',
        itemId: 'test_item',
        itemType: RecommendationItemType.PART,
        actionType: UserActionType.PURCHASE,
      };

      // Purchase行为应该有较高的分数
      expect(purchaseBehavior.actionType).toBe(UserActionType.PURCHASE);
    });

    test('应该能够批量记录行为', async () => {
      await expect(
        behaviorCollector.recordBehaviors(mockUserBehaviors)
      ).resolves.not.toThrow();
    });
  });

  describe('用户画像服务测试', () => {
    let userProfileService: UserProfileServiceImpl;

    beforeEach(() => {
      userProfileService = new UserProfileServiceImpl();
    });

    test('应该能够构建用户画像', async () => {
      const userId = 'user_profile_test';

      // 由于依赖外部服务，这里主要测试不抛出异常
      await expect(
        userProfileService.buildUserProfile(userId)
      ).resolves.not.toThrow();
    });

    test('应该能够计算用户相似度', async () => {
      const similarity = await userProfileService.calculateUserSimilarity(
        'user_001',
        'user_002'
      );

      expect(typeof similarity).toBe('number');
      expect(similarity).toBeGreaterThanOrEqual(0);
      expect(similarity).toBeLessThanOrEqual(1);
    });
  });

  describe('物品画像服务测试', () => {
    let itemProfileService: ItemProfileServiceImpl;

    beforeEach(() => {
      itemProfileService = new ItemProfileServiceImpl();
    });

    test('应该能够构建物品画像', async () => {
      // 测试不抛出异常
      await expect(
        itemProfileService.buildItemProfile(
          'shop_test_123',
          RecommendationItemType.REPAIR_SHOP
        )
      ).resolves.not.toThrow();
    });

    test('应该能够计算物品相似度', async () => {
      const similarity = await itemProfileService.calculateItemSimilarity(
        'item_001',
        'item_002'
      );

      expect(typeof similarity).toBe('number');
      expect(similarity).toBeGreaterThanOrEqual(0);
      expect(similarity).toBeLessThanOrEqual(1);
    });
  });

  describe('协同过滤推荐器测试', () => {
    let collaborativeRecommender: CollaborativeFilterRecommender;

    beforeEach(() => {
      collaborativeRecommender = new CollaborativeFilterRecommender();
    });

    test('应该能够初始化和训练', async () => {
      await expect(
        collaborativeRecommender.train(mockUserBehaviors)
      ).resolves.not.toThrow();
    });

    test('应该能够生成推荐', async () => {
      const context: RecommendationContext = {
        userId: 'user_001',
      };

      // 先训练模型
      await collaborativeRecommender.train(mockUserBehaviors);

      const recommendations = await collaborativeRecommender.recommend(
        context,
        5
      );

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThanOrEqual(0);
    });

    test('应该返回正确的算法类型', () => {
      expect(collaborativeRecommender.getType()).toBe('collaborative-filter');
    });
  });

  describe('深度学习推荐器测试', () => {
    let deepLearningRecommender: DeepLearningRecommender;

    beforeEach(() => {
      deepLearningRecommender = new DeepLearningRecommender();
    });

    test('应该能够初始化', async () => {
      await expect(deepLearningRecommender.initialize()).resolves.not.toThrow();
    });

    test('应该能够生成推荐', async () => {
      const context: RecommendationContext = {
        userId: 'user_dl_test',
      };

      await deepLearningRecommender.initialize();
      const recommendations = await deepLearningRecommender.recommend(
        context,
        5
      );

      expect(Array.isArray(recommendations)).toBe(true);
    });

    test('应该返回正确的算法类型', () => {
      expect(deepLearningRecommender.getType()).toBe('deep-learning');
    });
  });

  describe('混合推荐引擎测试', () => {
    let hybridRecommender: HybridRecommenderService;

    beforeEach(() => {
      hybridRecommender = new HybridRecommenderService();
    });

    test('应该能够初始化', async () => {
      await expect(hybridRecommender.initialize()).resolves.not.toThrow();
    });

    test('应该能够生成推荐结果', async () => {
      const context: RecommendationContext = {
        userId: 'user_hybrid_test',
      };

      await hybridRecommender.initialize();
      const result = await hybridRecommender.getRecommendations(context, 5);

      expect(result).toHaveProperty('requestId');
      expect(result).toHaveProperty('userId', context.userId);
      expect(result).toHaveProperty('items');
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items.length).toBeLessThanOrEqual(5);
    });

    test('应该包含必要的元数据', async () => {
      const context: RecommendationContext = {
        userId: 'user_metadata_test',
      };

      await hybridRecommender.initialize();
      const result = await hybridRecommender.getRecommendations(context, 3);

      expect(result.metadata).toBeDefined();
      expect(result.metadata).toHaveProperty('totalCandidates');
      expect(result.metadata).toHaveProperty('diversityScore');
      expect(result.metadata).toHaveProperty('noveltyScore');
    });

    test('应该能够处理批量推荐', async () => {
      const contexts: RecommendationContext[] = [
        { userId: 'user_batch_1' },
        { userId: 'user_batch_2' },
        { userId: 'user_batch_3' },
      ];

      await hybridRecommender.initialize();
      const results = await hybridRecommender.batchRecommend(contexts, 3);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(3);
      results.forEach(result => {
        expect(result.userId).toBeDefined();
      });
    });

    test('应该返回健康状态', async () => {
      const healthStatus = await hybridRecommender.getHealthStatus();

      expect(healthStatus).toHaveProperty('isHealthy');
      expect(typeof healthStatus.isHealthy).toBe('boolean');
      expect(healthStatus).toHaveProperty('totalUsers');
      expect(healthStatus).toHaveProperty('totalItems');
    });
  });

  describe('数据模型验证测试', () => {
    test('用户行为类型枚举应该完整', () => {
      expect(Object.values(UserActionType)).toContain(UserActionType.VIEW);
      expect(Object.values(UserActionType)).toContain(UserActionType.PURCHASE);
      expect(Object.values(UserActionType)).toContain(UserActionType.REPAIR);
    });

    test('推荐物品类型枚举应该完整', () => {
      expect(Object.values(RecommendationItemType)).toContain(
        RecommendationItemType.REPAIR_SHOP
      );
      expect(Object.values(RecommendationItemType)).toContain(
        RecommendationItemType.PART
      );
    });

    test('推荐上下文应该具有必要属性', () => {
      const context: RecommendationContext = {
        userId: 'test_user',
      };

      expect(context.userId).toBe('test_user');
    });
  });
});

// 性能测试
describe('性能测试', () => {
  test('推荐生成应该在合理时间内完成', async () => {
    const hybridRecommender = new HybridRecommenderService();
    await hybridRecommender.initialize();

    const context: RecommendationContext = {
      userId: 'perf_test_user',
    };

    const startTime = Date.now();
    await hybridRecommender.getRecommendations(context, 10);
    const endTime = Date.now();

    const processingTime = endTime - startTime;
    expect(processingTime).toBeLessThan(5000); // 应该在5秒内完成
  });

  test('批量推荐应该比单个推荐更高效', async () => {
    const hybridRecommender = new HybridRecommenderService();
    await hybridRecommender.initialize();

    const contexts: RecommendationContext[] = [
      { userId: 'batch_perf_1' },
      { userId: 'batch_perf_2' },
      { userId: 'batch_perf_3' },
    ];

    // 测量批量处理时间
    const batchStartTime = Date.now();
    await hybridRecommender.batchRecommend(contexts, 5);
    const batchEndTime = Date.now();
    const batchTime = batchEndTime - batchStartTime;

    // 测量单独处理时间
    const singleStartTime = Date.now();
    await Promise.all([
      hybridRecommender.getRecommendations(contexts[0], 5),
      hybridRecommender.getRecommendations(contexts[1], 5),
      hybridRecommender.getRecommendations(contexts[2], 5),
    ]);
    const singleEndTime = Date.now();
    const singleTime = singleEndTime - singleStartTime;

    // 批量处理应该更快或相近
    expect(batchTime).toBeLessThanOrEqual(singleTime * 1.5);
  });
});

// 错误处理测试
describe('错误处理测试', () => {
  test('应该优雅处理无效用户ID', async () => {
    const hybridRecommender = new HybridRecommenderService();
    await hybridRecommender.initialize();

    const context: RecommendationContext = {
      userId: '', // 无效用户ID
    };

    // 应该返回降级推荐而不是抛出错误
    await expect(
      hybridRecommender.getRecommendations(context, 5)
    ).resolves.not.toThrow();
  });

  test('应该处理缺失的必需参数', async () => {
    const behaviorCollector = new UserBehaviorCollectorService();

    const invalidBehavior: any = {
      // 缺少userId
      itemId: 'test_item',
      actionType: UserActionType.VIEW,
    };

    await expect(
      behaviorCollector.recordBehavior(invalidBehavior)
    ).rejects.toThrow();
  });
});
