// n8n工作流集?// 将采购智能体功能集成到n8n自动化平?
import { createClient } from '@supabase/supabase-js';
import { MarketIntelligenceService } from '../services/market-intelligence.service';

// 模拟服务?class SupplierProfilingService {
  async smartMatching(criteria: any) {
    return {
      matches: [
        {
          supplier: {
            supplier_id: 'SUP-001',
            company_name: '示例供应?,
            geographic_info: { country: 'China' },
            capabilities: { product_categories: ['电子产品'] },
            certifications: ['ISO 9001'],
          },
          matchingScore: 0.85,
        },
      ],
    };
  }
}

class ContractAdvisorService {
  async generateContractClauses(context: any) {
    return [
      {
        category: '价格条款',
        title: '付款条件',
        content: '买方应在收到货物?0天内付款',
        importance: 'high',
        explanation: '标准付款条件',
      },
    ];
  }
}

interface N8nWorkflowConfig {
  workflow_id: string;
  name: string;
  description: string;
  trigger_type: 'manual' | 'schedule' | 'webhook' | 'event';
  enabled: boolean;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface N8nExecutionLog {
  execution_id: string;
  workflow_id: string;
  status: 'success' | 'failed' | 'running';
  input_data: Record<string, any>;
  output_data: Record<string, any>;
  error_message?: string;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
}

export class N8nIntegration {
  private supabase: any;
  private supplierProfiling: SupplierProfilingService;
  private marketIntelligence: MarketIntelligenceService;
  private contractAdvisor: ContractAdvisorService;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    this.supplierProfiling = new SupplierProfilingService();
    this.marketIntelligence = new MarketIntelligenceService();
    this.contractAdvisor = new ContractAdvisorService();
  }

