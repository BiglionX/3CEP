// 运营角色专属页面内容
export const opsContent = {
  hero: {
    title: '运营自动化解决方案',
    subtitle: '智能处理异常订单、自动化工单流转、提升SLA达成率',
    ctaText: '预约演示',
    backgroundImage: '/images/hero-ops.jpg',
  },
  features: [
    {
      title: '异常自动识别与处理',
      description:
        '基于AI的异常检测引擎，自动识别订单异常类型并执行标准化处理流程，减少人工干预85%',
      metrics: ['异常识别准确率99%', '处理时效提升70%', '人工成本降低60%'],
      icon: 'alert-triangle',
    },
    {
      title: '工单智能分派',
      description:
        '根据技能标签和负载情况，智能分配工单给最合适的处理人员，提升处理效率40%',
      metrics: ['分派准确率95%', '响应时间缩短50%', '满意度提升30%'],
      icon: 'users',
    },
    {
      title: 'SLA实时监控',
      description:
        '全链路SLA监控预警系统，提前发现潜在超时风险并自动触发补救措施',
      metrics: ['预警准确率90%', '超时率降低80%', '客户投诉减少70%'],
      icon: 'clock',
    },
    {
      title: '多渠道统一管理',
      description:
        '整合电话、微信、邮件等多渠道客服入口，统一工单池管理，避免遗漏',
      metrics: ['渠道整合率100%', '处理一致性提升60%', '跨渠道协同效率翻倍'],
      icon: 'message-circle',
    },
  ],
  testimonials: [
    {
      quote:
        '引入自动化异常处理后，我们的客服响应效率提升了60%，客户满意度显著改善。',
      author: '张明华',
      position: '客服总监',
      company: '某知名电商平台',
      rating: 5,
    },
    {
      quote: '工单智能分派系统帮我们解决了人员调配难题，处理效率大幅提升。',
      author: '李小红',
      position: '运营经理',
      company: '连锁零售企业',
      rating: 5,
    },
  ],
  faqs: [
    {
      question: '如何保证异常识别的准确性？',
      answer:
        '我们采用机器学习算法，结合历史数据训练模型，识别准确率达到99%。同时支持人工复核机制，确保关键业务不受影响。',
    },
    {
      question: '系统能否与现有客服系统集成？',
      answer:
        '支持。我们提供标准API接口，可与主流客服系统（如Zendesk、网易七鱼等）无缝集成。',
    },
  ],
};

// 技术角色专属页面内容
export const techContent = {
  hero: {
    title: '技术运维自动化平台',
    subtitle: 'n8n可视化编排 + 智能回放回滚，让系统运维更简单可靠',
    ctaText: '下载技术白皮书',
    backgroundImage: '/images/hero-tech.jpg',
  },
  features: [
    {
      title: '可视化工作流编排',
      description:
        '基于n8n的拖拽式工作流设计器，零代码实现复杂的系统集成和自动化运维任务',
      metrics: ['支持500+应用集成', '开发效率提升80%', '部署时间缩短70%'],
      icon: 'workflow',
    },
    {
      title: '执行回放与调试',
      description: '完整的执行轨迹记录和可视化调试工具，快速定位和解决问题根源',
      metrics: ['调试时间减少60%', '问题定位准确率95%', 'MTTR缩短50%'],
      icon: 'play',
    },
    {
      title: '安全回滚机制',
      description: '一键回滚到任意历史版本，保障生产环境稳定性和业务连续性',
      metrics: ['回滚成功率99.9%', '恢复时间<5分钟', '数据一致性100%'],
      icon: 'rotate-ccw',
    },
    {
      title: '实时监控与告警',
      description: '全方位系统监控指标采集，智能告警规则配置，主动发现潜在问题',
      metrics: ['监控覆盖率100%', '告警准确率90%', '故障预防率70%'],
      icon: 'monitor',
    },
  ],
  testimonials: [
    {
      quote:
        '技术团队以前需要花费大量时间做重复性的API对接工作，现在通过n8n编排，开发效率提高了80%。',
      author: '李伟东',
      position: '技术VP',
      company: '互联网科技公司',
      rating: 5,
    },
    {
      quote: '回放调试功能简直是救命稻草，大大缩短了问题排查时间。',
      author: '王技术',
      position: '高级工程师',
      company: '金融科技公司',
      rating: 5,
    },
  ],
  faqs: [
    {
      question: '对技术人员的学习成本高吗？',
      answer:
        '很低。n8n采用可视化拖拽界面，基本无需编程基础即可上手。我们还提供详细的文档和培训支持。',
    },
    {
      question: '如何保障生产环境的安全性？',
      answer:
        '提供完善的权限管控、执行审批、沙箱测试等安全机制，确保变更操作可控可追溯。',
    },
  ],
};

