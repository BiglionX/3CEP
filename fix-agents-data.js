// 智能体数据修复脚本
// 用于统一更新所有页面的智能体模拟数据，使用真实的已上线智能体信息

const realAgents = [
  {
    id: 'uuid-customer-service',
    name: '智能客服助手',
    author_name: '3CEP Team',
    category: 'assistant',
    version: '2.0.0',
    status: 'active',
    rating: 4.65,
    review_count: 203,
    usage_count: 15430,
    pricing: {
      type: 'subscription',
      price: 299,
      unit: '月',
    },
    configuration: {
      capabilities: [
        'faq',
        'ticket_creation',
        'sentiment_analysis',
        'live_transfer',
      ],
    },
  },
  {
    id: 'uuid-technical-support',
    name: '技术支持智能体',
    author_name: '3CEP 企业服务',
    category: 'assistant',
    version: '1.6.0',
    status: 'active',
    rating: 4.88,
    review_count: 267,
    usage_count: 7650,
    pricing: {
      type: 'subscription',
      price: 299,
      unit: '月',
    },
    configuration: {
      capabilities: [
        'tech_consult',
        'diagnosis',
        'solution_recommend',
        'remote_assist',
      ],
    },
  },
  {
    id: 'uuid-sales',
    name: '销售智能体',
    author_name: '3CEP 企业服务',
    category: 'assistant',
    version: '1.3.0',
    status: 'active',
    rating: 4.7,
    review_count: 145,
    usage_count: 5430,
    pricing: {
      type: 'subscription',
      price: 399,
      unit: '月',
    },
    configuration: {
      capabilities: ['inquiry', 'quotation', 'order_consult', 'conversion'],
    },
  },
  {
    id: 'uuid-customer-service-enterprise',
    name: '客服智能体',
    author_name: '3CEP 企业服务',
    category: 'assistant',
    version: '1.5.0',
    status: 'active',
    rating: 4.78,
    review_count: 312,
    usage_count: 12890,
    pricing: {
      type: 'subscription',
      price: 399,
      unit: '月',
    },
    configuration: {
      capabilities: ['chat', 'faq', 'complaint', 'suggestion', 'smart_routing'],
    },
  },
  {
    id: 'uuid-after-sales',
    name: '售后智能体',
    author_name: '3CEP 企业服务',
    category: 'assistant',
    version: '1.4.0',
    status: 'active',
    rating: 4.82,
    review_count: 198,
    usage_count: 8920,
    pricing: {
      type: 'subscription',
      price: 399,
      unit: '月',
    },
    configuration: {
      capabilities: [
        'return_request',
        'repair_booking',
        'technical_support',
        'warranty_check',
      ],
    },
  },
  {
    id: 'uuid-fault-diagnosis',
    name: '设备故障诊断智能体',
    author_name: '3CEP 智能维修',
    category: 'analysis',
    version: '2.1.0',
    status: 'active',
    rating: 4.92,
    review_count: 342,
    usage_count: 12340,
    pricing: {
      type: 'subscription',
      price: 299,
      unit: '月',
    },
    configuration: {
      capabilities: [
        'fault_detection',
        'diagnosis',
        'repair_recommend',
        'parts_lookup',
      ],
    },
  },
  {
    id: 'uuid-parts-search',
    name: '配件查询智能体',
    author_name: '3CEP 配件商城',
    category: 'analysis',
    version: '1.4.0',
    status: 'active',
    rating: 4.8,
    review_count: 189,
    usage_count: 9870,
    pricing: {
      type: 'subscription',
      price: 199,
      unit: '月',
    },
    configuration: {
      capabilities: [
        'parts_search',
        'compatibility',
        'price_compare',
        'availability',
      ],
    },
  },
  {
    id: 'uuid-data-analysis',
    name: '数据分析助手',
    author_name: '3CEP Team',
    category: 'analysis',
    version: '1.3.0',
    status: 'active',
    rating: 4.9,
    review_count: 156,
    usage_count: 8920,
    pricing: {
      type: 'subscription',
      price: 599,
      unit: '月',
    },
    configuration: {
      capabilities: [
        'data_analysis',
        'chart_generation',
        'forecast',
        'insights',
      ],
    },
  },
  {
    id: 'uuid-code-review',
    name: '代码审查助手',
    author_name: '3CEP Team',
    category: 'coding',
    version: '1.2.0',
    status: 'active',
    rating: 4.85,
    review_count: 128,
    usage_count: 5680,
    pricing: {
      type: 'subscription',
      price: 399,
      unit: '月',
    },
    configuration: {
      capabilities: [
        'code_review',
        'security_scan',
        'performance_analysis',
        'bug_detection',
      ],
    },
  },
  {
    id: 'uuid-copywriting',
    name: '文案创作助手',
    author_name: '3CEP Team',
    category: 'writing',
    version: '1.1.0',
    status: 'active',
    rating: 4.72,
    review_count: 89,
    usage_count: 3240,
    pricing: {
      type: 'subscription',
      price: 199,
      unit: '月',
    },
    configuration: {
      capabilities: [
        'copywriting',
        'seo_optimization',
        'translation',
        'content_generation',
      ],
    },
  },
  {
    id: 'uuid-procurement',
    name: '采购智能体',
    author_name: '3CEP 企业服务',
    category: 'custom',
    version: '1.2.0',
    status: 'active',
    rating: 4.75,
    review_count: 98,
    usage_count: 4320,
    pricing: {
      type: 'subscription',
      price: 499,
      unit: '月',
    },
    configuration: {
      capabilities: [
        'supplier_recommend',
        'order_management',
        'approval_flow',
        'cost_analysis',
      ],
    },
  },
  {
    id: 'uuid-warehouse',
    name: '仓储智能体',
    author_name: '3CEP 企业服务',
    category: 'custom',
    version: '1.0.0',
    status: 'active',
    rating: 4.55,
    review_count: 54,
    usage_count: 1870,
    pricing: {
      type: 'subscription',
      price: 299,
      unit: '月',
    },
    configuration: {
      capabilities: ['inbound', 'outbound', 'inventory_count', 'alert'],
    },
  },
];

