// Jest + TypeScript用設定ファイル
// カバレッジ測定機能を追加
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  roots: ["<rootDir>"],

  // カバレッジ測定の設定
  collectCoverage: false, // デフォルトでは無効（--coverageオプション使用時に有効）
  collectCoverageFrom: [
    "**/*.{ts,js}",
    "!**/*.test.{ts,js}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/generated/**",
    "!**/dist/**",
    "!**/coverage/**",
    "!jest.config.js",
  ],
  coverageDirectory: "coverage",
  coverageReporters: [
    "text", // コンソール出力
    "html", // HTMLレポート
    "lcov", // CI/CD用
    "text-summary", // サマリー出力
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
