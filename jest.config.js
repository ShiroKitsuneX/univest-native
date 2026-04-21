module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.(js|ts|tsx)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      { presets: ['babel-preset-expo'] },
    ],
  },
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/__tests__/**'],
}
