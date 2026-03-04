// Vitest 测试环境设置
import { vi } from 'vitest';
// import '@testing-library/jest-dom'; // 暂时注释，等待 ESM 兼容

// 设置全局超时
vi.setConfig({
  testTimeout: 10000,
});

// Mock window.matchMedia (仅在浏览器环境中)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}
