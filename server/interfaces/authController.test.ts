import request from 'supertest';
import express from 'express';
import { createAuthRouter } from './authController';
import { AuthService } from '../application/auth/AuthService';

describe('Auth Controller', () => {
  let app: express.Application;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    // モックAuthServiceを作成
    mockAuthService = {
      authenticate: jest.fn(),
      requiresAuthentication: jest.fn(),
    } as any;

    app = express();
    app.use(express.json());
    app.use('/api/auth', createAuthRouter(mockAuthService));
  });

  describe('POST /api/auth/login', () => {
    it('正しいパスワードで認証に成功する', async () => {
      mockAuthService.authenticate.mockReturnValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          role: 'ordertaker',
          password: 'ordertaker123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        message: '認証に成功しました。',
        role: 'ordertaker'
      });
      expect(mockAuthService.authenticate).toHaveBeenCalledWith('ordertaker', 'ordertaker123');
    });

    it('間違ったパスワードで認証に失敗する', async () => {
      mockAuthService.authenticate.mockReturnValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          role: 'ordertaker',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        status: 'failure',
        message: 'パスワードが正しくありません。'
      });
    });

    it('ロールが指定されていない場合400エラー', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'ordertaker123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'failure',
        message: 'ロールとパスワードを指定してください。'
      });
    });

    it('パスワードが指定されていない場合400エラー', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          role: 'ordertaker'
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'failure',
        message: 'ロールとパスワードを指定してください。'
      });
    });

    it('無効なロールの場合400エラー', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          role: 'invalidrole',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'failure',
        message: '無効なロールです。'
      });
    });

    it('各ロールで認証が成功する', async () => {
      mockAuthService.authenticate.mockReturnValue(true);

      const roles = ['ordertaker', 'accountant', 'shipping'];
      
      for (const role of roles) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            role: role,
            password: 'password123'
          });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.role).toBe(role);
      }
    });

    it('認証サービスでエラーが発生した場合500エラー', async () => {
      mockAuthService.authenticate.mockImplementation(() => {
        throw new Error('サービスエラー');
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          role: 'ordertaker',
          password: 'ordertaker123'
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: 'failure',
        message: 'サーバー内部エラーが発生しました。'
      });
    });
  });

  describe('GET /api/auth/roles', () => {
    it('認証が必要なロール一覧を取得する', async () => {
      const response = await request(app)
        .get('/api/auth/roles');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        data: {
          authenticatedRoles: ['ordertaker', 'accountant', 'shipping'],
          publicRoles: ['purchaser']
        }
      });
    });
  });
});