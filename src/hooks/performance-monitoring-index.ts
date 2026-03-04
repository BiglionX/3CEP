/**
 * 前端性能监控系统入口文件
 * 导出所有相关的Hook和类型定? */

// 核心Hook
export {
  usePerformanceMonitoring,
  useWebVitals,
  useApiPerformance,
  usePageLoadPerformance,
} from './use-performance-monitoring';

// 类型定义
export type {
  PerformanceMetric,
  PerformanceMetricType,
  PerformanceConfig,
  WebVitalsMetrics,
} from './use-performance-monitoring';
