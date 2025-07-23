import express from "express";
import { createAuthRouter } from "./interfaces/authController";
import cors from "cors";
import dotenv from "dotenv";

// 環境変数を読み込み
dotenv.config();

/**
 * 認証APIの動作確認用簡単なサーバー
 * Prismaに依存しない認証機能のテスト用
 */
function createAuthTestApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // 認証APIを追加
  app.use("/api/auth", createAuthRouter());

  // 基本のエンドポイント
  app.get("/", (req, res) => {
    res.json({
      message: "認証API テストサーバー",
      endpoints: {
        login: "POST /api/auth/login",
        roles: "GET /api/auth/roles"
      }
    });
  });

  // ヘルスチェック
  app.get("/health", (req, res) => {
    res.json({ status: "healthy" });
  });

  return app;
}

// サーバーを起動
if (require.main === module) {
  const app = createAuthTestApp();
  const port = process.env.PORT || 3001;
  
  app.listen(port, () => {
    console.log(`認証テストサーバー起動: http://localhost:${port}`);
    console.log(`使用方法:`);
    console.log(`  GET  http://localhost:${port}/api/auth/roles`);
    console.log(`  POST http://localhost:${port}/api/auth/login`);
    console.log(`      Body: {"role": "ordertaker", "password": "ordertaker123"}`);
  });
}

export { createAuthTestApp };