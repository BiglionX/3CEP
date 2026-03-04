/**
 * FixCycle Agent SDK 模板预览系统
 * 提供模板代码预览、实时渲染和质量评估功能
 */

// 预览配置接口
export interface PreviewConfig {
  width: number;
  height: number;
  theme: 'light' | 'dark';
  showLineNumbers: boolean;
  highlightErrors: boolean;
  autoRefresh: boolean;
}

// 预览结果接口
export interface PreviewResult {
  html: string;
  css: string;
  javascript: string;
  dependencies: string[];
  metadata: {
    title: string;
    description: string;
    author: string;
    version: string;
  };
}

// 代码质量评估结果
export interface QualityAssessment {
  score: number; // 0-100
  issues: QualityIssue[];
  suggestions: string[];
  metrics: QualityMetrics;
}

// 代码质量问题
export interface QualityIssue {
  type: 'syntax' | 'style' | 'performance' | 'security' | 'maintainability';
  severity: 'low' | 'medium' | 'high' | 'critical';
  line: number;
  column: number;
  message: string;
  suggestion: string;
}

// 代码质量指标
export interface QualityMetrics {
  cyclomaticComplexity: number;
  linesOfCode: number;
  commentRatio: number;
  duplicationRate: number;
  testCoverage?: number;
}

