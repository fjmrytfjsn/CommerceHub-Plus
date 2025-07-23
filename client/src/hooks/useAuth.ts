import { useContext } from "react";
import { AuthContext, type AuthContextType } from "../contexts/AuthContext";

/**
 * 認証フックカスタムフック
 * 認証コンテキストを使用して認証状態を管理
 * @returns 認証コンテキストの値
 * @throws エラー - AuthProvider外で使用された場合
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
