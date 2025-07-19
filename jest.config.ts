import type { Config } from 'jest';
import { getJestProjectsAsync } from '@nx/jest';

export default async (): Promise<Config> => ({
  projects: await getJestProjectsAsync(),

  // Global coverage settings
  collectCoverage: process.env.CI === 'true' || process.env.COVERAGE === 'true',
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'html', 'lcov', 'json', 'cobertura'],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Per-file thresholds for critical files
    './apps/web/src/stores/*.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './apps/web/src/lib/*.ts': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },

  // Files to collect coverage from
  collectCoverageFrom: [
    'apps/**/*.{ts,tsx}',
    'libs/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.stories.{ts,tsx}',
    '!**/*.spec.{ts,tsx}',
    '!**/*.test.{ts,tsx}',
    '!**/__tests__/**',
    '!**/__mocks__/**',
    '!**/test-utils/**',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/jest.config.{js,ts}',
    '!**/jest.preset.{js,ts}',
    '!**/next.config.{js,ts}',
    '!**/next-env.d.ts',
    '!**/postcss.config.{js,ts}',
    '!**/tailwind.config.{js,ts}',
    '!**/tsconfig.json',
    '!**/project.json',
  ],

  // Files to exclude from coverage
  coveragePathIgnorePatterns: [
    'node_modules',
    'dist',
    'build',
    '.next',
    'coverage',
    '\\.spec\\.',
    '\\.test\\.',
    'jest.config',
    'jest.preset',
    '\\.d\\.ts$',
    'test-setup',
    'middleware.ts',
    'generated/',
  ],
});
