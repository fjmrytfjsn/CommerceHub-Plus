import { createContext } from "react";
import type { UserRole } from "../types";

/**
 * 認証コンテキストの型定義
 */
export type AuthContextType = {
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

/**
 * 認証コンテキスト
 * undefinedで初期化し、プロバイダー外での使用を防ぐ
 */
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
