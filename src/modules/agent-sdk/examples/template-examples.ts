/**
 * FixCycle Agent SDK 模板系统使用示例
 */

import {
  BaseTemplate,
  Template,
  ConfigSchema,
  createTemplateMarket,
  createTemplatePreviewer,
  validateTemplate,
  DEFAULT_CATEGORIES,
} from '../src/templates';

// 示例1: 基础销售助手模?@Template({
  name: 'Sales Assistant Pro',
  description: '专业的销售助手智能体模板，提供客户跟进、销售预测等功能',
  category: 'business',
  version: '1.0.0',
  author: 'FixCycle Team',
  tags: ['sales', 'crm', 'customer-service'],
})
@ConfigSchema({
  type: 'object',
  properties: {
    salesTarget: {
      type: 'number',
      description: '销售目标金?,
      minimum: 0,
    },
    followUpDays: {
      type: 'number',
      description: '客户跟进间隔天数',
      minimum: 1,
      maximum: 30,
    },
    enablePredictions: {
      type: 'boolean',
      description: '是否启用销售预?,
      default: true,
    },
  },
  required: ['salesTarget', 'followUpDays'],
})
class SalesAssistantTemplate extends BaseTemplate {
  getSourceCode(): string {
    return `
import { BaseAgent, Agent, ValidateInput, FormatOutput } from '@fixcycle/agent-sdk';

@Agent({
  name: 'Sales Assistant Pro',
  version: '1.0.0',
  description: '专业的销售助手智能体',
  category: 'business'
})
export class SalesAssistant extends BaseAgent {
  private config: any;
  private customers: Map<string, any> = new Map();

  constructor(config: any) {
    super();
    this.config = config;
  }

  @ValidateInput((input) => {
    return input.customerId && input.action;
  })
  @FormatOutput((output) => {
    return {
      ...output,
      timestamp: new Date().toISOString()
    };
  })
  protected async onProcess(input: any): Promise<any> {
    const { customerId, action, data } = input;

    switch (action) {
      case 'followUp':
        return await this.handleFollowUp(customerId, data);
      case 'predictSales':
        return await this.predictSales();
      case 'analyzeCustomer':
        return await this.analyzeCustomer(customerId);
      default:
        throw new Error(\`未知操作: \${action}\`);
    }
  }

  private async handleFollowUp(customerId: string, data: any) {
    // 实现客户跟进逻辑
    const customer = this.customers.get(customerId) || {};
    customer.lastContact = new Date();
    customer.status = data.status || 'contacted';

    this.customers.set(customerId, customer);

    return {
      success: true,
      message: \`已更新客?\${customerId} 的跟进状态\`,
      customer
    };
  }

  private async predictSales() {
    // 实现销售预测逻辑
    const prediction = {
      monthlyTarget: this.config.salesTarget,
      currentProgress: this.calculateCurrentSales(),
      predictedCompletion: this.calculatePrediction(),
      recommendations: this.generateRecommendations()
    };

    return {
      type: 'sales_prediction',
      data: prediction
    };
  }

  private async analyzeCustomer(customerId: string) {
    const customer = this.customers.get(customerId);
    if (!customer) {
      throw new Error(\`客户 \${customerId} 不存在\`);
    }

    return {
      type: 'customer_analysis',
      customerId,
      analysis: {
        engagementLevel: this.calculateEngagement(customer),
        purchaseLikelihood: this.calculatePurchaseLikelihood(customer),
        recommendedActions: this.getRecommendedActions(customer)
      }
    };
  }

  // 辅助方法
  private calculateCurrentSales(): number {
    // 实现销售计算逻辑
    return 0;
  }

  private calculatePrediction(): number {
    // 实现预测计算逻辑
    return 0;
  }

  private generateRecommendations(): string[] {
    // 生成推荐建议
    return ['增加客户拜访频率', '优化产品演示'];
  }

  private calculateEngagement(customer: any): string {
    // 计算客户参与?    return 'high';
  }

  private calculatePurchaseLikelihood(customer: any): number {
    // 计算购买可能?    return 0.8;
  }

  private getRecommendedActions(customer: any): string[] {
    // 获取推荐行动
    return ['安排产品演示', '发送优惠方?];
  }
}
    `.trim();
  }

