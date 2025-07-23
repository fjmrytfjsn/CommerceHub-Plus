// プロジェクト全体のVitest設定
// clientディレクトリのテストのみを実行

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["client/src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["server/**/*"],
  },
});
