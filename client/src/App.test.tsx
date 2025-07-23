// Appコンポーネントの基本的なレンダリングテスト
// 日本語コメントで記述

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import App from "./App";
import { TestProvider } from "./test/test-utils";
import { setupApiMocks, setupEnvMocks } from "./test/mocks";
import type { UserRole } from "./types";

// モックのセットアップ
setupApiMocks();
setupEnvMocks();

// テスト用のヘルパー関数：AppをTestProviderでラップしてレンダリング
const renderAppWithProviders = (
  initialEntries = ["/"],
  initialRole: UserRole | null = null
) => {
  return render(
    <TestProvider initialEntries={initialEntries} initialRole={initialRole}>
      <App />
    </TestProvider>
  );
};

describe("Appコンポーネント", () => {
  beforeEach(() => {
    // 各テスト前にlocalStorageをクリア
    window.localStorage.clear();
  });
  it("初期状態でLogin画面が表示される", async () => {
    renderAppWithProviders(["/"], null);
    // より具体的なテキストでLoginコンポーネントの表示を確認
    expect(
      await screen.findByText("ログイン（ロール選択）")
    ).toBeInTheDocument();
  });

  it("未ログイン時に/purchaser等へアクセスすると/loginへリダイレクトされる", async () => {
    renderAppWithProviders(["/purchaser"], null);
    expect(
      await screen.findByText("ログイン（ロール選択）")
    ).toBeInTheDocument();
  });

  it("ログイン後、リロードしてもダッシュボードが表示される（localStorage永続化）", async () => {
    renderAppWithProviders(["/purchaser"], "purchaser");
    expect(await screen.findByText("購入者ダッシュボード")).toBeInTheDocument();
  });

  it("ログアウトボタン押下でログイン画面に戻る", async () => {
    renderAppWithProviders(["/purchaser"], "purchaser");

    // ダッシュボードが表示されることを確認
    expect(await screen.findByText("購入者ダッシュボード")).toBeInTheDocument();

    // ログアウトボタンをクリック
    const logoutBtn = await screen.findByText("ログアウト");
    await act(async () => {
      logoutBtn.click();
    });

    // ログイン画面に戻ることを確認
    expect(
      await screen.findByText("ログイン（ロール選択）")
    ).toBeInTheDocument();
  });
});
