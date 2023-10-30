/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  "setupFilesAfterEnv": ["./jest.setup.js"],
  testMatch: [
    "**/__tests__/**/*.+(test.ts)",
    "**/?(*.)+(spec|test).+(test.ts)"
  ],
  "testTimeout": 10000,

};