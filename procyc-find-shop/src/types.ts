/**
 * 类型定义
 */

export interface Shop {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  phone: string;
  services?: string[];
  openingHours?: string;
}

export interface FindShopInput {
  latitude: number;
  longitude: number;
  radius?: number; // 公里
  limit?: number;
}

export interface FindShopOutput {
  shops: Shop[];
  total: number;
  searchRadius: number;
  userLocation: {
    latitude: number;
    longitude: number;
  };
}

export interface SkillInput {
  [key: string]: any;
}

export interface SkillOutput {
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
  } | null;
  metadata: {
    executionTimeMs: number;
    timestamp: string;
    version: string;
  };
}

export interface SkillHandler {
  execute(input: SkillInput): Promise<SkillOutput>;
}

export interface SkillError extends Error {
  code?: string;
}
