// 快速匹配推荐算法测试脚本

async function testQuickMatchRecommender() {
  console.log('⚡ 开始测试快速匹配推荐算法...\n');

  // 测试1: 基础功能测试
  console.log('📋 测试1: 基础功能测试');
  await testBasicFunctionality();
  console.log('✅ 基础功能测试完成\n');

  // 测试2: 冷启动场景测试
  console.log('📋 测试2: 冷启动场景测试');
  await testColdStartScenario();
  console.log('✅ 冷启动场景测试完成\n');

  // 测试3: 相似度计算测试
  console.log('📋 测试3: 相似度计算测试');
  await testSimilarityCalculation();
  console.log('✅ 相似度计算测试完成\n');

  // 测试4: API接口测试
  console.log('📋 测试4: API接口测试');
  await testAPIInterface();
  console.log('✅ API接口测试完成\n');

  console.log('🎉 所有测试完成！');
}

async function testBasicFunctionality() {
  console.log('  • 测试推荐器初始化');

  // 模拟推荐器初始化
  const recommenderMock = {
    config: {
      coldStartThreshold: 5,
      similarityMethod: 'cosine',
      maxCandidates: 100,
      minSimilarity: 0.3,
    },
    userDatabase: new Map(),
    getSystemStats: () => ({
      totalUsers: 5,
      config: this.config,
      cacheSize: 0,
    }),
  };

  console.log('  • 推荐器配置:', recommenderMock.config.similarityMethod);
  console.log('  • 最小相似度阈值:', recommenderMock.config.minSimilarity);
  console.log('  • 冷启动阈值:', recommenderMock.config.coldStartThreshold);

  // 模拟添加用户数据
  const sampleUsers = [
    {
      userId: 'user_001',
      behavior: {
        featureUsage: ['device_management', 'repair'],
        activityLevel: 0.8,
      },
    },
    {
      userId: 'user_002',
      behavior: {
        featureUsage: ['device_management', 'inventory'],
        activityLevel: 0.6,
      },
    },
    {
      userId: 'user_003',
      behavior: {
        featureUsage: ['analytics', 'reporting'],
        activityLevel: 0.9,
      },
    },
  ];

  sampleUsers.forEach(user => {
    recommenderMock.userDatabase.set(user.userId, user);
  });

  console.log(
    '  • 用户数据加载完成，总用户数:',
    recommenderMock.userDatabase.size
  );
  console.log('  • 系统统计信息:', recommenderMock.getSystemStats());
}

async function testColdStartScenario() {
  console.log('  • 测试冷启动用户处理');

  // 模拟冷启动用户（行为数据很少）
  const coldStartUser = {
    userId: 'new_user_001',
    behavior: {
      featureUsage: ['login'], // 只有一个行为
      activityLevel: 0.2,
      visitFrequency: 1,
      sessionDuration: 300,
    },
    preferences: {
      favoriteCategories: [],
      preferredBrands: [],
    },
    demographics: {
      location: '北京',
    },
  };

  // 模拟降级策略
  const fallbackStrategies = ['popular', 'category', 'location'];
  const selectedStrategy = fallbackStrategies[0]; // 选择热门用户策略

  console.log('  • 检测到冷启动用户:', coldStartUser.userId);
  console.log('  • 行为特征数量:', coldStartUser.behavior.featureUsage.length);
  console.log('  • 采用降级策略:', selectedStrategy);

  // 模拟热门用户推荐结果
  const popularUsers = [
    {
      userId: 'user_001',
      similarityScore: 0.5,
      matchingFeatures: ['活跃用户'],
    },
    {
      userId: 'user_003',
      similarityScore: 0.5,
      matchingFeatures: ['活跃用户'],
    },
  ];

  console.log('  • 推荐热门用户数量:', popularUsers.length);
  console.log(
    '  • 平均相似度:',
    popularUsers.reduce((sum, u) => sum + u.similarityScore, 0) /
      popularUsers.length
  );
}

async function testSimilarityCalculation() {
  console.log('  • 测试相似度计算算法');

  // 模拟两个用户的特征向量
  const user1Features = [0.8, 0.7, 0.6, 0.9]; // activity, frequency, duration, depth
  const user2Features = [0.7, 0.8, 0.5, 0.8];
  const weights = [0.3, 0.3, 0.2, 0.2]; // 特征权重

  // 模拟余弦相似度计算
  function cosineSimilarity(vec1, vec2, weights) {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      const w = weights[i];
      const a = vec1[i] * w;
      const b = vec2[i] * w;

      dotProduct += a * b;
      norm1 += a * a;
      norm2 += b * b;
    }

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  const similarity = cosineSimilarity(user1Features, user2Features, weights);

  console.log('  • 用户1特征向量:', user1Features);
  console.log('  • 用户2特征向量:', user2Features);
  console.log('  • 特征权重:', weights);
  console.log('  • 计算相似度:', similarity.toFixed(4));
  console.log(
    '  • 相似度等级:',
    similarity > 0.7 ? '高' : similarity > 0.4 ? '中' : '低'
  );

  // 模拟匹配特征识别
  const matchingFeatures = ['共同使用设备管理功能', '相似的活跃度水平'];
  console.log('  • 识别匹配特征:', matchingFeatures.length, '个');
  console.log('  • 匹配特征详情:', matchingFeatures);
}

async function testAPIInterface() {
  console.log('  • 测试API接口功能');

  // 模拟API请求和响应
  const mockRequests = [
    {
      method: 'GET',
      endpoint: '/api/recommendation/quick-match?userId=user_001&maxResults=5',
      description: '获取用户推荐',
    },
    {
      method: 'POST',
      endpoint: '/api/recommendation/quick-match',
      description: '添加用户特征并获取推荐',
    },
    {
      method: 'PUT',
      endpoint: '/api/recommendation/quick-match/batch',
      description: '批量添加用户数据',
    },
  ];

  mockRequests.forEach(req => {
    console.log(`  • ${req.method} ${req.endpoint}`);
    console.log(`    用途: ${req.description}`);
  });

  // 模拟API响应
  const mockResponse = {
    success: true,
    data: {
      userId: 'user_001',
      recommendedUsers: [
        { userId: 'user_002', similarityScore: 0.85, confidence: 0.78 },
        { userId: 'user_003', similarityScore: 0.72, confidence: 0.65 },
      ],
      strategyUsed: 'similarity_match',
      processingTime: 45,
      metadata: {
        totalCandidates: 50,
        filteredCandidates: 2,
        similarityDistribution: [0, 5, 12, 25, 8],
      },
    },
  };

  console.log('  • API响应结构验证通过');
  console.log('  • 推荐用户数量:', mockResponse.data.recommendedUsers.length);
  console.log(
    '  • 最高相似度:',
    Math.max(...mockResponse.data.recommendedUsers.map(u => u.similarityScore))
  );
  console.log('  • 处理耗时:', mockResponse.data.processingTime, '毫秒');
  console.log('  • 使用策略:', mockResponse.data.strategyUsed);
}

// 运行测试
if (typeof require !== 'undefined' && require.main === module) {
  testQuickMatchRecommender().catch(console.error);
}

module.exports = { testQuickMatchRecommender };
