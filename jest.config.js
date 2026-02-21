module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.node.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  
  // 覆盖率配置
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/**/node_modules/**',
    '!src/setupTests.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json', 'clover'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // 报告器配置
  // reporters: [
  //   'default',
  //   ['jest-junit', {
  //     outputDirectory: 'test-results',
  //     outputName: 'jest-junit.xml',
  //     classNameTemplate: '{classname}-{title}',
  //     titleTemplate: '{classname}-{title}',
  //     ancestorSeparator: ' › ',
  //     usePathForSuiteName: 'true'
  //   }]
  // ],
  
  // 测试路径配置
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ]
};