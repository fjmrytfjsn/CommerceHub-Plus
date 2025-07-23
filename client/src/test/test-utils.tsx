import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthProvider";
import type { UserRole } from "../types";

/**
 * テスト用のプロバイダーヘルパー
 * AuthProviderとMemoryRouterでコンポーネントをラップします
 */
type TestProviderProps = {
  children: ReactNode;
  initialEntries?: string[];
  initialRole?: UserRole | null;
};

export function TestProvider({
  children,
  initialEntries = ["/"],
  initialRole = null,
}: TestProviderProps) {
  // テスト用のlocalStorageセットアップ
  if (initialRole) {
    window.localStorage.setItem("role", initialRole);
  } else {
    window.localStorage.clear();
  }

  return (
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );
}
