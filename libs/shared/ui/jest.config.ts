module.exports = {
  displayName: '@messai/ui',
  preset: '../../../jest.preset.js',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['../testing/src/test-setup.ts'],
  transform: {
    '^.+\\.[tj]sx?$': [
      '@swc/jest',
      {
        jsc: {
          target: 'es2022',
          transform: {
            react: { runtime: 'automatic' },
          },
        },
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/shared/ui',
};
