process.env.__NEXT_TEST_MODE = "jest";
export default {
    preset: 'ts-jest', // Use ts-jest to handle TypeScript
    testEnvironment: 'node', // Use the node environment since we're dealing with server-side logic
    roots: ['<rootDir>'],
    testMatch: ['**/__tests__/**/*.test.ts'], // Match test files with `.test.ts` extensions
    transform: {
      'next.config.mjs$': '@swc/jest', // Use babel-jest to transform `.mjs` files
    },
    modulePathIgnorePatterns: [
        '/node_modules/',         // Ignore files in node_modules for testing
        '/dist/',                 // Ignore files in dist folder from test discovery
        '/coverage/',             // Ignore files in coverage folder
      ],
      transformIgnorePatterns: [
        '/node_modules/',         // Skip transformation of files in node_modules
        '/dist/',                 // Skip transformation of files in dist
        '.*\\.test\\.js$',        // Skip transformation of files that match `.test.js` pattern
      ],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  };
  