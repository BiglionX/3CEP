import { vi } from 'vitest';

// 测试辅助函数

export const mockFetch = (response: any = {}, status = 200) => {
  const mockResponse = {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(response),
    text: vi.fn().mockResolvedValue(JSON.stringify(response)),
    blob: vi.fn().mockResolvedValue(new Blob()),
  };

  global.fetch = vi.fn().mockResolvedValue(mockResponse);
  return mockResponse;
};

export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    store,
  };
};

export const waitFor = async (callback: () => boolean, timeout = 1000) => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (callback()) return;
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  throw new Error('waitFor timed out');
};

// Mock IntersectionObserver
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  });

  window.IntersectionObserver = mockIntersectionObserver;
  return mockIntersectionObserver;
};
