import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // 临时使用 node 环境避免 ESM 问题避免 ESM 问题
    setupFiles: ['./tests/utils/setup.ts'],
    include: [
      'tests/unit/**/*.test.{ts,tsx}',
      'tests/utils/**/*.test.{ts,tsx}',
      'src/modules/**/*.test.{ts,tsx}',
    ],
    exclude: [
      'node_modules',
      '.next',
      'public',
      'coverage',
      'tests/integration/**',
      'tests/e2e/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage/vitest',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@modules': path.resolve(__dirname, './src/modules'),
      '@tech': path.resolve(__dirname, './src/tech'),
      '@auth': path.resolve(__dirname, './src/modules/auth'),
      '@repair': path.resolve(__dirname, './src/modules/repair-service'),
      '@procurement': path.resolve(__dirname, './src/modules/b2b-procurement'),
      '@admin': path.resolve(__dirname, './src/modules/admin-panel'),
      '@common': path.resolve(__dirname, './src/modules/common'),
      '@database': path.resolve(__dirname, './src/tech/database'),
      '@api': path.resolve(__dirname, './src/tech/api'),
    },
  },
});