  getReadme(): string {
    return `
# Sales Assistant Pro 模板

## 简?这是一个专业的销售助手智能体模板，帮助销售人员更好地管理客户关系和提升销售业绩?
## 功能特?- 📊 客户跟进管理
- 🔮 销售预测分?- 👥 客户行为分析
- 📈 业绩跟踪报告

## 配置选项
- \`salesTarget\`: 销售目标金?- \`followUpDays\`: 客户跟进间隔天数
- \`enablePredictions\`: 是否启用销售预?
## 使用方法
\`\`\`typescript
import { SalesAssistant } from './sales-assistant';

const agent = new SalesAssistant({
  salesTarget: 100000,
  followUpDays: 7,
  enablePredictions: true
});

// 跟进客户
await agent.process({
  customerId: 'cust-001',
  action: 'followUp',
  data: { status: 'interested' }
});
\`\`\`

## 许可?MIT License
    `.trim();
  }
}

// 示例2: 代码审查助手模板
@Template({
  name: 'Code Review Assistant',
  description: '自动化代码审查助手，提供代码质量检查和改进建议',
  category: 'development',
  version: '1.0.0',
  author: 'Developer Tools Team',
  tags: ['code-review', 'quality-assurance', 'static-analysis'],
})
@ConfigSchema({
  type: 'object',
  properties: {
    language: {
      type: 'string',
      description: '编程语言',
      enum: ['javascript', 'typescript', 'python', 'java'],
    },
    strictness: {
      type: 'string',
      description: '审查严格程度',
      enum: ['lenient', 'moderate', 'strict'],
      default: 'moderate',
    },
    includeTests: {
      type: 'boolean',
      description: '是否包含测试代码审查',
      default: true,
    },
  },
  required: ['language'],
})
class CodeReviewTemplate extends BaseTemplate {
  getSourceCode(): string {
    return `
import { BaseAgent, Agent, ValidateInput } from '@fixcycle/agent-sdk';

@Agent({
  name: 'Code Review Assistant',
  version: '1.0.0',
  description: '自动化代码审查助?,
  category: 'development'
})
export class CodeReviewAssistant extends BaseAgent {
  private config: any;
  private rules: any[];

  constructor(config: any) {
    super();
    this.config = config;
    this.rules = this.loadReviewRules();
  }

  @ValidateInput((input) => {
    return input.code && typeof input.code === 'string';
  })
  protected async onProcess(input: any): Promise<any> {
    const { code, filename } = input;

    // 执行代码审查
    const issues = await this.reviewCode(code, filename);
    const score = this.calculateQualityScore(issues);
    const suggestions = this.generateSuggestions(issues);

    return {
      filename,
      qualityScore: score,
      issues,
      suggestions,
      summary: this.generateSummary(issues)
    };
  }

  private async reviewCode(code: string, filename: string): Promise<any[]> {
    const issues: any[] = [];

    // 语法检?    issues.push(...this.checkSyntax(code));

    // 代码风格检?    issues.push(...this.checkStyle(code));

    // 最佳实践检?    issues.push(...this.checkBestPractices(code));

    // 安全检?    issues.push(...this.checkSecurity(code));

    return issues;
  }

  private checkSyntax(code: string): any[] {
    // 实现语法检查逻辑
    return [];
  }

  private checkStyle(code: string): any[] {
    const issues: any[] = [];

    // 检查行长度
    const lines = code.split('\n');
    lines.forEach((line, index) => {
      if (line.length > 100) {
        issues.push({
          type: 'style',
          severity: 'low',
          line: index + 1,
          message: \`行长度超?00字符: \${line.length}字符\`,
          suggestion: '将长行拆分为多行'
        });
      }
    });

    return issues;
  }

  private checkBestPractices(code: string): any[] {
    // 实现最佳实践检?    return [];
  }

  private checkSecurity(code: string): any[] {
    const issues: any[] = [];

    // 检查潜在的安全问题
    if (code.includes('eval(')) {
      issues.push({
        type: 'security',
        severity: 'high',
        line: this.findLine(code, 'eval('),
        message: '检测到eval函数使用，存在安全风?,
        suggestion: '避免使用eval，使用更安全的替代方?
      });
    }

    return issues;
  }

  private calculateQualityScore(issues: any[]): number {
    let score = 100;

    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical': score -= 20; break;
        case 'high': score -= 10; break;
        case 'medium': score -= 5; break;
        case 'low': score -= 2; break;
      }
    });

    return Math.max(0, score);
  }

  private generateSuggestions(issues: any[]): string[] {
    const suggestions = new Set<string>();

    issues.forEach(issue => {
      if (issue.suggestion) {
        suggestions.add(issue.suggestion);
      }
    });

    return Array.from(suggestions);
  }

  private generateSummary(issues: any[]): any {
    const summary: any = {
      totalIssues: issues.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    issues.forEach(issue => {
      summary[issue.severity]++;
    });

    return summary;
  }

  private loadReviewRules(): any[] {
    // 加载审查规则
    return [
      { type: 'naming', pattern: /[a-z][A-Z]/, severity: 'low' },
      { type: 'complexity', threshold: 10, severity: 'medium' }
    ];
  }

  private findLine(code: string, searchText: string): number {
    const lines = code.split('\n');
    return lines.findIndex(line => line.includes(searchText)) + 1;
  }
}
    `.trim();
  }

