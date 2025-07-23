/**
 * OrderRepositoryの単体テスト
 * - save（新規作成・更新）、findByOrderNo（取得）の正常系・異常系を網羅
 */

import { OrderRepository } from "./OrderRepository";
import { Order } from "../domain/order/Order";
import { PrismaClient } from "@prisma/client";

// PrismaClientをモック化
jest.mock("@prisma/client");

describe("OrderRepository", () => {
  let prismaMock: any;
  let repo: OrderRepository;

  const dummyOrder = new Order({
    orderNo: "10001",
    orderDate: new Date("2025-07-22T00:00:00Z"),
    productNo: "P001",
    productName: "商品A",
    purchaserName: "山田太郎",
    purchaserAddress: "東京都",
    purchaserContact: "090-0000-0000",
    purchaseQuantity: 2,
    paymentMethod: "クレジットカード",
    paymentStatus: "未払い",
    shippingStatus: "未発送",
  });

  beforeEach(() => {
    prismaMock = {
      $transaction: jest.fn(),
      orderData: {
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
    };
    repo = new OrderRepository(prismaMock);
  });

  it("save: 新規作成（既存データなし）", async () => {
    prismaMock.$transaction.mockImplementation(async (cb: any) => {
      await cb({
        orderData: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn(),
          update: jest.fn(),
        },
      });
    });
    await expect(repo.save(dummyOrder)).resolves.toBeUndefined();
  });

  it("save: 更新（既存データあり）", async () => {
    prismaMock.$transaction.mockImplementation(async (cb: any) => {
      await cb({
        orderData: {
          findUnique: jest.fn().mockResolvedValue({ orderNo: "10001" }),
          create: jest.fn(),
          update: jest.fn(),
        },
      });
    });
    await expect(repo.save(dummyOrder)).resolves.toBeUndefined();
  });

  it("save: トランザクションエラー", async () => {
    prismaMock.$transaction.mockRejectedValue(new Error("DBエラー"));
    await expect(repo.save(dummyOrder)).rejects.toThrow("DBエラー");
  });

  it("findByOrderNo: 存在する場合はOrderを返す", async () => {
    prismaMock.orderData.findUnique.mockResolvedValue({
      orderNo: "10001",
      orderDate: new Date("2025-07-22T00:00:00Z"),
      productNo: "P001",
      productName: "商品A",
      purchaserName: "山田太郎",
      purchaserAddress: "東京都",
      purchaserContact: "090-0000-0000",
      purchaseQuantity: 2,
      paymentMethod: "クレジットカード",
      paymentStatus: "未払い",
      shippingStatus: "未発送",
    });
    const result = await repo.findByOrderNo("10001");
    expect(result).toBeInstanceOf(Order);
    expect(result?.orderNo).toBe("10001");
  });

  it("findByOrderNo: 存在しない場合はnull", async () => {
    prismaMock.orderData.findUnique.mockResolvedValue(null);
    const result = await repo.findByOrderNo("99999");
    expect(result).toBeNull();
  });

  it("findByOrderNo: DBエラー", async () => {
    prismaMock.orderData.findUnique.mockRejectedValue(new Error("DBエラー"));
    await expect(repo.findByOrderNo("10001")).rejects.toThrow("DBエラー");
  });
});
