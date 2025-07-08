// エントリーポイント
import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

/**
 * 商品検索API
 * クエリパラメータ:
 *   - searchType: "productNo" または "productName"
 *   - searchValue: 検索値
 */
app.get("/api/products/search", async (req: Request, res: Response) => {
  const { searchType, searchValue } = req.query;

  // パラメータバリデーション
  if (searchType !== "productNo" && searchType !== "productName") {
    return res.status(400).json({
      status: "failure",
      message: "searchTypeは'productNo'または'productName'を指定してください。",
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
      // 商品番号で完全一致検索
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
      // 商品名で部分一致検索
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

app.get("/", (req, res) => res.send("Express + TypeScript サーバー起動"));

app.listen(3000, () => console.log("サーバー起動: http://localhost:3000"));
