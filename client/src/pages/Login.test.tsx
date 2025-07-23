// Loginコンポーネントの基本テスト
// 日本語コメントで記述
// 新しいアーキテクチャではonLoginプロパティは不要（AuthContextを使用）

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "./Login";
import { TestProvider } from "../test/test-utils";

// fetchのモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

// テスト用のヘルパー関数
const renderLogin = () => {
  return render(
    <TestProvider initialRole={null}>
      <Login />
    </TestProvider>
  );
};

describe("Loginコンポーネント", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("初期表示でロール選択とログインボタンが表示される", () => {
    renderLogin();
    expect(screen.getByText(/ログイン/)).toBeInTheDocument();
    expect(screen.getByLabelText(/ロール/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /ログイン/ })
    ).toBeInTheDocument();
  });

  it("購入者ロールの場合はパスワード入力フィールドが表示されない", () => {
    renderLogin();
    
    // デフォルトで購入者が選択されている
    expect(screen.queryByLabelText(/パスワード/)).not.toBeInTheDocument();
    expect(screen.getByText(/購入者としてログインします（パスワード不要）/)).toBeInTheDocument();
  });

  it("職員ロール（注文受付係）を選択するとパスワード入力フィールドが表示される", async () => {
    renderLogin();

    // ロールセレクトを開く
    const roleSelect = screen.getByRole("combobox");
    fireEvent.mouseDown(roleSelect);

    // 注文受付係を選択
    const ordertakerOption = screen.getByText("注文受付係");
    fireEvent.click(ordertakerOption);

    // パスワード入力フィールドが表示される
    await waitFor(() => {
      expect(screen.getByLabelText(/パスワード/)).toBeInTheDocument();
    });

    // 購入者用のメッセージは表示されない
    expect(screen.queryByText(/購入者としてログインします/)).not.toBeInTheDocument();
  });

  it("購入者でログインボタンを押すとパスワード認証なしでログインできる", async () => {
    renderLogin();

    // ログインボタンをクリック
    const loginButton = screen.getByRole("button", { name: /ログイン/ });
    fireEvent.click(loginButton);

    // fetchが呼ばれないことを確認
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("職員ロールでパスワードを入力せずにログインボタンを押すとエラーが表示される", async () => {
    renderLogin();

    // 注文受付係を選択
    const roleSelect = screen.getByRole("combobox");
    fireEvent.mouseDown(roleSelect);
    const ordertakerOption = screen.getByText("注文受付係");
    fireEvent.click(ordertakerOption);

    await waitFor(() => {
      expect(screen.getByLabelText(/パスワード/)).toBeInTheDocument();
    });

    // パスワードなしでログインボタンをクリック
    const loginButton = screen.getByRole("button", { name: /ログイン/ });
    fireEvent.click(loginButton);

    // エラーメッセージが表示される
    await waitFor(() => {
      expect(screen.getByText(/パスワードを入力してください/)).toBeInTheDocument();
    });
  });

  it("職員ロールで正しいパスワードを入力してログインが成功する", async () => {
    // 成功レスポンスをモック
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        status: "success",
        message: "認証に成功しました。",
        role: "ordertaker"
      })
    });

    renderLogin();

    // 注文受付係を選択
    const roleSelect = screen.getByRole("combobox");
    fireEvent.mouseDown(roleSelect);
    const ordertakerOption = screen.getByText("注文受付係");
    fireEvent.click(ordertakerOption);

    await waitFor(() => {
      expect(screen.getByLabelText(/パスワード/)).toBeInTheDocument();
    });

    // パスワードを入力
    const passwordInput = screen.getByLabelText(/パスワード/);
    fireEvent.change(passwordInput, { target: { value: "ordertaker123" } });

    // ログインボタンをクリック
    const loginButton = screen.getByRole("button", { name: /ログイン/ });
    fireEvent.click(loginButton);

    // 認証APIが呼ばれる
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "ordertaker",
          password: "ordertaker123"
        })
      });
    });
  });

  it("職員ロールで間違ったパスワードを入力するとエラーが表示される", async () => {
    // 失敗レスポンスをモック
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        status: "failure",
        message: "パスワードが正しくありません。"
      })
    });

    renderLogin();

    // 注文受付係を選択
    const roleSelect = screen.getByRole("combobox");
    fireEvent.mouseDown(roleSelect);
    const ordertakerOption = screen.getByText("注文受付係");
    fireEvent.click(ordertakerOption);

    await waitFor(() => {
      expect(screen.getByLabelText(/パスワード/)).toBeInTheDocument();
    });

    // 間違ったパスワードを入力
    const passwordInput = screen.getByLabelText(/パスワード/);
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });

    // ログインボタンをクリック
    const loginButton = screen.getByRole("button", { name: /ログイン/ });
    fireEvent.click(loginButton);

    // エラーメッセージが表示される
    await waitFor(() => {
      expect(screen.getByText(/パスワードが正しくありません/)).toBeInTheDocument();
    });
  });

  it("ロールを変更するとパスワードとエラーがクリアされる", async () => {
    renderLogin();

    // 注文受付係を選択してパスワードを入力
    const roleSelect = screen.getByRole("combobox");
    fireEvent.mouseDown(roleSelect);
    const ordertakerOption = screen.getByText("注文受付係");
    fireEvent.click(ordertakerOption);

    await waitFor(() => {
      expect(screen.getByLabelText(/パスワード/)).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText(/パスワード/);
    fireEvent.change(passwordInput, { target: { value: "somepassword" } });

    // エラーを表示させる
    const loginButton = screen.getByRole("button", { name: /ログイン/ });
    fireEvent.click(loginButton);

    // 購入者に変更
    fireEvent.mouseDown(roleSelect);
    const purchaserOption = screen.getByText("購入者");
    fireEvent.click(purchaserOption);

    // パスワードフィールドが非表示になり、エラーもクリアされる
    await waitFor(() => {
      expect(screen.queryByLabelText(/パスワード/)).not.toBeInTheDocument();
      expect(screen.queryByText(/パスワードを入力してください/)).not.toBeInTheDocument();
    });
  });
});
