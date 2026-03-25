import * as XLSX from 'xlsx';

/**
 * Excel/CSV 文件解析工具类
 *
 * 支持格式：
 * - .xlsx (Excel 2007+)
 * - .xls (Excel 97-2003)
 * - .csv (逗号分隔值)
 */

export interface ImportResult<T = any> {
  data: T[];
  errors: ImportError[];
  summary: ImportSummary;
}

export interface ImportError {
  row: number; // Excel 行号 (从 1 开始)
  field?: string;
  message: string;
  value?: any;
}

export interface ImportSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  successRate: number;
}

/**
 * Skill 导入数据结构
 */
export interface SkillImportData {
  name_en: string; // 英文名称 (必填)
  title: string; // 中文标题 (必填)
  description: string; // 描述
  category: string; // 分类
  version: string; // 版本号
  author_id?: string; // 作者 ID
  cover_image_url?: string; // 封面图片
  download_url?: string; // 下载地址
  tags?: string[]; // 标签数组
  [key: string]: any; // 其他字段
}

/**
 * 读取 Excel/CSV 文件并转换为 JSON
 */
export async function readExcelFile(
  file: File | Buffer,
  options?: ParseOptions
): Promise<ImportResult<SkillImportData>> {
  const errors: ImportError[] = [];
  const data: SkillImportData[] = [];

  try {
    // 读取文件
    let workbook: XLSX.WorkBook;

    if (file instanceof Buffer) {
      workbook = XLSX.read(file, { type: 'buffer' });
    } else {
      const arrayBuffer = await file.arrayBuffer();
      workbook = XLSX.read(arrayBuffer, { type: 'array' });
    }

    // 读取第一个工作表
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 转换为 JSON (第一行为表头)
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

    // 验证和转换数据
    jsonData.forEach((row, index) => {
      const rowNum = index + 2; // Excel 行号 (从 1 开始，+2 因为跳过了表头)

      // 字段验证
      const validationErrors = validateSkillRow(row, rowNum);

      if (validationErrors.length > 0) {
        errors.push(...validationErrors);
      } else {
        // 数据转换
        const skillData = transformSkillRow(row);
        data.push(skillData);
      }
    });

    // 生成摘要
    const summary: ImportSummary = {
      totalRows: jsonData.length,
      validRows: data.length,
      invalidRows: errors.length,
      successRate: data.length / jsonData.length,
    };

    return { data, errors, summary };
  } catch (error) {
    throw new Error(
      `Excel 解析失败：${error instanceof Error ? error.message : '未知错误'}`
    );
  }
}

/**
 * 解析选项
 */
export interface ParseOptions {
  skipHeader?: boolean;
  trimValues?: boolean;
  encoding?: string;
}

/**
 * 验证单个 Skill 数据行
 */
function validateSkillRow(row: any, rowNum: number): ImportError[] {
  const errors: ImportError[] = [];

  // 必填字段检查
  if (!row.name_en || !row.name_en.trim()) {
    errors.push({
      row: rowNum,
      field: 'name_en',
      message: '英文名称为必填项',
      value: row.name_en,
    });
  }

  if (!row.title || !row.title.trim()) {
    errors.push({
      row: rowNum,
      field: 'title',
      message: '中文标题为必填项',
      value: row.title,
    });
  }

  // 英文名称格式验证 (只能包含字母、数字、下划线、连字符)
  if (row.name_en && !/^[a-zA-Z0-9_-]+$/.test(row.name_en)) {
    errors.push({
      row: rowNum,
      field: 'name_en',
      message: '英文名称只能包含字母、数字、下划线和连字符',
      value: row.name_en,
    });
  }

  // 分类验证
  const validCategories = [
    'AI',
    '数据分析',
    '营销',
    '财务',
    '人力资源',
    '运营',
    '开发',
    '设计',
  ];
  if (row.category && !validCategories.includes(row.category)) {
    errors.push({
      row: rowNum,
      field: 'category',
      message: `分类必须是以下之一：${validCategories.join(', ')}`,
      value: row.category,
    });
  }

  // 版本号格式验证
  if (row.version && !/^\d+\.\d+\.\d+$/.test(row.version)) {
    errors.push({
      row: rowNum,
      field: 'version',
      message: '版本号格式应为 x.y.z (如 1.0.0)',
      value: row.version,
    });
  }

  // URL 格式验证
  const urlFields = ['cover_image_url', 'download_url'];
  for (const field of urlFields) {
    if (row[field]) {
      try {
        new URL(row[field]);
      } catch {
        errors.push({
          row: rowNum,
          field,
          message: 'URL 格式不正确',
          value: row[field],
        });
      }
    }
  }

  return errors;
}