console.log('=== 真实智能体数据 ===');
console.log(`总共 ${realAgents.length} 个已上线智能体`);
console.log('\n智能体列表:\n');

realAgents.forEach((agent, index) => {
  console.log(`${index + 1}. ${agent.name}`);
  console.log(`   作者: ${agent.author_name}`);
  console.log(`   版本: v${agent.version}`);
  console.log(`   价格: ¥${agent.pricing.price}/${agent.pricing.unit}`);
  console.log(
    `   评分: ${agent.rating.toFixed(1)} (${agent.review_count} 评价)`
  );
  console.log(`   使用量: ${agent.usage_count.toLocaleString()}`);
  console.log(`   类别: ${agent.category}`);
  console.log(`   能力: ${agent.configuration.capabilities.join(', ')}`);
  console.log('');
});

// 根据业务类型推荐智能体
console.log('=== 按业务类型推荐的智能体 ===\n');

console.log('【企业用户】推荐智能体:');
console.log('1. 智能客服助手 - ¥299/月 - 4.65分');
console.log('2. 客服智能体 - ¥399/月 - 4.78分');
console.log('3. 售后智能体 - ¥399/月 - 4.82分');
console.log('4. 技术支持智能体 - ¥299/月 - 4.88分');
console.log('5. 销售智能体 - ¥399/月 - 4.70分');
console.log('6. 采购智能体 - ¥499/月 - 4.75分');
console.log('7. 数据分析助手 - ¥599/月 - 4.90分\n');

console.log('【维修店】推荐智能体:');
console.log('1. 设备故障诊断智能体 - ¥299/月 - 4.92分');
console.log('2. 配件查询智能体 - ¥199/月 - 4.80分');
console.log('3. 技术支持智能体 - ¥299/月 - 4.88分');
console.log('4. 售后智能体 - ¥399/月 - 4.82分\n');

console.log('【外贸公司】推荐智能体:');
console.log('1. 智能客服助手 - ¥299/月 - 4.65分');
console.log('2. 销售智能体 - ¥399/月 - 4.70分');
console.log('3. 数据分析助手 - ¥599/月 - 4.90分');
console.log('4. 文案创作助手 - ¥199/月 - 4.72分');
console.log('5. 代码审查助手 - ¥399/月 - 4.85分\n');

console.log('=== 价格统计 ===');
const totalAgents = realAgents.length;
const totalPrice = realAgents.reduce(
  (sum, agent) => sum + agent.pricing.price,
  0
);
const avgPrice = totalPrice / totalAgents;
const avgRating =
  realAgents.reduce((sum, agent) => sum + agent.rating, 0) / totalAgents;

console.log(`总智能体数: ${totalAgents}`);
console.log(`平均价格: ¥${avgPrice.toFixed(0)}/月`);
console.log(`价格范围: ¥199-¥599/月`);
console.log(`平均评分: ${avgRating.toFixed(2)}`);
console.log(
  `总使用量: ${realAgents.reduce((sum, agent) => sum + agent.usage_count, 0).toLocaleString()}`
);

console.log('\n脚本执行完成！');
