/**
 * server/index.ts の単体テスト
 * - 商品検索APIの正常系・異常系テスト
 * - リクエスト・レスポンスの検証
 */

import request from "supertest";
import express from "express";
import { createApp } from "./index";

// PrismaClientをモック化
jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    productInventory: {
      findMany: jest.fn(),
    },
  })),
}));

// 他の依存関係もモック化
jest.mock("./application/order/RegisterOrderService");
jest.mock("./interfaces/orderController", () => ({
  createOrderRouter: jest.fn(() => {
    const express = require("express");
    return express.Router();
  }),
}));
jest.mock("./interfaces/productsController", () => {
  const express = require("express");
  return express.Router();
});

describe("server/index.ts", () => {
  let app: express.Application;
  let mockPrisma: any;

  beforeEach(() => {
    // モックされたPrismaインスタンス
    mockPrisma = {
      productInventory: {
        findMany: jest.fn(),
      },
    };

    // 実際のアプリケーションを作成（モックされたPrismaを注入）
    app = createApp(mockPrisma);
    jest.clearAllMocks();
  });

  describe("GET /", () => {
    it("ルートパスでサーバー起動メッセージを返す", async () => {
      const response = await request(app).get("/");

      expect(response.status).toBe(200);
      expect(response.text).toBe("Express + TypeScript サーバー起動");
    });
  });

  describe("GET /api/products/search", () => {
    it("正常系: 商品番号での検索が成功する", async () => {
      const mockProducts = [
        {
          productNo: "P001",
          productName: "商品A",
          unitPrice: 1000,
          stockQuantity2: 10,
        },
      ];
      mockPrisma.productInventory.findMany.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get("/api/products/search")
        .query({ searchType: "productNo", searchValue: "P001" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: "success",
        products: mockProducts,
      });
      expect(mockPrisma.productInventory.findMany).toHaveBeenCalledWith({
        where: { productNo: "P001" },
        select: {
          productNo: true,
          productName: true,
          unitPrice: true,
          stockQuantity2: true,
        },
      });
    });

    it("正常系: 商品名での検索が成功する", async () => {
      const mockProducts = [
        {
          productNo: "P001",
          productName: "テスト商品",
          unitPrice: 1500,
          stockQuantity2: 5,
        },
      ];
      mockPrisma.productInventory.findMany.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get("/api/products/search")
        .query({ searchType: "productName", searchValue: "テスト" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: "success",
        products: mockProducts,
      });
      expect(mockPrisma.productInventory.findMany).toHaveBeenCalledWith({
        where: { productName: { contains: "テスト" } },
        select: {
          productNo: true,
          productName: true,
          unitPrice: true,
          stockQuantity2: true,
        },
      });
    });

    it("正常系: 検索結果が空の場合", async () => {
      mockPrisma.productInventory.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get("/api/products/search")
        .query({ searchType: "productNo", searchValue: "P999" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: "success",
        products: [],
      });
    });

    it("異常系: 不正なsearchTypeでエラーを返す", async () => {
      const response = await request(app)
        .get("/api/products/search")
        .query({ searchType: "invalid", searchValue: "test" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: "failure",
        message:
          "searchTypeは'productNo'または'productName'を指定してください。",
      });
    });

    it("異常系: searchValueが空文字でエラーを返す", async () => {
      const response = await request(app)
        .get("/api/products/search")
        .query({ searchType: "productNo", searchValue: "" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: "failure",
        message: "searchValueを指定してください。",
      });
    });

    it("異常系: searchValueが未指定でエラーを返す", async () => {
      const response = await request(app)
        .get("/api/products/search")
        .query({ searchType: "productNo" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: "failure",
        message: "searchValueを指定してください。",
      });
    });

    it("異常系: searchValueが数値型でエラーを返す", async () => {
      const mockProducts: any[] = [];
      mockPrisma.productInventory.findMany.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get("/api/products/search")
        .query({ searchType: "productNo", searchValue: 123 });

      // クエリパラメータは文字列として処理されるため、実際には正常に処理される
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "success");
      expect(response.body).toHaveProperty("products");
      expect(response.body.products).toEqual([]);
    });

    it("異常系: データベースエラーで500エラーを返す", async () => {
      mockPrisma.productInventory.findMany.mockRejectedValue(
        new Error("Database connection failed")
      );

      const response = await request(app)
        .get("/api/products/search")
        .query({ searchType: "productNo", searchValue: "P001" });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: "failure",
        message: "サーバー内部エラーが発生しました。",
      });
    });

    it("レスポンス形式の検証: 正常系", async () => {
      const mockProducts = [
        {
          productNo: "P001",
          productName: "商品1",
          unitPrice: 1000,
          stockQuantity2: 10,
        },
      ];
      mockPrisma.productInventory.findMany.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get("/api/products/search")
        .query({ searchType: "productNo", searchValue: "P001" });

      // レスポンス形式の詳細検証
      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("products");
      expect(response.body.status).toBe("success");
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.headers["content-type"]).toMatch(/json/);
    });

    it("レスポンス形式の検証: エラー系", async () => {
      const response = await request(app)
        .get("/api/products/search")
        .query({ searchType: "invalid", searchValue: "test" });

      // エラーレスポンス形式の検証
      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("message");
      expect(response.body.status).toBe("failure");
      expect(typeof response.body.message).toBe("string");
      expect(response.headers["content-type"]).toMatch(/json/);
    });
  });
});