// 模板预览?export class TemplatePreviewer {
  private config: PreviewConfig;
  private sandbox: HTMLIFrameElement | null = null;

  constructor(config?: Partial<PreviewConfig>) {
    this.config = {
      width: 800,
      height: 600,
      theme: 'light',
      showLineNumbers: true,
      highlightErrors: true,
      autoRefresh: true,
      ...config,
    };
  }

  /**
   * 生成HTML预览
   */
  generatePreview(templateCode: string, configSchema?: any): PreviewResult {
    try {
      // 解析模板代码
      const parsedCode = this.parseTemplateCode(templateCode);

      // 生成预览HTML
      const html = this.generatePreviewHTML(parsedCode, configSchema);

      // 生成样式
      const css = this.generatePreviewCSS();

      // 生成交互脚本
      const javascript = this.generatePreviewJS(parsedCode);

      return {
        html,
        css,
        javascript,
        dependencies: parsedCode.dependencies,
        metadata: {
          title: parsedCode.className || 'Unknown Template',
          description: parsedCode.description || 'No description provided',
          author: parsedCode.author || 'Anonymous',
          version: parsedCode.version || '1.0.0',
        },
      };
    } catch (error) {
      throw new Error(`预览生成失败: ${(error as Error).message}`);
    }
  }

  /**
   * 在iframe中渲染预?   */
  renderPreview(container: HTMLElement, previewResult: PreviewResult): void {
    // 清理现有的sandbox
    if (this.sandbox) {
      container.removeChild(this.sandbox);
    }

    // 创建新的sandbox iframe
    this.sandbox = document.createElement('iframe');
    this.sandbox.style.width = `${this.config.width}px`;
    this.sandbox.style.height = `${this.config.height}px`;
    this.sandbox.style.border = '1px solid #ddd';
    this.sandbox.style.borderRadius = '8px';
    this.sandbox.sandbox.add('allow-scripts', 'allow-same-origin');

    // 设置预览内容
    const previewContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${previewResult.metadata.title} Preview</title>
        <style>${previewResult.css}</style>
      </head>
      <body>
        ${previewResult.html}
        <script>${previewResult.javascript}</script>
      </body>
      </html>
    `;

    container.appendChild(this.sandbox);

    // 写入内容
    this.sandbox.contentDocument?.open();
    this.sandbox.contentDocument?.write(previewContent);
    this.sandbox.contentDocument?.close();
  }

  /**
   * 评估代码质量
   */
  assessQuality(code: string): QualityAssessment {
    const issues: QualityIssue[] = [];
    let score = 100;

    // 语法检?    const syntaxIssues = this.checkSyntax(code);
    issues.push(...syntaxIssues);
    score -= syntaxIssues.length * 5;

    // 代码风格检?    const styleIssues = this.checkCodeStyle(code);
    issues.push(...styleIssues);
    score -= styleIssues.length * 2;

    // 性能检?    const perfIssues = this.checkPerformance(code);
    issues.push(...perfIssues);
    score -= perfIssues.length * 3;

    // 安全检?    const securityIssues = this.checkSecurity(code);
    issues.push(...securityIssues);
    score -= securityIssues.length * 10;

    // 可维护性检?    const maintainabilityIssues = this.checkMaintainability(code);
    issues.push(...maintainabilityIssues);
    score -= maintainabilityIssues.length * 2;

    // 计算指标
    const metrics = this.calculateMetrics(code);

    // 生成建议
    const suggestions = this.generateSuggestions(issues, metrics);

    // 确保分数?-100范围?    score = Math.max(0, Math.min(100, score));

    return {
      score,
      issues,
      suggestions,
      metrics,
    };
  }

  /**
   * 解析模板代码
   */
  private parseTemplateCode(code: string): any {
    const result: any = {
      className: '',
      description: '',
      author: '',
      version: '',
      dependencies: [],
      methods: [],
      properties: [],
    };

    // 提取类名
    const classMatch = code.match(/class\s+(\w+)/);
    if (classMatch) {
      result.className = classMatch[1];
    }

    // 提取装饰器信?    const agentDecoratorMatch = code.match(/@Agent\(\{([\s\S]*?)\}\)/);
    if (agentDecoratorMatch) {
      const decoratorContent = agentDecoratorMatch[1];

      // 提取名称
      const nameMatch = decoratorContent.match(/name:\s*['"](.+?)['"]/);
      if (nameMatch) result.className = nameMatch[1];

      // 提取描述
      const descMatch = decoratorContent.match(/description:\s*['"](.+?)['"]/);
      if (descMatch) result.description = descMatch[1];

      // 提取版本
      const versionMatch = decoratorContent.match(/version:\s*['"](.+?)['"]/);
      if (versionMatch) result.version = versionMatch[1];
    }

    // 提取依赖
    const importMatches = code.matchAll(/import\s+.*?\s+from\s+['"](.+?)['"]/g);
    for (const match of importMatches) {
      result.dependencies.push(match[1]);
    }

    return result;
  }

  /**
   * 生成预览HTML
   */
  private generatePreviewHTML(parsedCode: any, configSchema?: any): string {
    return `
      <div class="template-preview">
        <div class="preview-header">
          <h2>${parsedCode.className}</h2>
          <p class="description">${parsedCode.description}</p>
          <div class="metadata">
            <span class="author">作? ${parsedCode.author}</span>
            <span class="version">版本: ${parsedCode.version}</span>
          </div>
        </div>

        <div class="preview-content">
          <div class="code-container">
            <pre class="code-block"><code>// 智能体类定义
class ${parsedCode.className} extends BaseAgent {
  // 构造函数和初始化逻辑
  constructor(config) {
    super(config);
    // 初始化代?  }

  // 主要处理方法
  async process(input) {
    // 处理逻辑
    return {
      content: '处理结果',
      metadata: { processed: true }
    };
  }
}</code></pre>
          </div>

          ${
            configSchema
              ? `
          <div class="config-section">
            <h3>配置选项</h3>
            <div class="config-form">
              <!-- 配置表单将根据schema动态生?-->
            </div>
          </div>
          `
              : ''
          }
        </div>

        <div class="preview-footer">
          <button class="test-btn" onclick="testTemplate()">测试模板</button>
          <button class="download-btn" onclick="downloadTemplate()">下载模板</button>
        </div>
      </div>
    `;
  }

  /**
   * 生成预览CSS
   */
  private generatePreviewCSS(): string {
    const themeColors =
      this.config.theme === 'dark'
        ? {
            bg: '#1e1e1e',
            text: '#d4d4d4',
            accent: '#569cd6',
            border: '#3c3c3c',
          }
        : {
            bg: '#ffffff',
            text: '#333333',
            accent: '#0066cc',
            border: '#e0e0e0',
          };

    return `
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        margin: 0;
        padding: 20px;
        background-color: ${themeColors.bg};
        color: ${themeColors.text};
      }

      .template-preview {
        max-width: 800px;
        margin: 0 auto;
        border: 1px solid ${themeColors.border};
        border-radius: 8px;
        overflow: hidden;
      }

      .preview-header {
        background-color: ${themeColors.accent};
        color: white;
        padding: 20px;
      }

      .preview-header h2 {
        margin: 0 0 10px 0;
        font-size: 24px;
      }

      .description {
        margin: 0 0 15px 0;
        opacity: 0.9;
      }

      .metadata {
        display: flex;
        gap: 20px;
        font-size: 14px;
        opacity: 0.8;
      }

      .preview-content {
        padding: 20px;
      }

      .code-container {
        margin-bottom: 20px;
      }

      .code-block {
        background-color: ${this.config.theme === 'dark' ? '#2d2d2d' : '#f8f8f8'};
        padding: 15px;
        border-radius: 4px;
        overflow-x: auto;
        border: 1px solid ${themeColors.border};
      }

      .code-block code {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 14px;
        line-height: 1.5;
      }

      ${
        this.config.showLineNumbers
          ? `
      .code-block {
        counter-reset: line;
      }

      .code-block code {
        display: block;
      }

      .code-block code::before {
        counter-increment: line;
        content: counter(line);
        display: inline-block;
        width: 30px;
        padding-right: 15px;
        margin-right: 15px;
        text-align: right;
        color: #888;
        border-right: 1px solid #ddd;
      }
      `
          : ''
      }

      .preview-footer {
        padding: 20px;
        background-color: ${themeColors.border};
        display: flex;
        gap: 10px;
        justify-content: center;
      }

      button {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
      }

      .test-btn {
        background-color: #10b981;
        color: white;
      }

      .download-btn {
        background-color: #3b82f6;
        color: white;
      }

      button:hover {
        opacity: 0.8;
      }
    `;
  }

  /**
   * 生成预览JavaScript
   */
  private generatePreviewJS(parsedCode: any): string {
    return `
      // 模板测试功能
      function testTemplate() {
        alert('模板测试功能 - 这里将执行模板的测试逻辑');
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('Testing template:', '${parsedCode.className}')}

      // 模板下载功能
      function downloadTemplate() {
        alert('模板下载功能 - 这里将触发模板下?);
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('Downloading template:', '${parsedCode.className}')}

      // 页面加载完成后的初始?      document.addEventListener('DOMContentLoaded', function() {
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('Template preview loaded for:', '${parsedCode.className}')});
    `;
  }

  // 质量检查方?  private checkSyntax(code: string): QualityIssue[] {
    const issues: QualityIssue[] = [];

    // 检查基本语法错?    if (!code.includes('class')) {
      issues.push({
        type: 'syntax',
        severity: 'high',
        line: 1,
        column: 1,
        message: '代码中缺少class定义',
        suggestion: '确保代码包含至少一个class定义',
      });
    }

    if (!code.includes('export')) {
      issues.push({
        type: 'syntax',
        severity: 'medium',
        line: 1,
        column: 1,
        message: '代码中缺少export语句',
        suggestion: '添加export关键字导出类或函?,
      });
    }

    return issues;
  }

  private checkCodeStyle(code: string): QualityIssue[] {
    const issues: QualityIssue[] = [];

    // 检查命名规?    const classNameMatches = code.match(/class\s+(\w+)/g) || [];
    classNameMatches.forEach(match => {
      const className = match.split(' ')[1];
      if (className && !/^[A-Z][a-zA-Z0-9]*$/.test(className)) {
        issues.push({
          type: 'style',
          severity: 'low',
          line: code.split('\n').findIndex(line => line.includes(match)) + 1,
          column: match.indexOf(className) + 1,
          message: `类名 "${className}" 不符合驼峰命名规范`,
          suggestion: '使用大驼峰命名法 (PascalCase)',
        });
      }
    });

    return issues;
  }

  private checkPerformance(code: string): QualityIssue[] {
    const issues: QualityIssue[] = [];

    // 检查潜在的性能问题
    if (code.includes('for(let i = 0; i < 1000000; i++)')) {
      issues.push({
        type: 'performance',
        severity: 'high',
        line:
          code
            .split('\n')
            .findIndex(line =>
              line.includes('for(let i = 0; i < 1000000; i++)')
            ) + 1,
        column: 1,
        message: '检测到大量循环操作，可能存在性能问题',
        suggestion: '考虑使用更高效的算法或异步处?,
      });
    }

    return issues;
  }

  private checkSecurity(code: string): QualityIssue[] {
    const issues: QualityIssue[] = [];

    // 检查安全问?    if (code.includes('eval(')) {
      const lines = code.split('\n');
      const lineIndex = lines.findIndex(line => line.includes('eval('));
      if (lineIndex !== -1) {
        issues.push({
          type: 'security',
          severity: 'critical',
          line: lineIndex + 1,
          column: lines[lineIndex].indexOf('eval(') + 1,
          message: '检测到eval函数使用，存在安全风?,
          suggestion: '避免使用eval，使用Function构造函数或其他安全替代方案',
        });
      }
    }

    return issues;
  }

  private checkMaintainability(code: string): QualityIssue[] {
    const issues: QualityIssue[] = [];

    // 检查可维护?    const lines = code.split('\n');
    if (lines.length > 500) {
      issues.push({
        type: 'maintainability',
        severity: 'medium',
        line: lines.length,
        column: 1,
        message: '文件行数过多，可能影响可维护?,
        suggestion: '考虑将代码拆分为多个模块',
      });
    }

    return issues;
  }

  private calculateMetrics(code: string): QualityMetrics {
    const lines = code.split('\n');
    const linesOfCode = lines.filter(line => line.trim().length > 0).length;

    // 简化的圈复杂度计算
    const complexityMatches =
      code.match(/(if|for|while|catch|case)\s*\(/g) || [];
    const cyclomaticComplexity = complexityMatches.length + 1;

    // 简化的注释比率计算
    const commentLines = lines.filter(
      line => line.trim().startsWith('//') || line.includes('/*')
    ).length;
    const commentRatio = linesOfCode > 0 ? commentLines / linesOfCode : 0;

    // 简化的重复率计?    const uniqueLines = new Set(lines.map(line => line.trim()));
    const duplicationRate =
      linesOfCode > 0 ? 1 - uniqueLines.size / linesOfCode : 0;

    return {
      cyclomaticComplexity,
      linesOfCode,
      commentRatio,
      duplicationRate,
    };
  }

  private generateSuggestions(
    issues: QualityIssue[],
    metrics: QualityMetrics
  ): string[] {
    const suggestions: string[] = [];

    // 基于问题生成建议
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      suggestions.push('立即修复关键安全问题');
    }

    const highIssues = issues.filter(i => i.severity === 'high');
    if (highIssues.length > 0) {
      suggestions.push('优先处理高严重性问?);
    }

    // 基于指标生成建议
    if (metrics.cyclomaticComplexity > 10) {
      suggestions.push('考虑简化复杂逻辑，降低圈复杂?);
    }

    if (metrics.commentRatio < 0.1) {
      suggestions.push('增加代码注释，提高可读?);
    }

    if (metrics.duplicationRate > 0.2) {
      suggestions.push('消除重复代码，提高代码复用?);
    }

    if (suggestions.length === 0) {
      suggestions.push('代码质量良好，继续保?);
    }

    return suggestions;
  }

  /**
   * 销毁预览器
   */
  destroy(): void {
    if (this.sandbox) {
      this.sandbox.remove();
      this.sandbox = null;
    }
  }
}