/**
 * 转换 Skill 数据行
 */
function transformSkillRow(row: any): SkillImportData {
  // 处理标签 (支持逗号分隔的字符串或数组)
  let tags: string[] | undefined;
  if (typeof row.tags === 'string') {
    tags = row.tags
      .split(',')
      .map((tag: string) => tag.trim())
      .filter(Boolean);
  } else if (Array.isArray(row.tags)) {
    tags = row.tags;
  }

  return {
    name_en: row.name_en?.trim(),
    title: row.title?.trim(),
    description: row.description?.trim() || '',
    category: row.category || '其他',
    version: row.version || '1.0.0',
    author_id: row.author_id,
    cover_image_url: row.cover_image_url,
    download_url: row.download_url,
    tags,
  };
}

/**
 * 将数据导出为 Excel 文件
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string,
  options?: ExportOptions
): Buffer {
  const {
    sheetName = 'Sheet1',
    includeHeader = true,
    columnOrder,
  } = options || {};

  // 准备数据
  let exportData: any[];

  if (includeHeader) {
    // 提取表头
    const headers = extractHeaders(data, columnOrder);
    exportData = [headers, ...data.map(row => formatRow(row, columnOrder))];
  } else {
    exportData = data.map(row => formatRow(row, columnOrder));
  }

  // 创建工作簿
  const worksheet = XLSX.utils.json_to_sheet(exportData, { skipHeader: true });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // 生成 Buffer
  const buffer = XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx',
  }) as Buffer;

  return buffer;
}

/**
 * 将数据导出为 CSV 文件
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  options?: ExportOptions
): string {
  const { includeHeader = true, columnOrder } = options || {};

  // 提取表头
  const headers = extractHeaders(data, columnOrder);

  // 生成 CSV 内容
  const csvRows: string[] = [];

  if (includeHeader) {
    csvRows.push(headers.join(','));
  }

  // 添加数据行
  for (const row of data) {
    const formattedRow = formatRow(row, columnOrder);
    const csvRow = Object.values(formattedRow)
      .map(cell => escapeCSV(String(cell)))
      .join(',');
    csvRows.push(csvRow);
  }

  return csvRows.join('\n');
}

/**
 * 导出选项
 */
export interface ExportOptions {
  sheetName?: string;
  includeHeader?: boolean;
  columnOrder?: string[]; // 自定义列顺序
}

/**
 * 提取表头
 */
function extractHeaders(data: any[], columnOrder?: string[]): string[] {
  if (columnOrder) {
    return columnOrder;
  }

  // 自动提取所有字段
  const allKeys = new Set<string>();
  data.forEach(row => {
    Object.keys(row).forEach(key => allKeys.add(key));
  });

  return Array.from(allKeys);
}

/**
 * 格式化行数据
 */
function formatRow(row: any, columnOrder?: string[]): Record<string, any> {
  if (columnOrder) {
    const formatted: Record<string, any> = {};
    columnOrder.forEach(key => {
      formatted[key] = row[key] !== undefined ? row[key] : '';
    });
    return formatted;
  }

  return row;
}

/**
 * CSV 转义
 */
function escapeCSV(value: string): string {
  // 如果包含逗号、引号或换行，需要用引号包裹
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * 下载文件 (浏览器端)
 */
export function downloadFile(
  content: Buffer | string,
  filename: string,
  mimeType: string
): void {
  if (typeof window === 'undefined') {
    throw new Error('downloadFile 只能在浏览器环境中使用');
  }

  const blob =
    content instanceof Buffer
      ? new Blob([content], { type: mimeType })
      : new Blob([content], { type: mimeType });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 批量导入 Skills 示例
 */
export async function importSkillsFromExcel(
  file: File | Buffer
): Promise<ImportResult<SkillImportData>> {
  const result = await readExcelFile(file);

  // 可以在这里添加数据库插入逻辑
  // for (const skill of result.data) {
  //   await insertSkill(skill);
  // }

  return result;
}
