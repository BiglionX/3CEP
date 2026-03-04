/**
 * FixCycle Agent SDK 安全审核系统
 * 提供插件代码安全扫描和风险评估功? */

import { readFileSync } from 'fs';
import { extname } from 'path';

// 安全规则类型
export interface SecurityRule {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  pattern: RegExp | ((content: string) => boolean);
  category: 'filesystem' | 'network' | 'crypto' | 'process' | 'dangerous';
  recommendation: string;
}

// 安全扫描配置
export interface SecurityConfig {
  rules: SecurityRule[];
  maxFileSize: number; // 字节
  allowedExtensions: string[];
  timeout: number; // 毫秒
}

// 扫描结果详情
export interface ScanFinding {
  ruleId: string;
  ruleName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  filePath: string;
  lineNumber?: number;
  codeSnippet: string;
  description: string;
  recommendation: string;
}

// 完整扫描报告
export interface SecurityScanReport {
  pluginId: string;
  passed: boolean;
  overallScore: number; // 0-100
  findings: ScanFinding[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  recommendations: string[];
  scannedAt: Date;
  scannedFiles: number;
  totalTime: number; // 毫秒
}

export class SecurityScanner {
  private config: SecurityConfig;
  private defaultRules: SecurityRule[];

  constructor(config?: Partial<SecurityConfig>) {
    this.config = {
      rules: [],
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedExtensions: ['.js', '.ts', '.json'],
      timeout: 30000, // 30�?      ...config,
    };

    this.defaultRules = this.getDefaultRules();
    this.config.rules = [...this.defaultRules, ...this.config.rules];
  }

  /**
   * 扫描插件目录
   */
  async scanPlugin(pluginPath: string): Promise<SecurityScanReport> {
    const startTime = Date.now();
    const findings: ScanFinding[] = [];
    let scannedFiles = 0;

    try {
      // 递归扫描目录
      const files = this.scanDirectory(pluginPath);

      for (const file of files) {
        if (scannedFiles >= 1000) break; // 限制扫描文件数量

        const result = await this.scanFile(file, pluginPath);
        findings.push(...result);
        scannedFiles++;
      }

      // 生成报告
      const report = this.generateReport(
        findings,
        pluginPath,
        Date.now() - startTime,
        scannedFiles
      );
      return report;
    } catch (error) {
      return {
        pluginId: this.extractPluginId(pluginPath),
        passed: false,
        overallScore: 0,
        findings: [
          {
            ruleId: 'scan_error',
            ruleName: '扫描错误',
            severity: 'critical',
            filePath: 'N/A',
            codeSnippet: '',
            description: `扫描过程中发生错? ${(error as Error).message}`,
            recommendation: '请检查插件文件结构和权限',
          },
        ],
        summary: { critical: 1, high: 0, medium: 0, low: 0, total: 1 },
        recommendations: ['修复扫描错误后重新提?],
        scannedAt: new Date(),
        scannedFiles,
        totalTime: Date.now() - startTime,
      };
    }
  }

  /**
   * 扫描单个文件
   */
  private async scanFile(
    filePath: string,
    basePath: string
  ): Promise<ScanFinding[]> {
    const findings: ScanFinding[] = [];

    try {
      // 检查文件大?      const stats = { size: 0 }; // 简化实?      if (stats.size > this.config.maxFileSize) {
        findings.push({
          ruleId: 'file_size_limit',
          ruleName: '文件大小超限',
          severity: 'medium',
          filePath: this.getRelativePath(filePath, basePath),
          codeSnippet: '',
          description: `文件大小 ${stats.size} 字节超过限制 ${this.config.maxFileSize} 字节`,
          recommendation: '优化代码或分割大文件',
        });
        return findings;
      }

      // 检查文件扩展名
      const ext = extname(filePath).toLowerCase();
      if (!this.config.allowedExtensions.includes(ext)) {
        return findings; // 跳过不允许的文件类型
      }

      // 读取文件内容
      const content = readFileSync(filePath, 'utf8');

      // 应用所有规?      for (const rule of this.config.rules) {
        const ruleFindings = this.applyRule(rule, content, filePath, basePath);
        findings.push(...ruleFindings);
      }
    } catch (error) {
      findings.push({
        ruleId: 'file_read_error',
        ruleName: '文件读取错误',
        severity: 'high',
        filePath: this.getRelativePath(filePath, basePath),
        codeSnippet: '',
        description: `无法读取文件: ${(error as Error).message}`,
        recommendation: '检查文件权限和编码格式',
      });
    }

    return findings;
  }

