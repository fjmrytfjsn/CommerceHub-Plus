// テスト環境のセットアップファイル
// @testing-library/jest-domのマッチャーを追加

import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";

// windowオブジェクトが存在しない場合のフォールバック
if (typeof window === "undefined") {
  // @ts-expect-error - テスト環境用のモック
  global.window = {};
}

// グローバルなwindowオブジェクトのモック
Object.defineProperty(window, "location", {
  value: {
    href: "http://localhost:3000",
    origin: "http://localhost:3000",
  },
  writable: true,
});

// localStorage のモック
const localStorageData: Record<string, string> = {};

Object.defineProperty(window, "localStorage", {
  value: {
    getItem: vi.fn((key: string) => localStorageData[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      localStorageData[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete localStorageData[key];
    }),
    clear: vi.fn(() => {
      Object.keys(localStorageData).forEach((key) => {
        delete localStorageData[key];
      });
    }),
  },
  writable: true,
});

// fetch API のモック
global.fetch = vi.fn();

// 環境変数のモック
Object.defineProperty(import.meta, "env", {
  value: {
    VITE_API_URL: "http://localhost:8000",
  },
  writable: true,
});

// 非同期処理のクリーンアップ
afterEach(() => {
  // すべてのタイマーをクリア
  vi.clearAllTimers();
  // すべてのモックをリセット
  vi.clearAllMocks();
  // localStorageをクリア
  Object.keys(localStorageData).forEach((key) => {
    delete localStorageData[key];
  });
});
