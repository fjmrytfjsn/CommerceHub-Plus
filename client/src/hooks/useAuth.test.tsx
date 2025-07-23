import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useAuth } from "./useAuth";
import { AuthProvider } from "../contexts/AuthProvider";

describe("useAuth", () => {
  describe("正常な使用", () => {
    it("AuthProvider内で使用すると認証コンテキストを取得できる", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current).toHaveProperty("role");
      expect(result.current).toHaveProperty("setRole");
      expect(result.current).toHaveProperty("logout");
      expect(result.current).toHaveProperty("isAuthenticated");
      expect(typeof result.current.setRole).toBe("function");
      expect(typeof result.current.logout).toBe("function");
      expect(typeof result.current.isAuthenticated).toBe("boolean");
    });

    it("初期状態では未認証状態である", () => {
      localStorage.clear(); // テスト前にクリア

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.role).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("localStorageに保存されたロールがある場合は初期化時に復元される", () => {
      localStorage.setItem("role", "purchaser");

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.role).toBe("purchaser");
      expect(result.current.isAuthenticated).toBe(true);

      localStorage.clear(); // テスト後にクリア
    });
  });

  describe("エラーケース", () => {
    it("AuthProvider外で使用するとエラーを投げる", () => {
      // コンソールエラーを抑制
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow("useAuth must be used within an AuthProvider");

      // コンソールエラーを復元
      console.error = originalError;
    });

    it("エラーメッセージが正確である", () => {
      const originalError = console.error;
      console.error = vi.fn();

      try {
        renderHook(() => useAuth());
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(
          "useAuth must be used within an AuthProvider"
        );
      }

      console.error = originalError;
    });

    it("undefinedコンテキストでの適切なエラーハンドリング", () => {
      const originalError = console.error;
      console.error = vi.fn();

      // AuthProviderなしでの使用
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow("useAuth must be used within an AuthProvider");

      console.error = originalError;
    });
  });

  describe("パフォーマンステスト", () => {
    it("同じコンテキスト値に対して参照が安定している", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result, rerender } = renderHook(() => useAuth(), { wrapper });

      const firstRender = result.current;

      // 再レンダリング
      rerender();

      const secondRender = result.current;

      // 同じ関数参照が維持されていることを確認
      expect(firstRender.setRole).toBe(secondRender.setRole);
      expect(firstRender.logout).toBe(secondRender.logout);
    });

    it("複数回の呼び出しでも安定した動作", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      const auth1 = result.current;
      const auth2 = result.current;

      // 同じ参照であることを確認
      expect(auth1).toBe(auth2);
      expect(auth1.setRole).toBe(auth2.setRole);
      expect(auth1.logout).toBe(auth2.logout);
    });
  });

  describe("エッジケーステスト", () => {
    it("空文字列のロールが保存されている場合の処理", () => {
      localStorage.setItem("role", "");

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.role).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);

      localStorage.clear();
    });

    it("無効なロール値が保存されている場合の処理", () => {
      localStorage.setItem("role", "invalid-role");

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      // 無効な値でも文字列として扱われる
      expect(result.current.role).toBe("invalid-role");
      expect(result.current.isAuthenticated).toBe(true);

      localStorage.clear();
    });

    it("localStorage エラー時の処理", () => {
      // localStorageを一時的に無効化
      const originalLocalStorage = global.localStorage;

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

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      expect(() => {
        renderHook(() => useAuth(), { wrapper });
      }).not.toThrow();

      // localStorageを復元
      Object.defineProperty(window, "localStorage", {
        value: originalLocalStorage,
        writable: true,
      });

      consoleSpy.mockRestore();
    });
  });

  describe("型安全性", () => {
    it("戻り値の型がAuthContextTypeと一致している", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });
      const authContext = result.current;

      // roleの型チェック
      expect(
        authContext.role === null || typeof authContext.role === "string"
      ).toBe(true);

      // setRoleの型チェック
      expect(typeof authContext.setRole).toBe("function");

      // logoutの型チェック
      expect(typeof authContext.logout).toBe("function");

      // isAuthenticatedの型チェック
      expect(typeof authContext.isAuthenticated).toBe("boolean");
    });
  });
});
