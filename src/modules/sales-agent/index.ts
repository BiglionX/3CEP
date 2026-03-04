// 销售智能体模块统一导出

// 类型导出
export * from './types';

// 服务导出
export * from './services';

// 模块信息
export const SALES_AGENT_MODULE_INFO = {
  name: 'sales-agent',
  version: '1.0.0',
  description:
    '销售智能体模块 - 提供客户管理、智能报价、合同签署、订单跟踪等全流程销售支?,
  features: [
    '客户智能管理与分级系?,
    '自动询价处理与智能报价引?,
    '合同智能谈判与电子签署流?,
    '订单全流程跟踪与履约监控',
  ],
};
