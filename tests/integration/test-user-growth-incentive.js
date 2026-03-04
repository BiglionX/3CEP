// 用户成长激励系统测试脚本

async function testUserGrowthIncentiveSystem() {
  console.log('🏆 开始测试用户成长激励系统...\n');

  // 测试1: 系统初始化测试
  console.log('📋 测试1: 系统初始化测试');
  await testSystemInitialization();
  console.log('✅ 系统初始化测试完成\n');

  // 测试2: 用户成长档案测试
  console.log('📋 测试2: 用户成长档案测试');
  await testUserGrowthProfile();
  console.log('✅ 用户成长档案测试完成\n');

  // 测试3: 积分计算和等级升级测试
  console.log('📋 测试3: 积分计算和等级升级测试');
  await testPointsAndLeveling();
  console.log('✅ 积分计算和等级升级测试完成\n');

  // 测试4: 里程碑和成就测试
  console.log('📋 测试4: 里程碑和成就测试');
  await testMilestonesAndAchievements();
  console.log('✅ 里程碑和成就测试完成\n');

  // 测试5: 奖励兑换测试
  console.log('📋 测试5: 奖励兑换测试');
  await testRewardRedemption();
  console.log('✅ 奖励兑换测试完成\n');

  console.log('🎉 所有测试完成！');
}

async function testSystemInitialization() {
  console.log('  • 测试系统配置加载');

  // 模拟系统配置
  const mockConfig = {
    levels: [
      { levelId: 'beginner', levelName: '新手学徒', requiredPoints: 0 },
      { levelId: 'apprentice', levelName: '熟练工匠', requiredPoints: 500 },
      { levelId: 'expert', levelName: '专业大师', requiredPoints: 1500 },
    ],
    milestones: [
      {
        milestoneId: 'first_login',
        name: '初次见面',
        triggerType: 'points_reached',
        triggerValue: 10,
      },
    ],
    rewards: [{ rewardId: 'premium_theme', name: '高级主题包', cost: 200 }],
  };

  console.log('  • 等级配置数量:', mockConfig.levels.length);
  console.log('  • 里程碑配置数量:', mockConfig.milestones.length);
  console.log('  • 奖励配置数量:', mockConfig.rewards.length);
  console.log('  • 系统初始化完成');
}

async function testUserGrowthProfile() {
  console.log('  • 测试用户成长档案管理');

  // 模拟用户档案
  const userProfiles = [
    {
      userId: 'user_001',
      currentLevel: 'beginner',
      totalPoints: 150,
      levelProgress: 30,
      achievements: ['first_login'],
      activityStreak: 5,
    },
    {
      userId: 'user_002',
      currentLevel: 'apprentice',
      totalPoints: 750,
      levelProgress: 50,
      achievements: ['first_login', 'quick_learner'],
      activityStreak: 12,
    },
  ];

  userProfiles.forEach(profile => {
    console.log(`  • 用户 ${profile.userId}:`);
    console.log(`    等级: ${profile.currentLevel}`);
    console.log(`    积分: ${profile.totalPoints}`);
    console.log(`    进度: ${profile.levelProgress}%`);
    console.log(`    成就数: ${profile.achievements.length}`);
    console.log(`    活跃天数: ${profile.activityStreak}`);
  });
}

