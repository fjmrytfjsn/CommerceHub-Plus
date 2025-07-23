import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { AuthProvider } from "./AuthProvider";
import { useAuth } from "../hooks/useAuth";

// テスト用のコンポーネント
function TestComponent() {
  const { role, setRole, logout, isAuthenticated } = useAuth();

  return (
    <div>
      <div data-testid="role">{role || "未ログイン"}</div>
      <div data-testid="authenticated">
        {isAuthenticated ? "認証済み" : "未認証"}
      </div>
      <button data-testid="set-purchaser" onClick={() => setRole("purchaser")}>
        購入者でログイン
      </button>
      <button
        data-testid="set-ordertaker"
        onClick={() => setRole("ordertaker")}
      >
        注文受付担当でログイン
      </button>
      <button
        data-testid="set-accountant"
        onClick={() => setRole("accountant")}
      >
        経理担当でログイン
      </button>
      <button data-testid="set-shipping" onClick={() => setRole("shipping")}>
        配送担当でログイン
      </button>
      <button data-testid="logout" onClick={logout}>
        ログアウト
      </button>
    </div>
  );
}

// テストラッパー
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("AuthContext", () => {
  beforeEach(() => {
    // テスト前にlocalStorageをクリア
    localStorage.clear();
    // localStorageモックをリセット
    vi.clearAllMocks();
  });

  afterEach(() => {
    // テスト後にlocalStorageをクリア
    localStorage.clear();
  });

  describe("初期状態", () => {
    it("初期状態では未認証状態である", () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId("role")).toHaveTextContent("未ログイン");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("未認証");
    });

    it("localStorageに保存されたロールがある場合、初期化時に復元される", () => {
      localStorage.setItem("role", "purchaser");

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId("role")).toHaveTextContent("purchaser");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("認証済み");
    });
  });

  describe("ロール設定", () => {
    it("購入者ロールを設定できる", () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId("set-purchaser"));

      expect(screen.getByTestId("role")).toHaveTextContent("purchaser");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("認証済み");
      expect(localStorage.getItem("role")).toBe("purchaser");
    });

    it("注文受付担当ロールを設定できる", () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId("set-ordertaker"));

      expect(screen.getByTestId("role")).toHaveTextContent("ordertaker");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("認証済み");
      expect(localStorage.getItem("role")).toBe("ordertaker");
    });

    it("経理担当ロールを設定できる", () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId("set-accountant"));

      expect(screen.getByTestId("role")).toHaveTextContent("accountant");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("認証済み");
      expect(localStorage.getItem("role")).toBe("accountant");
    });

    it("配送担当ロールを設定できる", () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId("set-shipping"));

      expect(screen.getByTestId("role")).toHaveTextContent("shipping");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("認証済み");
      expect(localStorage.getItem("role")).toBe("shipping");
    });
  });

  describe("ログアウト機能", () => {
    it("ログアウトするとロールがnullになり未認証状態になる", () => {
      localStorage.setItem("role", "purchaser");

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // 初期状態では認証済み
      expect(screen.getByTestId("role")).toHaveTextContent("purchaser");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("認証済み");

      // ログアウト実行
      fireEvent.click(screen.getByTestId("logout"));

      // 未認証状態になる
      expect(screen.getByTestId("role")).toHaveTextContent("未ログイン");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("未認証");
      expect(localStorage.getItem("role")).toBeNull();
    });
  });

  describe("localStorage同期", () => {
    it("ロール変更時にlocalStorageに保存される", () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId("set-purchaser"));
      expect(localStorage.getItem("role")).toBe("purchaser");

      fireEvent.click(screen.getByTestId("set-ordertaker"));
      expect(localStorage.getItem("role")).toBe("ordertaker");
    });

    it("ログアウト時にlocalStorageからロールが削除される", () => {
      localStorage.setItem("role", "purchaser");

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId("logout"));
      expect(localStorage.getItem("role")).toBeNull();
    });

    it("無効なロール値がlocalStorageにある場合、nullとして扱われる", () => {
      localStorage.setItem("role", "invalid-role");

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId("role")).toHaveTextContent("invalid-role");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("認証済み");
    });

    it("空文字列がlocalStorageにある場合、適切に処理される", () => {
      localStorage.setItem("role", "");

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId("role")).toHaveTextContent("未ログイン");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("未認証");
    });
  });

  describe("エラーハンドリング", () => {
    it("AuthProvider外でuseAuthを使用するとエラーが発生する", () => {
      // エラーハンドリングテスト用のコンポーネント
      function InvalidComponent() {
        const { role } = useAuth();
        return <div>{role}</div>;
      }

      // コンソールエラーを抑制
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(<InvalidComponent />);
      }).toThrow("useAuth must be used within an AuthProvider");

      consoleSpy.mockRestore();
    });

    it("localStorageが利用できない環境でも正常に動作する", () => {
      // localStorageを一時的に無効化
      const originalLocalStorage = global.localStorage;

      // localStorageアクセス時にエラーを投げるモックを作成
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: vi.fn(() => {
            throw new Error("localStorage is not available");
          }),
          setItem: vi.fn(() => {
            throw new Error("localStorage is not available");
          }),
          removeItem: vi.fn(() => {
            throw new Error("localStorage is not available");
          }),
        },
        writable: true,
      });

      // エラーが発生してもアプリケーションが動作することを確認
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(
          <TestWrapper>
            <TestComponent />
          </TestWrapper>
        );
      }).not.toThrow();

      // localStorageを復元
      Object.defineProperty(window, "localStorage", {
        value: originalLocalStorage,
        writable: true,
      });

      consoleSpy.mockRestore();
    });
  });

  describe("状態遷移テスト", () => {
    it("複数回のロール変更が正しく処理される", () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // 初期状態
      expect(screen.getByTestId("role")).toHaveTextContent("未ログイン");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("未認証");

      // purchaser → ordertaker → accountant → shipping → logout
      fireEvent.click(screen.getByTestId("set-purchaser"));
      expect(screen.getByTestId("role")).toHaveTextContent("purchaser");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("認証済み");

      fireEvent.click(screen.getByTestId("set-ordertaker"));
      expect(screen.getByTestId("role")).toHaveTextContent("ordertaker");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("認証済み");

      fireEvent.click(screen.getByTestId("set-accountant"));
      expect(screen.getByTestId("role")).toHaveTextContent("accountant");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("認証済み");

      fireEvent.click(screen.getByTestId("set-shipping"));
      expect(screen.getByTestId("role")).toHaveTextContent("shipping");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("認証済み");

      fireEvent.click(screen.getByTestId("logout"));
      expect(screen.getByTestId("role")).toHaveTextContent("未ログイン");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("未認証");
    });

    it("同じロールを複数回設定しても正常に動作する", () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId("set-purchaser"));
      expect(screen.getByTestId("role")).toHaveTextContent("purchaser");

      fireEvent.click(screen.getByTestId("set-purchaser"));
      expect(screen.getByTestId("role")).toHaveTextContent("purchaser");
      expect(localStorage.getItem("role")).toBe("purchaser");
    });

    it("nullを明示的に設定した場合の動作確認", () => {
      // テスト用のコンポーネントを追加
      function TestComponentWithNull() {
        const { role, setRole, isAuthenticated } = useAuth();

        return (
          <div>
            <div data-testid="role">{role || "未ログイン"}</div>
            <div data-testid="authenticated">
              {isAuthenticated ? "認証済み" : "未認証"}
            </div>
            <button data-testid="set-null" onClick={() => setRole(null)}>
              nullに設定
            </button>
          </div>
        );
      }

      // 最初に何かのロールを設定
      localStorage.setItem("role", "purchaser");

      render(
        <TestWrapper>
          <TestComponentWithNull />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId("set-null"));
      expect(screen.getByTestId("role")).toHaveTextContent("未ログイン");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("未認証");
      expect(localStorage.getItem("role")).toBeNull();
    });
  });

  describe("コンテキストプロバイダーのテスト", () => {
    it("AuthProviderが正しいコンテキスト値を提供する", () => {
      const TestContextValueComponent = () => {
        const auth = useAuth();

        return (
          <div>
            <div data-testid="context-type">{typeof auth}</div>
            <div data-testid="has-role">
              {"role" in auth ? "true" : "false"}
            </div>
            <div data-testid="has-setRole">
              {"setRole" in auth ? "true" : "false"}
            </div>
            <div data-testid="has-logout">
              {"logout" in auth ? "true" : "false"}
            </div>
            <div data-testid="has-isAuthenticated">
              {"isAuthenticated" in auth ? "true" : "false"}
            </div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestContextValueComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId("context-type")).toHaveTextContent("object");
      expect(screen.getByTestId("has-role")).toHaveTextContent("true");
      expect(screen.getByTestId("has-setRole")).toHaveTextContent("true");
      expect(screen.getByTestId("has-logout")).toHaveTextContent("true");
      expect(screen.getByTestId("has-isAuthenticated")).toHaveTextContent(
        "true"
      );
    });

    it("子コンポーネントが複数ある場合でも正しく動作する", () => {
      const ChildComponent1 = () => {
        const { role } = useAuth();
        return <div data-testid="child1-role">{role || "未ログイン"}</div>;
      };

      const ChildComponent2 = () => {
        const { isAuthenticated } = useAuth();
        return (
          <div data-testid="child2-auth">
            {isAuthenticated ? "認証済み" : "未認証"}
          </div>
        );
      };

      render(
        <TestWrapper>
          <ChildComponent1 />
          <ChildComponent2 />
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId("set-purchaser"));

      expect(screen.getByTestId("child1-role")).toHaveTextContent("purchaser");
      expect(screen.getByTestId("child2-auth")).toHaveTextContent("認証済み");
      expect(screen.getByTestId("role")).toHaveTextContent("purchaser");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("認証済み");
    });
  });
});
