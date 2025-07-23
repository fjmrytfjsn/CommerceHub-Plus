// エントリーポイント
import express from "express";
import { createOrderRouter } from "./interfaces/orderController";
import { RegisterOrderService } from "./application/order/RegisterOrderService";
import { PrismaClient } from "@prisma/client";
import productsController from "./interfaces/productsController";
import cors from "cors";

/**
 * アプリケーションを作成する関数（テスト用）
 */
export function createApp(prismaClient?: PrismaClient) {
  const app = express();
  const prisma = prismaClient || new PrismaClient();
  const registerOrderService = new RegisterOrderService(prisma);

  app.use(cors());
  app.use(express.json());

  // 既存の商品検索API（簡易のまま残す）
  app.get("/api/products/search", async (req, res) => {
    const { searchType, searchValue } = req.query;

    if (searchType !== "productNo" && searchType !== "productName") {
      return res.status(400).json({
        status: "failure",
        message:
          "searchTypeは'productNo'または'productName'を指定してください。",
      });
    }
    if (
      !searchValue ||
      typeof searchValue !== "string" ||
      searchValue.length === 0
    ) {
      return res.status(400).json({
        status: "failure",
        message: "searchValueを指定してください。",
      });
    }

    try {
      let products;
      if (searchType === "productNo") {
        products = await prisma.productInventory.findMany({
          where: { productNo: searchValue },
          select: {
            productNo: true,
            productName: true,
            unitPrice: true,
            stockQuantity2: true,
          },
        });
      } else {
        products = await prisma.productInventory.findMany({
          where: { productName: { contains: searchValue } },
          select: {
            productNo: true,
            productName: true,
            unitPrice: true,
            stockQuantity2: true,
          },
        });
      }
      return res.json({
        status: "success",
        products,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failure",
        message: "サーバー内部エラーが発生しました。",
      });
    }
  });

  app.use("/api/products", productsController);

  /**
   * DDD構成の注文API
   * createOrderRouterでルーターを生成し、DIする
   */
  app.use("/api/orders", createOrderRouter(prisma, registerOrderService));

  app.get("/", (req, res) => res.send("Express + TypeScript サーバー起動"));

  return app;
}

// 本番環境では直接サーバーを起動
if (require.main === module) {
  const app = createApp();
  app.listen(3000, () => console.log("サーバー起動: http://localhost:3000"));
}
