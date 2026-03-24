/**
 * JSON Diff 工具
 *
 * 比较两个 JSON 对象的差异，生成可视化对比结果
 */

export interface DiffResult {
  path: string;
  type: 'added' | 'removed' | 'modified';
  oldValue?: any;
  newValue?: any;
}

export interface ComparisonResult {
  hasChanges: boolean;
  diffCount: number;
  diffs: DiffResult[];
  summary: {
    added: number;
    removed: number;
    modified: number;
  };
}

/**
 * JSON Diff 工具类
 */
export class JsonDiffUtil {
  /**
   * 比较两个对象并返回差异
   */
  static compare(oldObj: any, newObj: any, path: string = ''): DiffResult[] {
    const diffs: DiffResult[] = [];

    // 如果类型不同，直接标记为修改
    if (typeof oldObj !== typeof newObj) {
      diffs.push({
        path: path || 'root',
        type: 'modified',
        oldValue: oldObj,
        newValue: newObj,
      });
      return diffs;
    }

    // 如果是基本类型，直接比较值
    if (typeof oldObj !== 'object' || oldObj === null || newObj === null) {
      if (oldObj !== newObj) {
        diffs.push({
          path: path || 'root',
          type: 'modified',
          oldValue: oldObj,
          newValue: newObj,
        });
      }
      return diffs;
    }

    // 如果是数组
    if (Array.isArray(oldObj) && Array.isArray(newObj)) {
      if (oldObj.length !== newObj.length) {
        diffs.push({
          path: path || 'root',
          type: 'modified',
          oldValue: oldObj,
          newValue: newObj,
        });
        return diffs;
      }

      for (let i = 0; i < oldObj.length; i++) {
        const itemDiffs = this.compare(oldObj[i], newObj[i], `${path}[${i}]`);
        diffs.push(...itemDiffs);
      }
      return diffs;
    }

    // 如果是对象
    const allKeys = new Set([
      ...Object.keys(oldObj || {}),
      ...Object.keys(newObj || {}),
    ]);

    for (const key of allKeys) {
      const currentPath = path ? `${path}.${key}` : key;

      if (!(key in oldObj)) {
        // 新增字段
        diffs.push({
          path: currentPath,
          type: 'added',
          newValue: newObj[key],
        });
      } else if (!(key in newObj)) {
        // 删除字段
        diffs.push({
          path: currentPath,
          type: 'removed',
          oldValue: oldObj[key],
        });
      } else {
        // 递归比较
        const nestedDiffs = this.compare(oldObj[key], newObj[key], currentPath);
        diffs.push(...nestedDiffs);
      }
    }

    return diffs;
  }

  /**
   * 生成完整的对比报告
   */
  static generateReport(oldConfig: any, newConfig: any): ComparisonResult {
    const diffs = this.compare(oldConfig, newConfig);

    const summary = {
      added: diffs.filter(d => d.type === 'added').length,
      removed: diffs.filter(d => d.type === 'removed').length,
      modified: diffs.filter(d => d.type === 'modified').length,
    };

    return {
      hasChanges: diffs.length > 0,
      diffCount: diffs.length,
      diffs,
      summary,
    };
  }

  /**
   * 格式化为可读文本
   */
  static formatDiff(diff: DiffResult): string {
    const typeLabels = {
      added: '+',
      removed: '-',
      modified: '~',
    };

    const typeLabel = typeLabels[diff.type];
    let valueStr = '';

    if (diff.type === 'added') {
      valueStr = JSON.stringify(diff.newValue, null, 2);
    } else if (diff.type === 'removed') {
      valueStr = JSON.stringify(diff.oldValue, null, 2);
    } else {
      valueStr = `${JSON.stringify(diff.oldValue, null, 2)} → ${JSON.stringify(diff.newValue, null, 2)}`;
    }

    return `${typeLabel} ${diff.path}: ${valueStr}`;
  }

  /**
   * 生成格式化文本报告
   */
  static formatTextReport(oldConfig: any, newConfig: any): string {
    const result = this.generateReport(oldConfig, newConfig);

    if (!result.hasChanges) {
      return '✅ 没有发现任何变化';
    }

    let report = `📊 配置变更报告\n`;
    report += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    report += `共发现 ${result.diffCount} 处变化:\n`;
    report += `  + 新增：${result.summary.added}\n`;
    report += `  - 删除：${result.summary.removed}\n`;
    report += `  ~ 修改：${result.summary.modified}\n`;
    report += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // 按类型分组显示
    const added = result.diffs.filter(d => d.type === 'added');
    const removed = result.diffs.filter(d => d.type === 'removed');
    const modified = result.diffs.filter(d => d.type === 'modified');

    if (added.length > 0) {
      report += `【新增字段】\n`;
      added.forEach(d => {
        report += `  + ${d.path}: ${JSON.stringify(d.newValue)}\n`;
      });
      report += `\n`;
    }

    if (removed.length > 0) {
      report += `【删除字段】\n`;
      removed.forEach(d => {
        report += `  - ${d.path}: ${JSON.stringify(d.oldValue)}\n`;
      });
      report += `\n`;
    }

    if (modified.length > 0) {
      report += `【修改字段】\n`;
      modified.forEach(d => {
        report += `  ~ ${d.path}\n`;
        report += `    旧值：${JSON.stringify(d.oldValue)}\n`;
        report += `    新值：${JSON.stringify(d.newValue)}\n`;
      });
      report += `\n`;
    }

    return report;
  }
}
