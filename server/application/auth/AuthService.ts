import dotenv from 'dotenv';

// 環境変数を読み込み
dotenv.config();

/**
 * ユーザーロール型
 */
export type UserRole = 'ordertaker' | 'accountant' | 'shipping';

/**
 * パスワード認証サービス
 * 環境変数で設定されたパスワードと照合する
 */
export class AuthService {
  private readonly passwords: Record<UserRole, string>;

  constructor() {
    this.passwords = {
      ordertaker: process.env.ORDERTAKER_PASSWORD || 'ordertaker123',
      accountant: process.env.ACCOUNTANT_PASSWORD || 'accountant123',
      shipping: process.env.SHIPPING_PASSWORD || 'shipping123',
    };
  }

  /**
   * パスワード認証を行う
   * @param role ユーザーロール
   * @param password 入力されたパスワード
   * @returns 認証成功の場合true、失敗の場合false
   */
  authenticate(role: UserRole, password: string): boolean {
    const expectedPassword = this.passwords[role];
    return expectedPassword === password;
  }

  /**
   * 指定されたロールが認証を必要とするかチェック
   * @param role ユーザーロール
   * @returns 認証が必要な場合true、不要な場合false
   */
  requiresAuthentication(role: string): boolean {
    return role === 'ordertaker' || role === 'accountant' || role === 'shipping';
  }
}