  /**
   * 注册n8n节点
   */
  async registerNodes(): Promise<void> {
    const nodes = [
      {
        name: '采购智能?- 供应商匹?,
        type: 'procurement-intelligence.supplier-matching',
        description: '基于AI的智能供应商匹配',
        version: 1,
        defaults: {
          name: '智能供应商匹?,
          color: '#4CAF50',
        },
        inputs: ['main'],
        outputs: ['main'],
        properties: [
          {
            displayName: '采购需求描?,
            name: 'requirements',
            type: 'string',
            default: '',
            description: '描述采购需求的文本',
          },
          {
            displayName: '预算范围',
            name: 'budgetRange',
            type: 'fixedCollection',
            default: {},
            options: [
              {
                name: 'range',
                displayName: '预算范围',
                values: [
                  {
                    displayName: '最小?,
                    name: 'min',
                    type: 'number',
                    default: 0,
                  },
                  {
                    displayName: '最大?,
                    name: 'max',
                    type: 'number',
                    default: 1000000,
                  },
                ],
              },
            ],
          },
          {
            displayName: '优先级权?,
            name: 'priorities',
            type: 'fixedCollection',
            default: {},
            options: [
              {
                name: 'weights',
                displayName: '权重设置',
                values: [
                  {
                    displayName: '质量权重',
                    name: 'quality',
                    type: 'number',
                    default: 0.4,
                  },
                  {
                    displayName: '价格权重',
                    name: 'price',
                    type: 'number',
                    default: 0.3,
                  },
                  {
                    displayName: '交付权重',
                    name: 'delivery',
                    type: 'number',
                    default: 0.2,
                  },
                  {
                    displayName: '服务权重',
                    name: 'service',
                    type: 'number',
                    default: 0.1,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: '采购智能?- 市场分析',
        type: 'procurement-intelligence.market-analysis',
        description: '国际市场价格和趋势分?,
        version: 1,
        defaults: {
          name: '市场情报分析',
          color: '#2196F3',
        },
        inputs: ['main'],
        outputs: ['main'],
        properties: [
          {
            displayName: '商品类别',
            name: 'commodities',
            type: 'multiOptions',
            options: [
              { name: 'semiconductors', value: '半导? },
              { name: 'electronics', value: '电子元件' },
              { name: 'materials', value: '原材? },
              { name: 'components', value: '机械部件' },
            ],
            default: [],
          },
          {
            displayName: '地区范围',
            name: 'regions',
            type: 'multiOptions',
            options: [
              { name: 'asia_pacific', value: '亚太地区' },
              { name: 'north_america', value: '北美地区' },
              { name: 'europe', value: '欧洲地区' },
              { name: 'global', value: '全球' },
            ],
            default: ['global'],
          },
          {
            displayName: '分析周期',
            name: 'period',
            type: 'options',
            options: [
              { name: '1m', value: '�?个月' },
              { name: '3m', value: '�?个月' },
              { name: '6m', value: '�?个月' },
              { name: '1y', value: '�?�? },
            ],
            default: '3m',
          },
        ],
      },
      {
        name: '采购智能?- 合同建议',
        type: 'procurement-intelligence.contract-advice',
        description: '智能合同条款建议',
        version: 1,
        defaults: {
          name: '合同条款建议',
          color: '#FF9800',
        },
        inputs: ['main'],
        outputs: ['main'],
        properties: [
          {
            displayName: '合同类型',
            name: 'contractType',
            type: 'options',
            options: [
              { name: 'goods', value: '货物采购' },
              { name: 'services', value: '服务采购' },
              { name: 'construction', value: '工程建设' },
            ],
            default: 'goods',
          },
          {
            displayName: '合同金额',
            name: 'contractValue',
            type: 'number',
            default: 100000,
            description: '合同总金?,
          },
          {
            displayName: '供应商风险等?,
            name: 'supplierRisk',
            type: 'options',
            options: [
              { name: 'low', value: '低风? },
              { name: 'medium', value: '中等风险' },
              { name: 'high', value: '高风? },
            ],
            default: 'medium',
          },
        ],
      },
    ];

    // 注册节点到n8n (这通常是通过n8n的插件机制完?
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
      '注册n8n节点:',
      nodes.map(n => n.name));
  }

  /**
   * 处理供应商匹配节?   */
  async handleSupplierMatching(data: any): Promise<any> {
    try {
      const startTime = Date.now();

      // 解析输入数据
      const requirements = data.requirements || '通用采购需?;
      const budgetMin = data?.range?.min || 0;
      const budgetMax = data?.range?.max || 1000000;
      const priorities = data?.weights || {
        quality: 0.4,
        price: 0.3,
        delivery: 0.2,
        service: 0.1,
      };

      // 执行智能匹配
      const matchingResult = await this.supplierProfiling.smartMatching({
        productSpecs: {
          category: 'general',
          technicalRequirements: requirements.split(','),
          qualityStandards: [],
          quantity: 100,
          deliveryTimeline: 30,
        },
        businessConditions: {
          budgetRange: [budgetMin, budgetMax],
          paymentTerms: '30_days',
          deliveryLocation: 'China',
          currency: 'USD',
        },
        riskTolerance: 'moderate',
        priorities: priorities,
      });

      const result = {
        matches: matchingResult.matches.map((match: any) => ({
          supplier_id: match.supplier.supplier_id,
          company_name: match.supplier.company_name,
          matching_score: Math.round(match.matchingScore * 100),
          country: match.supplier.geographic_info.country,
          capabilities: match.supplier.capabilities.product_categories,
          certifications: match.supplier.certifications,
        })),
        total_matches: matchingResult.matches.length,
        execution_time: Date.now() - startTime,
      };

      // 记录执行日志
      await this.logExecution('supplier-matching', data, result);

      return result;
    } catch (error: any) {
      await this.logExecution('supplier-matching', data, {}, error.message);
      throw error;
    }
  }

  /**
   * 处理市场分析节点
   */
  async handleMarketAnalysis(data: any): Promise<any> {
    try {
      const startTime = Date.now();

      const commodities = data.commodities || ['semiconductors'];
      const regions = data.regions || ['global'];
      const period = data.period || '3m';

      // 生成市场情报报告
      const report =
        await this.marketIntelligence.generateMarketIntelligenceReport(
          commodities,
          regions
        );

      const result = {
        price_indices: report.price_indices.map((index: any) => ({
          commodity: index.commodity,
          current_price: index.current_price,
          price_change: index.price_change,
          trend: index.trend,
          volatility: index.volatility_index,
        })),
        supply_demand_analysis: report.supply_demand_analyses.map(
          (analysis: any) => ({
            commodity: analysis.commodity,
            supply_level: analysis.supply_level,
            demand_level: analysis.demand_level,
            market_pressure: analysis.market_pressure,
          })
        ),
        market_outlook: {
          sentiment: report.market_outlook.overall_sentiment,
          key_drivers: report.market_outlook.key_drivers,
        },
        execution_time: Date.now() - startTime,
      };

      // 记录执行日志
      await this.logExecution('market-analysis', data, result);

      return result;
    } catch (error: any) {
      await this.logExecution('market-analysis', data, {}, error.message);
      throw error;
    }
  }

  /**
   * 处理合同建议节点
   */
  async handleContractAdvice(data: any): Promise<any> {
    try {
      const startTime = Date.now();

      const contractType = data.contractType || 'goods';
      const contractValue = data.contractValue || 100000;
      const supplierRisk = data.supplierRisk || 'medium';

      // 生成合同条款建议
      const clauses = await this.contractAdvisor.generateContractClauses({
        procurementType: contractType as any,
        contractValue: contractValue,
        currency: 'USD',
        duration: 12,
        supplierRiskLevel: supplierRisk as any,
        supplierPerformanceHistory: {
          qualityScore: 80,
          deliveryScore: 85,
          serviceScore: 75,
        },
        qualityRequirements: ['ISO 9001'],
        deliveryRequirements: ['准时交付'],
        paymentPreferences: {
          paymentMethod: 'installment',
          paymentTerm: 30,
        },
        riskTolerance: 'moderate',
        industryType: 'technology',
        regulatoryRequirements: ['合同?],
      });

      const result = {
        contract_clauses: clauses.map((clause: any) => ({
          category: clause.category,
          title: clause.title,
          content: clause.content,
          importance: clause.importance,
          explanation: clause.explanation,
        })),
        total_clauses: clauses.length,
        execution_time: Date.now() - startTime,
      };

      // 记录执行日志
      await this.logExecution('contract-advice', data, result);

      return result;
    } catch (error: any) {
      await this.logExecution('contract-advice', data, {}, error.message);
      throw error;
    }
  }

  /**
   * 记录执行日志
   */
  private async logExecution(
    workflowId: string,
    inputData: any,
    outputData: any,
    errorMessage?: string
  ): Promise<void> {
    try {
      const executionLog: N8nExecutionLog = {
        execution_id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        workflow_id: workflowId,
        status: errorMessage ? 'failed' : 'success',
        input_data: inputData,
        output_data: outputData,
        error_message: errorMessage,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        duration_ms: 0, // 实际应用中应该计算真实耗时
      };

      await this.supabase.from('n8n_execution_logs').insert(executionLog);
    } catch (error) {
      console.error('记录执行日志失败:', error);
    }
  }

  /**
   * 获取工作流执行统?   */
  async getExecutionStats(workflowId?: string): Promise<any> {
    try {
      let query = this.supabase.from('n8n_execution_logs').select('*');

      if (workflowId) {
        query = query.eq('workflow_id', workflowId);
      }

      const { data, error } = await query
        .order('started_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // 计算统计信息
      const totalExecutions = data.length;
      const successfulExecutions = data.filter(
        (log: any) => log.status === 'success'
      ).length;
      const failedExecutions = data.filter(
        (log: any) => log.status === 'failed'
      ).length;

      const successRate =
        totalExecutions > 0
          ? (successfulExecutions / totalExecutions) * 100
          : 0;

      return {
        total_executions: totalExecutions,
        successful_executions: successfulExecutions,
        failed_executions: failedExecutions,
        success_rate: successRate.toFixed(2) + '%',
        recent_executions: data.slice(0, 10),
      };
    } catch (error) {
      console.error('获取执行统计失败:', error);
      return {
        total_executions: 0,
        successful_executions: 0,
        failed_executions: 0,
        success_rate: '0%',
        recent_executions: [],
      };
    }
  }

  /**
   * webhook处理?   */
  async handleWebhook(request: Request): Promise<Response> {
    try {
      const body = await request.json();
      const { action, data, workflow } = body;

      let result: any;

      switch (action) {
        case 'supplier-matching':
          result = await this.handleSupplierMatching(data);
          break;
        case 'market-analysis':
          result = await this.handleMarketAnalysis(data);
          break;
        case 'contract-advice':
          result = await this.handleContractAdvice(data);
          break;
        default:
          return new Response(
            JSON.stringify({
              success: false,
              error: `未知的操? ${action}`,
            }),
            { status: 400 }
          );
      }

      return new Response(
        JSON.stringify({
          success: true,
          result: result,
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (error: any) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message || '内部服务器错?,
        }),
        { status: 500 }
      );
    }
  }
}

// 导出实例
export const n8nIntegration = new N8nIntegration();

// Express风格的路由处理器
export async function POST(request: Request) {
  return await n8nIntegration.handleWebhook(request);
}

export async function GET() {
  try {
    const stats = await n8nIntegration.getExecutionStats();
    return new Response(
      JSON.stringify({
        success: true,
        stats: stats,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
