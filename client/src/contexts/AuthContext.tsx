import { useState, useCallback, type ReactNode } from "react";
import { AuthContext, type AuthContextType } from "./AuthContext";
import type { UserRole } from "../types";

/**
 * 認証プロバイダーのProps
 */
type AuthProviderProps = {
  children: ReactNode;
};

/**
 * 認証プロバイダーコンポーネント
 * LocalStorageを使用してロール情報を永続化する
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // ロールをlocalStorageで永続化（エラーハンドリング付き）
  const [role, setRoleState] = useState<UserRole | null>(() => {
    try {
      const savedRole = localStorage.getItem("role");
      // 空文字列やnullの場合はnullを返す
      if (!savedRole) {
        return null;
      }
      return savedRole as UserRole;
    } catch (error) {
      // localStorageアクセスエラーの場合はnullを返す
      console.warn("Failed to access localStorage:", error);
      return null;
    }
  });

  // ロール変更時にlocalStorageへ保存（エラーハンドリング付き）
  const setRole = useCallback((newRole: UserRole | null) => {
    setRoleState(newRole);
    try {
      if (newRole) {
        localStorage.setItem("role", newRole);
      } else {
        localStorage.removeItem("role");
      }
    } catch (error) {
      // localStorageアクセスエラーの場合は警告ログを出力
      console.warn("Failed to update localStorage:", error);
    }
  }, []);

  // ログアウト処理
  const logout = useCallback(() => {
    setRole(null);
  }, [setRole]);

  const isAuthenticated = role !== null;

  const value: AuthContextType = {
    role,
    setRole,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
