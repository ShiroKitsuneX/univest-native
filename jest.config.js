module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', { presets: ['babel-preset-expo'] }],
  },
  collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/**/__tests__/**'],
}