  getReadme(): string {
    return `
# Code Review Assistant 模板

## 简?自动化代码审查助手，帮助开发者提高代码质量和一致性?
## 支持的语言
- JavaScript/TypeScript
- Python
- Java

## 功能特?- 🔍 语法错误检?- 🎨 代码风格检?- 💡 最佳实践建?- 🛡�?安全漏洞扫描
- 📊 质量评分

## 配置选项
- \`language\`: 编程语言
- \`strictness\`: 审查严格程度 (lenient/moderate/strict)
- \`includeTests\`: 是否审查测试代码

## 使用示例
\`\`\`typescript
import { CodeReviewAssistant } from './code-review';

const reviewer = new CodeReviewAssistant({
  language: 'typescript',
  strictness: 'moderate'
});

const result = await reviewer.process({
  code: 'your code here',
  filename: 'example.ts'
});

console.log(\`质量评分: \${result.qualityScore}\`);
console.log(\`发现问题: \${result.issues.length}个\`);
\`\`\`
    `.trim();
  }
}

// 使用示例函数
async function demonstrateTemplateSystem() {
  console.log('🎨 演示模板系统功能');

  // 1. 创建模板市场实例
  const market = await createTemplateMarket(
    'https://templates.fixcycle.com/api/v1'
  );

  // 2. 创建预览?  const previewer = createTemplatePreviewer({
    width: 800,
    height: 600,
    theme: 'light',
    showLineNumbers: true,
  });

  // 3. 展示默认分类
  console.log('\n📚 默认模板分类:');
  DEFAULT_CATEGORIES.forEach(category => {
    console.log(
      `  ${category.icon} ${category.name} (${category.templateCount}个模?`
    );
    category.subcategories.forEach(sub => {
      console.log(`    └─ ${sub.name} (${sub.templateCount}个模?`);
    });
  });

  // 4. 创建示例模板
  const salesTemplate = new SalesAssistantTemplate({
    name: 'Sales Assistant Pro',
    description: '专业的销售助手智能体模板',
    version: '1.0.0',
    category: 'business',
    author: 'FixCycle Team',
    tags: ['sales', 'crm'],
    readme: '',
    sourceCode: '',
    dependencies: [],
    license: 'MIT',
    price: 0,
  });

  const codeReviewTemplate = new CodeReviewTemplate({
    name: 'Code Review Assistant',
    description: '自动化代码审查助?,
    version: '1.0.0',
    category: 'development',
    author: 'Developer Tools Team',
    tags: ['code-review', 'quality'],
    readme: '',
    sourceCode: '',
    dependencies: [],
    license: 'MIT',
    price: 0,
  });

  // 5. 验证模板
  console.log('\n�?验证模板质量:');

  const salesTemplateData = {
    name: salesTemplate.getTemplateInfo().name,
    description: salesTemplate.getTemplateInfo().description,
    category: salesTemplate.getTemplateInfo().category,
    version: salesTemplate.getTemplateInfo().version,
    author: salesTemplate.getTemplateInfo().author,
    tags: salesTemplate.getTemplateInfo().tags,
    readme: salesTemplate.getReadme(),
    sourceCode: salesTemplate.getSourceCode(),
    dependencies: [],
    license: 'MIT',
    price: 0,
  };

  const validation = validateTemplate(salesTemplateData);
  console.log(
    `  销售助手模板验? ${validation.valid ? '�?通过' : '�?失败'}`
  );
  if (validation.qualityScore) {
    console.log(`  代码质量评分: ${validation.qualityScore}/100`);
  }

  // 6. 生成预览
  console.log('\n👁�? 生成模板预览:');
  try {
    const previewResult = previewer.generatePreview(
      salesTemplate.getSourceCode()
      // configSchema参数是可选的
    );

    console.log(`  预览生成成功`);
    console.log(`  标题: ${previewResult.metadata.title}`);
    console.log(`  依赖? ${previewResult.dependencies.join(', ')}`);
  } catch (error) {
    console.error('  预览生成失败:', error);
  }

  // 7. 清理资源
  previewer.destroy();

  console.log('\n🎉 模板系统演示完成');
}

// 导出示例
export {
  SalesAssistantTemplate,
  CodeReviewTemplate,
  demonstrateTemplateSystem,
};
