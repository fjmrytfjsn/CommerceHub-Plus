import { Router, Request, Response } from "express";
import { AuthService, UserRole } from "../application/auth/AuthService";

/**
 * 認証リクエストの型定義
 */
interface AuthRequest {
  role: UserRole;
  password: string;
}

/**
 * 認証コントローラー
 * パスワード認証のAPIエンドポイントを提供
 */
export function createAuthRouter(authService?: AuthService): Router {
  const router = Router();
  const service = authService || new AuthService();

  /**
   * POST /api/auth/login
   * パスワード認証を行う
   */
  router.post("/login", (req: Request, res: Response) => {
    const { role, password }: AuthRequest = req.body;

    // リクエストデータの検証
    if (!role || !password) {
      return res.status(400).json({
        status: "failure",
        message: "ロールとパスワードを指定してください。",
      });
    }

    // サポートされているロールかチェック
    if (!["ordertaker", "accountant", "shipping"].includes(role)) {
      return res.status(400).json({
        status: "failure",
        message: "無効なロールです。",
      });
    }

    try {
      // パスワード認証
      const isAuthenticated = service.authenticate(role, password);

      if (isAuthenticated) {
        return res.json({
          status: "success",
          message: "認証に成功しました。",
          role: role,
        });
      } else {
        return res.status(401).json({
          status: "failure",
          message: "パスワードが正しくありません。",
        });
      }
    } catch (error) {
      console.error("認証エラー:", error);
      return res.status(500).json({
        status: "failure",
        message: "サーバー内部エラーが発生しました。",
      });
    }
  });

  /**
   * GET /api/auth/roles
   * 認証が必要なロール一覧を取得
   */
  router.get("/roles", (req: Request, res: Response) => {
    const roles = ["ordertaker", "accountant", "shipping"];
    return res.json({
      status: "success",
      data: {
        authenticatedRoles: roles,
        publicRoles: ["purchaser"],
      },
    });
  });

  return router;
}
