import { AuthService } from './AuthService';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    // テスト環境の環境変数をリセット
    delete process.env.ORDERTAKER_PASSWORD;
    delete process.env.ACCOUNTANT_PASSWORD;
    delete process.env.SHIPPING_PASSWORD;
    authService = new AuthService();
  });

  describe('authenticate', () => {
    it('正しいパスワードで認証が成功する', () => {
      expect(authService.authenticate('ordertaker', 'ordertaker123')).toBe(true);
      expect(authService.authenticate('accountant', 'accountant123')).toBe(true);
      expect(authService.authenticate('shipping', 'shipping123')).toBe(true);
    });

    it('間違ったパスワードで認証が失敗する', () => {
      expect(authService.authenticate('ordertaker', 'wrongpassword')).toBe(false);
      expect(authService.authenticate('accountant', 'wrongpassword')).toBe(false);
      expect(authService.authenticate('shipping', 'wrongpassword')).toBe(false);
    });

    it('空のパスワードで認証が失敗する', () => {
      expect(authService.authenticate('ordertaker', '')).toBe(false);
      expect(authService.authenticate('accountant', '')).toBe(false);
      expect(authService.authenticate('shipping', '')).toBe(false);
    });
  });

  describe('環境変数から設定されたパスワード', () => {
    it('環境変数からパスワードを読み込む', () => {
      // 環境変数を設定
      process.env.ORDERTAKER_PASSWORD = 'custom_ordertaker_pass';
      process.env.ACCOUNTANT_PASSWORD = 'custom_accountant_pass';
      process.env.SHIPPING_PASSWORD = 'custom_shipping_pass';

      const customAuthService = new AuthService();

      expect(customAuthService.authenticate('ordertaker', 'custom_ordertaker_pass')).toBe(true);
      expect(customAuthService.authenticate('accountant', 'custom_accountant_pass')).toBe(true);
      expect(customAuthService.authenticate('shipping', 'custom_shipping_pass')).toBe(true);

      // デフォルトパスワードでは失敗する
      expect(customAuthService.authenticate('ordertaker', 'ordertaker123')).toBe(false);
    });
  });

  describe('requiresAuthentication', () => {
    it('職員ロールは認証が必要', () => {
      expect(authService.requiresAuthentication('ordertaker')).toBe(true);
      expect(authService.requiresAuthentication('accountant')).toBe(true);
      expect(authService.requiresAuthentication('shipping')).toBe(true);
    });

    it('購入者ロールは認証が不要', () => {
      expect(authService.requiresAuthentication('purchaser')).toBe(false);
      expect(authService.requiresAuthentication('customer')).toBe(false);
      expect(authService.requiresAuthentication('guest')).toBe(false);
    });
  });
});