  /**
   * 应用单个安全规则
   */
  private applyRule(
    rule: SecurityRule,
    content: string,
    filePath: string,
    basePath: string
  ): ScanFinding[] {
    const findings: ScanFinding[] = [];
    const relativePath = this.getRelativePath(filePath, basePath);

    // 检查是否匹配规则模?    let matches: RegExpExecArray[] | boolean = false;

    if (rule.pattern instanceof RegExp) {
      matches = [...content.matchAll(new RegExp(rule.pattern, 'g'))];
    } else if (typeof rule.pattern === 'function') {
      matches = rule.pattern(content);
    }

    if (
      matches &&
      (Array.isArray(matches) ? matches.length > 0 : matches === true)
    ) {
      if (Array.isArray(matches)) {
        // 处理正则表达式匹配结?        for (const match of matches) {
          const lineNumber = this.getLineNumber(content, match.index || 0);
          const codeSnippet = this.getCodeSnippet(content, match.index || 0);

          findings.push({
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            filePath: relativePath,
            lineNumber,
            codeSnippet,
            description: rule.description,
            recommendation: rule.recommendation,
          });
        }
      } else {
        // 处理函数返回 true 的情?        findings.push({
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          filePath: relativePath,
          codeSnippet: content.substring(0, 100) + '...',
          description: rule.description,
          recommendation: rule.recommendation,
        });
      }
    }

    return findings;
  }

  /**
   * 递归扫描目录
   */
  private scanDirectory(_dirPath: string, files: string[] = []): string[] {
    // 简化实现，实际应该使用 fs.readdir
    return files;
  }

  /**
   * 生成扫描报告
   */
  private generateReport(
    findings: ScanFinding[],
    pluginPath: string,
    totalTime: number,
    scannedFiles: number
  ): SecurityScanReport {
    // 统计各类严重程度的问题数?    const summary = {
      critical: findings.filter(f => f.severity === 'critical').length,
      high: findings.filter(f => f.severity === 'high').length,
      medium: findings.filter(f => f.severity === 'medium').length,
      low: findings.filter(f => f.severity === 'low').length,
      total: findings.length,
    };

    // 计算总体分数 (满分100�?
    let score = 100;
    score -= summary.critical * 25;
    score -= summary.high * 15;
    score -= summary.medium * 8;
    score -= summary.low * 3;
    score = Math.max(0, score);

    // 生成建议
    const recommendations = this.generateRecommendations(findings);

    return {
      pluginId: this.extractPluginId(pluginPath),
      passed: score >= 70,
      overallScore: score,
      findings,
      summary,
      recommendations,
      scannedAt: new Date(),
      scannedFiles,
      totalTime,
    };
  }

  /**
   * 生成修复建议
   */
  private generateRecommendations(findings: ScanFinding[]): string[] {
    const recommendations: string[] = [];
    const seenRules = new Set<string>();

    for (const finding of findings) {
      if (!seenRules.has(finding.ruleId)) {
        recommendations.push(finding.recommendation);
        seenRules.add(finding.ruleId);
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('代码安全性良好，未发现明显风?);
    }

    return recommendations;
  }

  /**
   * 获取默认安全规则
   */
  private getDefaultRules(): SecurityRule[] {
    return [
      // 文件系统访问
      {
        id: 'fs_access_1',
        name: '危险文件系统操作',
        description: '检测对敏感文件系统的直接访?,
        severity: 'high',
        pattern: /require\(["']fs["']\)|import\s+["']fs["']/,
        category: 'filesystem',
        recommendation: '使用安全的文件操作API或沙箱环?,
      },
      {
        id: 'fs_access_2',
        name: '路径遍历攻击',
        description: '检测可能的路径遍历漏洞',
        severity: 'critical',
        pattern: /\.\.[\/\\]/,
        category: 'filesystem',
        recommendation: '验证和规范化所有文件路?,
      },

      // 网络访问
      {
        id: 'net_access_1',
        name: '未经批准的网络请?,
        description: '检测未声明的网络访问行?,
        severity: 'medium',
        pattern: /(fetch|axios|http\.|https\.)/,
        category: 'network',
        recommendation: '明确声明网络权限并在受控环境中执?,
      },

      // 危险函数
      {
        id: 'dangerous_func_1',
        name: '代码执行风险',
        description: '检测eval等动态代码执行函?,
        severity: 'critical',
        pattern: /(eval|new Function|setTimeout|setInterval)\s*\(/,
        category: 'dangerous',
        recommendation: '避免使用动态代码执行，使用安全的替代方?,
      },
      {
        id: 'dangerous_func_2',
        name: '原型污染风险',
        description: '检测可能导致原型污染的操作',
        severity: 'high',
        pattern: /(__proto__|constructor\.prototype)/,
        category: 'dangerous',
        recommendation: '避免直接操作对象原型，使用Object.create(null)',
      },

      // 加密相关
      {
        id: 'crypto_weak_1',
        name: '弱加密算?,
        description: '检测使用不安全的加密算?,
        severity: 'high',
        pattern: /(md5|sha1)(?!\s*\()/i,
        category: 'crypto',
        recommendation: '使用现代加密算法如SHA-256或更高版?,
      },
    ];
  }

  // 辅助方法
  private getRelativePath(fullPath: string, basePath: string): string {
    return fullPath.replace(basePath, '').replace(/^[\/\\]+/, '');
  }

  private getLineNumber(content: string, index: number): number {
    return content.substring(0, index).split('\n').length;
  }

  private getCodeSnippet(
    content: string,
    index: number,
    contextLines: number = 2
  ): string {
    const lines = content.split('\n');
    const lineNumber = this.getLineNumber(content, index);
    const start = Math.max(0, lineNumber - contextLines - 1);
    const end = Math.min(lines.length, lineNumber + contextLines);

    return lines.slice(start, end).join('\n');
  }

  private extractPluginId(pluginPath: string): string {
    return pluginPath.split(/[\/\\]/).pop() || 'unknown-plugin';
  }
}