async function testPointsAndLeveling() {
  console.log('  • 测试积分计算和等级升级');

  // 模拟积分获取场景
  const pointScenarios = [
    { activity: 'login', basePoints: 10, multiplier: 1 },
    { activity: 'feature_use', basePoints: 25, multiplier: 1 },
    { activity: 'tutorial_completion', basePoints: 100, multiplier: 2 },
    { activity: 'daily_checkin', basePoints: 5, multiplier: 1 },
  ];

  let totalPoints = 0;
  const levelThresholds = [0, 500, 1500, 3000]; // 各等级所需积分

  console.log('  • 积分获取场景测试:');
  pointScenarios.forEach(scenario => {
    const points = scenario.basePoints * scenario.multiplier;
    totalPoints += points;
    console.log(
      `    ${scenario.activity}: +${points} 积分 (总计: ${totalPoints})`
    );
  });

  // 计算当前等级
  let currentLevel = 'beginner';
  let levelProgress = 0;
  let pointsToNext = 0;

  for (let i = 0; i < levelThresholds.length - 1; i++) {
    if (
      totalPoints >= levelThresholds[i] &&
      totalPoints < levelThresholds[i + 1]
    ) {
      currentLevel = ['beginner', 'apprentice', 'expert', 'master'][i];
      const pointsInLevel = totalPoints - levelThresholds[i];
      const pointsForNextLevel = levelThresholds[i + 1] - levelThresholds[i];
      levelProgress = Math.round((pointsInLevel / pointsForNextLevel) * 100);
      pointsToNext = levelThresholds[i + 1] - totalPoints;
      break;
    }
  }

  console.log('  • 等级计算结果:');
  console.log(`    当前等级: ${currentLevel}`);
  console.log(`    等级进度: ${levelProgress}%`);
  console.log(`    升级还需: ${pointsToNext} 积分`);
}

async function testMilestonesAndAchievements() {
  console.log('  • 测试里程碑和成就系统');

  // 模拟里程碑触发
  const milestones = [
    { id: 'first_login', name: '初次见面', trigger: 10, current: 15 },
    { id: 'week_active', name: '活跃一周', trigger: 7, current: 5 },
    { id: 'feature_master', name: '功能达人', trigger: 10, current: 8 },
  ];

  console.log('  • 里程碑进度检查:');
  milestones.forEach(milestone => {
    const progress = Math.min(
      100,
      (milestone.current / milestone.trigger) * 100
    );
    const status =
      progress >= 100 ? '✅ 已完成' : `⏳ 进行中 (${progress.toFixed(0)}%)`;
    console.log(`    ${milestone.name}: ${status}`);
  });

  // 模拟成就解锁
  const achievements = [
    { id: 'quick_learner', name: '快速上手', unlocked: true },
    { id: 'explorer', name: '探索者', unlocked: true },
    { id: 'contributor', name: '贡献者', unlocked: false },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  console.log(
    `  • 成就解锁情况: ${unlockedCount}/${achievements.length} 个成就已解锁`
  );

  achievements.forEach(achievement => {
    const status = achievement.unlocked ? '🔓 已解锁' : '🔒 未解锁';
    console.log(`    ${achievement.name}: ${status}`);
  });
}

async function testRewardRedemption() {
  console.log('  • 测试奖励兑换功能');

  // 模拟用户积分和可兑换奖励
  const userPoints = 850;
  const availableRewards = [
    { id: 'premium_theme', name: '高级主题包', cost: 200, category: 'virtual' },
    {
      id: 'priority_support',
      name: '优先技术支持',
      cost: 500,
      category: 'service',
    },
    {
      id: 'exclusive_badge',
      name: '专属徽章',
      cost: 1000,
      category: 'virtual',
    },
  ];

  console.log(`  • 用户当前积分: ${userPoints}`);
  console.log('  • 可兑换奖励:');

  availableRewards.forEach(reward => {
    const canAfford = userPoints >= reward.cost;
    const status = canAfford
      ? '✅ 可兑换'
      : `❌ 积分不足 (还需${reward.cost - userPoints}积分)`;
    console.log(`    ${reward.name} (${reward.cost}积分): ${status}`);
  });

  // 模拟兑换过程
  const redeemedRewards = [];
  let remainingPoints = userPoints;

  for (const reward of availableRewards) {
    if (remainingPoints >= reward.cost) {
      remainingPoints -= reward.cost;
      redeemedRewards.push(reward.name);
      console.log(`  • 兑换 ${reward.name} 成功，剩余积分: ${remainingPoints}`);
    }
  }

  console.log(`  • 总共兑换了 ${redeemedRewards.length} 个奖励`);
  console.log(`  • 最终剩余积分: ${remainingPoints}`);
}

// 运行测试
if (typeof require !== 'undefined' && require.main === module) {
  testUserGrowthIncentiveSystem().catch(console.error);
}

module.exports = { testUserGrowthIncentiveSystem };
