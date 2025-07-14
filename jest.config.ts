import type { Config } from 'jest';
import { getJestProjectsAsync } from '@nx/jest';

export default async (): Promise<Config> => ({
  projects: await getJestProjectsAsync(),

  // Global coverage settings
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'html', 'lcov', 'json'],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

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
  ],
});
