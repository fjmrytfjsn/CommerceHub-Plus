// エントリーポイント
import express from "express";
import orderController from "./interfaces/orderController";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// 既存の商品検索API（簡易のまま残す）
app.get("/api/products/search", async (req, res) => {
  const { searchType, searchValue } = req.query;

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

// DDD構成の注文API
app.use("/api/orders", orderController);

app.get("/", (req, res) => res.send("Express + TypeScript サーバー起動"));

app.listen(3000, () => console.log("サーバー起動: http://localhost:3000"));
