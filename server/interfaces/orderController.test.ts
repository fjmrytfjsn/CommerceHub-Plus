/**
 * orderControllerの統合テスト（supertest使用）
 * - 正常系・異常系・境界値を網羅
 * - DB操作はjest.mockでモック化
 * - 各APIエンドポイントのテスト雛形を用意
 */

import request from "supertest";
import express from "express";
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { RegisterOrderService } from "../application/order/RegisterOrderService";
import { createOrderRouter } from "./orderController";

// テスト用にPrismaClientとRegisterOrderServiceを毎回差し替え
jest.mock("@prisma/client");
jest.mock("../application/order/RegisterOrderService");

function createTestApp(prismaMock: any, serviceMock: any) {
  const app = express();
  app.use(express.json());
  app.use("/api/orders", createOrderRouter(prismaMock, serviceMock));
  return app;
}

describe("orderController API", () => {
  let prismaMock: any;
  let serviceMock: any;
  let app: any;

  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock = {
      productInventory: {
        findUnique: jest.fn(),
      },
      orderData: {
        findMany: jest.fn(),
      },
    };
    serviceMock = {
      registerNetOrder: jest.fn(),
      registerPhoneFaxOrder: jest.fn(),
      updatePaymentStatus: jest.fn(),
      updateShippingStatus: jest.fn(),
      getDeliveryNote: jest.fn(),
      getInvoice: jest.fn(),
    };
    app = createTestApp(prismaMock, serviceMock);
  });

  it("POST /api/orders/net で注文登録（バリデーションエラー）", async () => {
    const res = await request(app).post("/api/orders/net").send({
      productDetails: [],
      purchaserInfo: null,
      creditCardInfo: null,
      shippingFee: 660,
    });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe("failure");
  });

  it("POST /api/orders/net で注文登録（正常系）", async () => {
    prismaMock.productInventory.findUnique.mockResolvedValue({
      productName: "商品A",
    });
    serviceMock.registerNetOrder.mockResolvedValue(["10001"]);
    const res = await request(app)
      .post("/api/orders/net")
      .send({
        productDetails: [{ productNo: "P001", purchaseQuantity: 2 }],
        purchaserInfo: {
          name: "山田太郎",
          address: "東京都",
          contact: "090-0000-0000",
        },
        creditCardInfo: {
          cardNumber: "1234567890123456",
          holderName: "YAMADA TARO",
          expiryDate: "12/29",
          securityCode: "123",
        },
        shippingFee: 660,
      });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.orderNos).toContain("10001");
  });

  it("POST /api/orders/net で注文登録（在庫不足エラー）", async () => {
    prismaMock.productInventory.findUnique.mockResolvedValue({
      productName: "商品A",
    });
    serviceMock.registerNetOrder.mockRejectedValue(
      new Error("商品番号 P001 の在庫が不足しています。")
    );
    const res = await request(app)
      .post("/api/orders/net")
      .send({
        productDetails: [{ productNo: "P001", purchaseQuantity: 99 }],
        purchaserInfo: {
          name: "山田太郎",
          address: "東京都",
          contact: "090-0000-0000",
        },
        creditCardInfo: {
          cardNumber: "1234567890123456",
          holderName: "YAMADA TARO",
          expiryDate: "12/29",
          securityCode: "123",
        },
        shippingFee: 660,
      });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe("failure");
    expect(res.body.message).toContain("在庫が不足");
  });

  it("PATCH /api/orders/:orderNo/payment-status（正常系）", async () => {
    (RegisterOrderService.prototype.updatePaymentStatus as any) = jest
      .fn()
      .mockResolvedValue(undefined);
    const res = await request(app)
      .patch("/api/orders/10001/payment-status")
      .send({ status: "支払済" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });

  it("PATCH /api/orders/:orderNo/payment-status（異常系: status未指定）", async () => {
    const res = await request(app)
      .patch("/api/orders/10001/payment-status")
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.status).toBe("failure");
  });

  it("GET /api/orders/:orderNo/delivery-note（正常系）", async () => {
    serviceMock.getDeliveryNote.mockResolvedValue({ note: "納品書データ" });
    const res = await request(app).get("/api/orders/10001/delivery-note");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.deliveryNote).toBeDefined();
  });

  it("GET /api/orders/:orderNo/delivery-note（異常系: 注文なし）", async () => {
    serviceMock.getDeliveryNote.mockRejectedValue(
      new Error("注文が見つかりません")
    );
    const res = await request(app).get("/api/orders/99999/delivery-note");
    expect(res.status).toBe(404);
    expect(res.body.status).toBe("failure");
  });

  it("POST /api/orders/phone-fax（正常系）", async () => {
    prismaMock.productInventory.findUnique.mockResolvedValue({
      productName: "商品B",
    });
    serviceMock.registerPhoneFaxOrder.mockResolvedValue(["20001"]);
    const res = await request(app)
      .post("/api/orders/phone-fax")
      .send({
        productDetails: [{ productNo: "P002", purchaseQuantity: 1 }],
        purchaserInfo: {
          name: "佐藤花子",
          address: "大阪府",
          contact: "080-1111-2222",
        },
        paymentMethod: "銀行振込",
        shippingFee: 660,
      });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.orderNos).toContain("20001");
  });

  it("POST /api/orders/phone-fax（異常系: 必須項目不足）", async () => {
    const res = await request(app).post("/api/orders/phone-fax").send({
      productDetails: [],
      purchaserInfo: null,
      paymentMethod: null,
      shippingFee: 660,
    });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe("failure");
  });

  it("GET /api/orders/:orderNo/invoice（正常系）", async () => {
    serviceMock.getInvoice.mockResolvedValue({ invoice: "請求書データ" });
    const res = await request(app).get("/api/orders/10001/invoice");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.invoice).toBeDefined();
  });

  it("GET /api/orders/:orderNo/invoice（異常系: 注文なし）", async () => {
    serviceMock.getInvoice.mockRejectedValue(new Error("注文が見つかりません"));
    const res = await request(app).get("/api/orders/99999/invoice");
    expect(res.status).toBe(404);
    expect(res.body.status).toBe("failure");
  });

  it("GET /api/orders（正常系: 検索結果あり）", async () => {
    prismaMock.orderData.findMany.mockResolvedValue([
      { orderNo: "10001", purchaserName: "山田太郎" },
    ]);
    const res = await request(app).get("/api/orders?orderNo=10001");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.orders.length).toBeGreaterThan(0);
  });

  it("GET /api/orders（正常系: 検索結果なし）", async () => {
    prismaMock.orderData.findMany.mockResolvedValue([]);
    const res = await request(app).get("/api/orders?orderNo=99999");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.orders.length).toBe(0);
  });

  it("PATCH /api/orders/:orderNo/shipping-status（正常系）", async () => {
    (RegisterOrderService.prototype.updateShippingStatus as any) = jest
      .fn()
      .mockResolvedValue(undefined);
    const res = await request(app)
      .patch("/api/orders/10001/shipping-status")
      .send({ status: "発送済" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });

  it("PATCH /api/orders/:orderNo/shipping-status（異常系: status未指定）", async () => {
    const res = await request(app)
      .patch("/api/orders/10001/shipping-status")
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.status).toBe("failure");
  });

  // ブランチカバレッジ向上のための追加テストケース
  describe("ブランチカバレッジ向上", () => {
    it("POST /api/orders/net（異常系: クレジットカード情報不正）", async () => {
      const res = await request(app)
        .post("/api/orders/net")
        .send({
          items: [
            {
              productNo: "P001",
              purchaseQuantity: 1,
            },
          ],
          purchaserName: "テスト太郎",
          purchaserAddress: "東京都",
          purchaserContact: "test@example.com",
          creditCardInfo: {
            cardNumber: "", // 空のカード番号
            expiryDate: "12/25",
            securityCode: "123",
          },
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        status: "failure",
        message: "リクエスト内容が不正です。",
      });
    });

    it("POST /api/orders/net（異常系: クレジットカード有効期限なし）", async () => {
      const res = await request(app)
        .post("/api/orders/net")
        .send({
          items: [
            {
              productNo: "P001",
              purchaseQuantity: 1,
            },
          ],
          purchaserName: "テスト太郎",
          purchaserAddress: "東京都",
          purchaserContact: "test@example.com",
          creditCardInfo: {
            cardNumber: "1234567890123456",
            expiryDate: "", // 空の有効期限
            securityCode: "123",
          },
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        status: "failure",
        message: "リクエスト内容が不正です。",
      });
    });

    it("POST /api/orders/net（異常系: クレジットカードセキュリティコードなし）", async () => {
      const res = await request(app)
        .post("/api/orders/net")
        .send({
          items: [
            {
              productNo: "P001",
              purchaseQuantity: 1,
            },
          ],
          purchaserName: "テスト太郎",
          purchaserAddress: "東京都",
          purchaserContact: "test@example.com",
          creditCardInfo: {
            cardNumber: "1234567890123456",
            expiryDate: "12/25",
            securityCode: "", // 空のセキュリティコード
          },
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        status: "failure",
        message: "リクエスト内容が不正です。",
      });
    });

    it("PATCH /api/orders/:orderNo/payment-status（異常系: サービスエラー）", async () => {
      serviceMock.updatePaymentStatus = jest
        .fn()
        .mockRejectedValue(new Error("データベース接続エラー"));

      const res = await request(app)
        .patch("/api/orders/10001/payment-status")
        .send({ status: "支払済" });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        status: "failure",
        message: "データベース接続エラー",
      });
    });

    it("PATCH /api/orders/:orderNo/shipping-status（異常系: サービスエラー）", async () => {
      serviceMock.updateShippingStatus = jest
        .fn()
        .mockRejectedValue(new Error("発送状態更新エラー"));

      const res = await request(app)
        .patch("/api/orders/10001/shipping-status")
        .send({ status: "発送済" });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        status: "failure",
        message: "発送状態更新エラー",
      });
    });

    it("GET /api/orders（異常系: データベースエラー）", async () => {
      // Prismaのfindmanyメソッドでエラーをシミュレート
      prismaMock.orderData.findMany.mockRejectedValue(
        new Error("データベース接続失敗")
      );

      const res = await request(app).get("/api/orders");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        status: "failure",
        message: "データベース接続失敗",
      });
    });

    it("GET /api/orders（正常系: 各種クエリパラメータでの検索）", async () => {
      const mockOrders = [{ orderNo: "10001", purchaserName: "検索太郎" }];
      prismaMock.orderData.findMany.mockResolvedValue(mockOrders);

      const res = await request(app).get("/api/orders").query({
        orderNo: "10001",
        orderDate: "2024-01-01",
        purchaserName: "検索太郎",
        paymentStatus: "支払済",
        paymentMethod: "クレジットカード",
        shippingStatus: "発送済",
      });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: "success",
        orders: mockOrders,
      });

      // whereクエリの構築が正しく動作したことを確認
      expect(prismaMock.orderData.findMany).toHaveBeenCalledWith({
        where: {
          orderNo: "10001",
          orderDate: new Date("2024-01-01"),
          purchaserName: { contains: "検索太郎" },
          paymentStatus: "支払済",
          paymentMethod: "クレジットカード",
          shippingStatus: "発送済",
        },
        orderBy: { orderDate: "desc" },
      });
    });

    it("POST /api/orders/phone-fax（異常系: サービスエラー）", async () => {
      serviceMock.registerPhoneFaxOrder = jest
        .fn()
        .mockRejectedValue(new Error("注文登録に失敗しました"));

      const res = await request(app)
        .post("/api/orders/phone-fax")
        .send({
          items: [
            {
              productNo: "P001",
              purchaseQuantity: 1,
            },
          ],
          purchaserName: "テスト太郎",
          purchaserAddress: "東京都",
          purchaserContact: "03-1234-5678",
          paymentMethod: "現金",
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        status: "failure",
        message: "リクエスト内容が不正です。",
      });
    });
  });
});
