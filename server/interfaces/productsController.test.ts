/**
 * productsControllerの単体テスト
 * - 商品一覧取得APIの正常系・異常系を網羅
 * - 実際のコントローラーのテスト
 */

import request from "supertest";
import express from "express";
import { PrismaClient } from "@prisma/client";
import { createProductsController } from "./productsController";

// PrismaClientをモック化
jest.mock("@prisma/client");

describe("productsController", () => {
  let app: express.Application;
  let mockPrisma: any;

  beforeEach(() => {
    // モック化されたPrismaClientの設定
    mockPrisma = {
      productInventory: {
        findMany: jest.fn(),
      },
    } as any;

    // テスト用のExpressアプリケーション作成
    app = express();
    app.use(express.json());

    // DIを使って実際のコントローラーにモックを注入
    const productsController = createProductsController(mockPrisma);
    app.use("/api/products", productsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/products", () => {
    it("正常系: 商品一覧を正常に取得できる", async () => {
      // モックデータの設定
      const mockProducts = [
        {
          productNo: "P001",
          productName: "テスト商品1",
          unitPrice: 1000,
          category: "カテゴリA",
          manufacturer: "メーカーA",
          stockQuantity1: 100,
          stockQuantity2: 95,
        },
        {
          productNo: "P002",
          productName: "テスト商品2",
          unitPrice: 2000,
          category: "カテゴリB",
          manufacturer: "メーカーB",
          stockQuantity1: 50,
          stockQuantity2: 48,
        },
      ];

      (mockPrisma.productInventory.findMany as jest.Mock).mockResolvedValue(
        mockProducts
      );

      // APIコール実行
      const response = await request(app).get("/api/products");

      // レスポンス検証
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: "success",
        products: mockProducts,
      });

      // モック関数の呼び出し検証
      expect(mockPrisma.productInventory.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrisma.productInventory.findMany).toHaveBeenCalledWith();
    });

    it("正常系: 商品が存在しない場合は空配列を返す", async () => {
      // 空の配列を返すモック設定
      (mockPrisma.productInventory.findMany as jest.Mock).mockResolvedValue([]);

      // APIコール実行
      const response = await request(app).get("/api/products");

      // レスポンス検証
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: "success",
        products: [],
      });

      expect(mockPrisma.productInventory.findMany).toHaveBeenCalledTimes(1);
    });

    it("異常系: データベースエラーで500エラーを返す", async () => {
      // データベースエラーをシミュレート
      const dbError = new Error("Database connection failed");
      (mockPrisma.productInventory.findMany as jest.Mock).mockRejectedValue(
        dbError
      );

      // APIコール実行
      const response = await request(app).get("/api/products");

      // レスポンス検証
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: "failure",
        message: "Database connection failed",
      });

      expect(mockPrisma.productInventory.findMany).toHaveBeenCalledTimes(1);
    });

    it("異常系: エラーメッセージがない場合はデフォルトメッセージを返す", async () => {
      // メッセージのないエラーをシミュレート
      const errorWithoutMessage = { message: "" };
      (mockPrisma.productInventory.findMany as jest.Mock).mockRejectedValue(
        errorWithoutMessage
      );

      // APIコール実行
      const response = await request(app).get("/api/products");

      // レスポンス検証 - 空のメッセージが返される
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: "failure",
        message: "",
      });
    });

    it("異常系: 未定義エラーの場合はデフォルトメッセージを返す", async () => {
      // undefinedエラーをシミュレート
      const errorWithoutMessage = {};
      (mockPrisma.productInventory.findMany as jest.Mock).mockRejectedValue(
        errorWithoutMessage
      );

      // APIコール実行
      const response = await request(app).get("/api/products");

      // レスポンス検証
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: "failure",
        message: "商品一覧取得中にエラーが発生しました。",
      });
    });
  });

  describe("レスポンス形式", () => {
    it("正常系レスポンスが正しい形式である", async () => {
      const mockProducts = [
        {
          productNo: "P001",
          productName: "商品1",
          unitPrice: 1000,
          category: "カテゴリ1",
          manufacturer: "メーカー1",
          stockQuantity1: 10,
          stockQuantity2: 8,
        },
      ];

      (mockPrisma.productInventory.findMany as jest.Mock).mockResolvedValue(
        mockProducts
      );

      const response = await request(app).get("/api/products");

      // レスポンス形式の詳細検証
      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("products");
      expect(response.body.status).toBe("success");
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.headers["content-type"]).toMatch(/json/);
    });

    it("エラーレスポンスが正しい形式である", async () => {
      (mockPrisma.productInventory.findMany as jest.Mock).mockRejectedValue(
        new Error("Test error")
      );

      const response = await request(app).get("/api/products");

      // エラーレスポンス形式の検証
      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("message");
      expect(response.body.status).toBe("failure");
      expect(typeof response.body.message).toBe("string");
      expect(response.headers["content-type"]).toMatch(/json/);
    });
  });
});
