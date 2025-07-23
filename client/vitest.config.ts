// Vitest 設定ファイル（jsdom環境指定）
// カバレッジ測定機能を追加
// 日本語コメントで記述

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],

    // カバレッジ測定の設定
    coverage: {
      provider: "v8",
      reporter: [
        "text", // コンソール出力
        "html", // HTMLレポート
        "lcov", // CI/CD用
        "text-summary", // サマリー出力
      ],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,tsx,js,jsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx,js,jsx}",
        "src/**/*.spec.{ts,tsx,js,jsx}",
        "src/**/test/**",
        "src/**/*.d.ts",
        "src/vite-env.d.ts",
        "src/main.tsx", // エントリーポイントは除外
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