// 业务角色专属页面内容
export const bizContent = {
  hero: {
    title: '业务负责人决策平台',
    subtitle: 'ROI精准计算 + 实施路径规划，助力业务数字化转型成功',
    ctaText: '获取报价方案',
    backgroundImage: '/images/hero-biz.jpg',
  },
  features: [
    {
      title: 'ROI智能计算器',
      description:
        '基于历史数据和行业基准，精准预测自动化投入产出比，为决策提供量化依据',
      metrics: ['预测准确率85%', '投资回收期缩短30%', '成本节约量化分析'],
      icon: 'calculator',
    },
    {
      title: '标准化实施路径',
      description: '2周PoC验证 → 4周试点上线 → 8周全量推广的成熟实施方法论',
      metrics: ['实施成功率95%', '项目周期缩短40%', '风险控制100%'],
      icon: 'roadmap',
    },
    {
      title: '合规与安全保障',
      description:
        '符合GDPR、网络安全法等法规要求，完善的数据保护和隐私安全机制',
      metrics: ['合规认证齐全', '安全审计通过率100%', '数据泄露零事故'],
      icon: 'shield',
    },
    {
      title: '成本效益分析',
      description: '全面的成本构成分析和效益评估，持续优化投入产出比',
      metrics: ['成本透明度100%', '效益提升30%', '持续优化机制'],
      icon: 'trending-up',
    },
  ],
  testimonials: [
    {
      quote:
        '作为业务负责人，我最看重的是ROI。FixCycle帮我们降低了30%的人力成本，投资回报非常可观。',
      author: '王建国',
      position: '运营总经理',
      company: '制造业集团',
      rating: 5,
    },
    {
      quote: '标准化的实施路径让我们对项目成功充满信心，整个过程非常顺畅。',
      author: '陈总',
      position: 'CEO',
      company: '新零售企业',
      rating: 5,
    },
  ],
  faqs: [
    {
      question: '投资回报周期一般是多久？',
      answer:
        '根据我们的统计数据，大多数客户在3-6个月内实现正向ROI，一年内投资回报率可达300%以上。',
    },
    {
      question: '是否有成功案例可供参考？',
      answer:
        '我们在电商、制造、金融等多个行业都有成功案例，可以安排实地考察或线上分享会。',
    },
  ],
};

// 合作伙伴角色专属页面内容
export const partnerContent = {
  hero: {
    title: '合作伙伴生态平台',
    subtitle: '便捷入驻 + 数据对接 + 智能对账，共建共赢的合作生态',
    ctaText: '提交入驻申请',
    backgroundImage: '/images/hero-partner.jpg',
  },
  features: [
    {
      title: '一键快速入驻',
      description: '简化入驻流程，在线填写基本信息，3个工作日内完成资质审核',
      metrics: ['入驻流程3步完成', '审核时效<3个工作日', '通过率90%+'],
      icon: 'zap',
    },
    {
      title: '标准化数据接口',
      description:
        '提供完善的API文档和SDK，支持订单、库存、财务等核心数据实时同步',
      metrics: ['接口稳定性99.9%', '数据同步延迟<1秒', '错误率<0.1%'],
      icon: 'plug',
    },
    {
      title: '智能对账系统',
      description: '自动化对账流程，异常自动预警，大幅减少人工对账工作量',
      metrics: ['对账准确率99.9%', '人工干预减少80%', '结算周期缩短50%'],
      icon: 'receipt',
    },
    {
      title: '收益分成透明',
      description: '实时收益查询，自动分成计算，支持多种结算周期和方式',
      metrics: ['收益透明度100%', '结算准确率100%', '提现时效<24小时'],
      icon: 'dollar-sign',
    },
  ],
  testimonials: [
    {
      quote: '入驻流程非常简便，技术支持响应及时，是我们理想的合作伙伴。',
      author: '刘老板',
      position: '服务商负责人',
      company: '本地生活服务商',
      rating: 5,
    },
    {
      quote: '智能对账系统帮我们节省了大量财务人力，收益分成也很透明。',
      author: '赵经理',
      position: '财务总监',
      company: '供应链服务商',
      rating: 5,
    },
  ],
  faqs: [
    {
      question: '入驻需要什么资质要求？',
      answer:
        '需要营业执照、相关行业许可证，以及一定的服务能力。具体要求可在申请时查看详细说明。',
    },
    {
      question: '技术服务支持如何？',
      answer:
        '提供7×24小时技术支持热线、在线客服、技术文档、定期培训等多种支持方式。',
    },
  ],
};

// 内容获取函数
export function getContentByRole(role: string) {
  const contentMap: Record<string, any> = {
    ops: opsContent,
    tech: techContent,
    biz: bizContent,
    partner: partnerContent,
  };

  return contentMap[role] || null;
}
