/**
 * B2B 采购代理系统类型定义
 */

// 输入类型枚举
export enum ProcurementInputType {
  TEXT = "text",
  IMAGE = "image",
  VOICE = "voice",
  DOCUMENT = "document",
}

// 输入类型中文映射
export const PROCUREMENT_INPUT_TYPE_LABELS = {
  [ProcurementInputType.TEXT]: "文本",
  [ProcurementInputType.IMAGE]: "图片",
  [ProcurementInputType.VOICE]: "语音",
  [ProcurementInputType.DOCUMENT]: "文档",
} as const;

// 原始采购请求接口
export interface RawProcurementRequest {
  id: string;
  companyId: string;
  requesterId: string;
  rawDescription: string;
  input: string; // 新增：输入内容
  inputType: ProcurementInputType; // 新增：输入类型
  createdAt: Date;
  updatedAt: Date;
}

// 解析后的采购需求接口
export interface ParsedProcurementRequirement {
  requestId: string;
  items: ProcurementItem[];
  budget?: number;
  deadline?: Date;
  priority: "low" | "medium" | "high";
  deliveryAddress?: string;
  specialRequirements?: string[];
}

// 采购商品项接口
export interface ProcurementItem {
  productId?: string;
  productName: string;
  quantity: number;
  unit: string;
  specifications?: Record<string, any>;
  estimatedPrice?: number;
}

// 大模型解析结果接口
export interface ModelParsingResult {
  success: boolean;
  parsedData?: ParsedProcurementRequirement;
  confidence: number;
  warnings?: string[];
  errors?: string[];
}
