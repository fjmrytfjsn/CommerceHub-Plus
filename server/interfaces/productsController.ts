import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 依存性注入対応のproductsControllerファクトリ関数
 * @param injectedPrisma - テスト時に注入するPrismaClientインスタンス
 */
export function createProductsController(injectedPrisma?: PrismaClient) {
  const router = Router();
  const prismaInstance = injectedPrisma || prisma;

  /**
   * 商品一覧取得API
   * GET /api/products
   */
  router.get("/", async (_req: Request, res: Response) => {
    try {
      const products = await prismaInstance.productInventory.findMany();
      return res.status(200).json({
        status: "success",
        products,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: "failure",
        message: error.message ?? "商品一覧取得中にエラーが発生しました。",
      });
    }
  });

  return router;
}

// デフォルトエクスポート（本番環境用）
const router = createProductsController();
export default router;
