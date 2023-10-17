/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    "**/__tests__/**/*.+(test.ts)",
    "**/?(*.)+(spec|test).+(test.ts)"
  ],
  "testTimeout": 10000 
};