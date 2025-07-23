/**
 * RegisterOrderServiceの包括的な単体テスト
 * - 全メソッドの正常系・異常系を網羅
 * - DB操作はモック化し、ビジネスロジックの検証に集中
 */

import { RegisterOrderService } from "./RegisterOrderService";
import { OrderRepository } from "../../infrastructure/OrderRepository";
import { PrismaClient } from "@prisma/client";
import { OrderFactory } from "../../domain/order/OrderFactory";

// モック設定
jest.mock("../../infrastructure/OrderRepository");
jest.mock("@prisma/client");
jest.mock("../../domain/order/OrderFactory");

describe("RegisterOrderService", () => {
  let service: RegisterOrderService;
  let mockPrisma: any;
  let mockRepo: any;

  beforeEach(() => {
    // PrismaClientのモック設定
    mockPrisma = {
      productInventory: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    // OrderRepositoryのモック設定
    mockRepo = {
      save: jest.fn(),
      findByOrderNo: jest.fn(),
    };

    // サービスインスタンス作成
    service = new RegisterOrderService(mockPrisma);
    (service as any).orderRepository = mockRepo;

    jest.clearAllMocks();
  });

  describe("registerNetOrder", () => {
    const validInput = {
      productNo: "P001",
      productName: "商品A",
      purchaserName: "山田太郎",
      purchaserAddress: "東京都渋谷区",
      purchaserContact: "090-0000-0000",
      purchaseQuantity: 2,
    };

    it("正常系: 単一商品の注文登録が成功する", async () => {
      // モック設定
      const mockProduct = {
        productNo: "P001",
        stockQuantity2: 10,
        productName: "商品A",
      };
      const mockOrder = { orderNo: "ORD001" };

      mockPrisma.productInventory.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.productInventory.update.mockResolvedValue({});
      (OrderFactory.createNetOrder as jest.Mock).mockReturnValue(mockOrder);
      mockRepo.save.mockResolvedValue(undefined);

      // テスト実行
      const result = await service.registerNetOrder([validInput]);

      // 結果検証
      expect(result).toEqual(["ORD001"]);
      expect(mockPrisma.productInventory.findUnique).toHaveBeenCalledWith({
        where: { productNo: "P001" },
      });
      expect(mockPrisma.productInventory.update).toHaveBeenCalledWith({
        where: { productNo: "P001" },
        data: {
          stockQuantity2: {
            decrement: 2,
          },
        },
      });
      expect(OrderFactory.createNetOrder).toHaveBeenCalledWith(
        "P001",
        "商品A",
        "山田太郎",
        "東京都渋谷区",
        "090-0000-0000",
        2
      );
      expect(mockRepo.save).toHaveBeenCalledWith(mockOrder);
    });

    it("正常系: 複数商品の注文登録が成功する", async () => {
      const inputs = [
        { ...validInput, productNo: "P001" },
        {
          ...validInput,
          productNo: "P002",
          productName: "商品B",
          purchaseQuantity: 1,
        },
      ];

      const mockProducts = [
        { productNo: "P001", stockQuantity2: 10 },
        { productNo: "P002", stockQuantity2: 5 },
      ];
      const mockOrders = [{ orderNo: "ORD001" }, { orderNo: "ORD002" }];

      mockPrisma.productInventory.findUnique
        .mockResolvedValueOnce(mockProducts[0])
        .mockResolvedValueOnce(mockProducts[1]);
      mockPrisma.productInventory.update.mockResolvedValue({});
      (OrderFactory.createNetOrder as jest.Mock)
        .mockReturnValueOnce(mockOrders[0])
        .mockReturnValueOnce(mockOrders[1]);
      mockRepo.save.mockResolvedValue(undefined);

      const result = await service.registerNetOrder(inputs);

      expect(result).toEqual(["ORD001", "ORD002"]);
      expect(mockPrisma.productInventory.findUnique).toHaveBeenCalledTimes(2);
      expect(mockPrisma.productInventory.update).toHaveBeenCalledTimes(2);
      expect(mockRepo.save).toHaveBeenCalledTimes(2);
    });

    it("異常系: 商品が存在しない場合はエラー", async () => {
      mockPrisma.productInventory.findUnique.mockResolvedValue(null);

      await expect(service.registerNetOrder([validInput])).rejects.toThrow(
        "商品番号 P001 は存在しません。"
      );
      expect(mockPrisma.productInventory.update).not.toHaveBeenCalled();
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it("異常系: 在庫不足の場合はエラー", async () => {
      const mockProduct = {
        productNo: "P001",
        stockQuantity2: 1,
        productName: "商品A",
      };
      mockPrisma.productInventory.findUnique.mockResolvedValue(mockProduct);

      await expect(service.registerNetOrder([validInput])).rejects.toThrow(
        "商品番号 P001 の在庫が不足しています。"
      );
      expect(mockPrisma.productInventory.update).not.toHaveBeenCalled();
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it("異常系: 購入数量が0以下の場合はエラー", async () => {
      const invalidInput = {
        ...validInput,
        purchaseQuantity: 0,
        productNo: "P999",
      };

      // 商品が存在しないため、先に商品存在エラーが発生
      mockPrisma.productInventory.findUnique.mockResolvedValue(null);

      await expect(service.registerNetOrder([invalidInput])).rejects.toThrow(
        "商品番号 P999 は存在しません。"
      );
      expect(mockPrisma.productInventory.update).not.toHaveBeenCalled();
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it("異常系: 商品が存在するが購入数量が0の場合はエラー", async () => {
      const invalidInput = { ...validInput, purchaseQuantity: 0 };

      // 商品は存在するが、数量が不正
      const mockProduct = {
        productNo: "P001",
        stockQuantity2: 10,
        productName: "商品A",
      };
      mockPrisma.productInventory.findUnique.mockResolvedValue(mockProduct);

      await expect(service.registerNetOrder([invalidInput])).rejects.toThrow(
        "商品番号 P001 の購入数量が不正です。"
      );
      expect(mockPrisma.productInventory.update).not.toHaveBeenCalled();
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it("異常系: 購入数量が数値でない場合はエラー", async () => {
      const invalidInput = {
        ...validInput,
        purchaseQuantity: "abc" as any,
        productNo: "P999",
      };

      // 商品が存在しないため、先に商品存在エラーが発生
      mockPrisma.productInventory.findUnique.mockResolvedValue(null);

      await expect(service.registerNetOrder([invalidInput])).rejects.toThrow(
        "商品番号 P999 は存在しません。"
      );
      expect(mockPrisma.productInventory.update).not.toHaveBeenCalled();
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it("異常系: 商品が存在するが購入数量が文字列の場合はエラー", async () => {
      const invalidInput = { ...validInput, purchaseQuantity: "abc" as any };

      // 商品は存在するが、数量が不正
      const mockProduct = {
        productNo: "P001",
        stockQuantity2: 10,
        productName: "商品A",
      };
      mockPrisma.productInventory.findUnique.mockResolvedValue(mockProduct);

      await expect(service.registerNetOrder([invalidInput])).rejects.toThrow(
        "商品番号 P001 の購入数量が不正です。"
      );
      expect(mockPrisma.productInventory.update).not.toHaveBeenCalled();
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it("異常系: 複数商品のうち1つで失敗した場合", async () => {
      const inputs = [
        { ...validInput, productNo: "P001" },
        { ...validInput, productNo: "P002", productName: "商品B" },
      ];

      mockPrisma.productInventory.findUnique
        .mockResolvedValueOnce({ productNo: "P001", stockQuantity2: 10 })
        .mockResolvedValueOnce(null); // P002が存在しない

      await expect(service.registerNetOrder(inputs)).rejects.toThrow(
        "商品番号 P002 は存在しません。"
      );
    });
  });

  describe("registerPhoneFaxOrder", () => {
    const validInput = {
      productNo: "P001",
      productName: "商品A",
      purchaserName: "山田太郎",
      purchaserAddress: "東京都渋谷区",
      purchaserContact: "090-0000-0000",
      purchaseQuantity: 2,
      paymentMethod: "現金",
    };

    it("正常系: 電話・FAX注文登録が成功する", async () => {
      const mockProduct = {
        productNo: "P001",
        stockQuantity2: 10,
        productName: "商品A",
      };
      const mockOrder = { orderNo: "ORD001" };

      mockPrisma.productInventory.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.productInventory.update.mockResolvedValue({});
      (OrderFactory.createPhoneFaxOrder as jest.Mock).mockReturnValue(
        mockOrder
      );
      mockRepo.save.mockResolvedValue(undefined);

      const result = await service.registerPhoneFaxOrder([validInput]);

      expect(result).toEqual(["ORD001"]);
      expect(OrderFactory.createPhoneFaxOrder).toHaveBeenCalledWith(
        "P001",
        "商品A",
        "山田太郎",
        "東京都渋谷区",
        "090-0000-0000",
        2,
        "現金"
      );
    });

    it("異常系: 支払い方法が未指定の場合", async () => {
      const invalidInput = { ...validInput };
      delete (invalidInput as any).paymentMethod;

      const mockProduct = { productNo: "P001", stockQuantity2: 10 };
      mockPrisma.productInventory.findUnique.mockResolvedValue(mockProduct);

      // paymentMethodがundefinedでも処理は継続される（OrderFactoryが処理）
      const mockOrder = { orderNo: "ORD001" };
      (OrderFactory.createPhoneFaxOrder as jest.Mock).mockReturnValue(
        mockOrder
      );
      mockRepo.save.mockResolvedValue(undefined);

      const result = await service.registerPhoneFaxOrder([invalidInput]);
      expect(result).toEqual(["ORD001"]);
    });
  });

  describe("updatePaymentStatus", () => {
    const mockOrder = {
      orderNo: "ORD001",
      updatePaymentStatus: jest.fn(),
    };

    it("正常系: 支払い状態の更新が成功する", async () => {
      mockRepo.findByOrderNo.mockResolvedValue(mockOrder);
      mockRepo.save.mockResolvedValue(undefined);

      await service.updatePaymentStatus("ORD001", "支払済");

      expect(mockRepo.findByOrderNo).toHaveBeenCalledWith("ORD001");
      expect(mockOrder.updatePaymentStatus).toHaveBeenCalledWith("支払済");
      expect(mockRepo.save).toHaveBeenCalledWith(mockOrder);
    });

    it("異常系: 注文が存在しない場合はエラー", async () => {
      mockRepo.findByOrderNo.mockResolvedValue(null);

      await expect(
        service.updatePaymentStatus("ORD999", "支払済")
      ).rejects.toThrow("注文番号 ORD999 の注文が見つかりません。");

      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it("正常系: 様々な支払い状態に更新可能", async () => {
      const statuses = ["未払い", "支払済", "キャンセル"];

      for (const status of statuses) {
        mockRepo.findByOrderNo.mockResolvedValue(mockOrder);
        mockRepo.save.mockResolvedValue(undefined);
        mockOrder.updatePaymentStatus.mockClear();

        await service.updatePaymentStatus("ORD001", status);

        expect(mockOrder.updatePaymentStatus).toHaveBeenCalledWith(status);
      }
    });
  });

  describe("updateShippingStatus", () => {
    const mockOrder = {
      orderNo: "ORD001",
      productNo: "P001",
      purchaseQuantity: 2,
      shippingStatus: "未発送",
      updateShippingStatus: jest.fn(),
    };

    it("正常系: 発送状態の更新が成功する（発送済以外）", async () => {
      mockRepo.findByOrderNo.mockResolvedValue(mockOrder);
      mockRepo.save.mockResolvedValue(undefined);

      await service.updateShippingStatus("ORD001", "発送準備中");

      expect(mockRepo.findByOrderNo).toHaveBeenCalledWith("ORD001");
      expect(mockOrder.updateShippingStatus).toHaveBeenCalledWith("発送準備中");
      expect(mockRepo.save).toHaveBeenCalledWith(mockOrder);
      // 発送済でないため在庫調整は行われない
      expect(mockPrisma.productInventory.findUnique).not.toHaveBeenCalled();
    });

    it("正常系: 発送済に更新すると在庫調整が実行される", async () => {
      const orderWithStatus = { ...mockOrder, shippingStatus: "発送準備中" };
      mockRepo.findByOrderNo.mockResolvedValue(orderWithStatus);
      mockRepo.save.mockResolvedValue(undefined);

      const mockProduct = {
        productNo: "P001",
        stockQuantity1: 10,
        stockQuantity2: 8,
      };
      mockPrisma.productInventory.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.productInventory.update.mockResolvedValue({});

      await service.updateShippingStatus("ORD001", "発送済");

      expect(mockPrisma.productInventory.findUnique).toHaveBeenCalledWith({
        where: { productNo: "P001" },
      });
      expect(mockPrisma.productInventory.update).toHaveBeenCalledWith({
        where: { productNo: "P001" },
        data: {
          stockQuantity1: {
            decrement: 2,
          },
          stockQuantity2: {
            set: 8, // stockQuantity1 - purchaseQuantity = 10 - 2
          },
        },
      });
    });

    it("正常系: 既に発送済の注文を再度発送済にしても在庫調整は実行されない", async () => {
      const shippedOrder = { ...mockOrder, shippingStatus: "発送済" };
      mockRepo.findByOrderNo.mockResolvedValue(shippedOrder);
      mockRepo.save.mockResolvedValue(undefined);

      await service.updateShippingStatus("ORD001", "発送済");

      // 発送済から発送済への変更のため在庫調整は実行されない
      expect(mockPrisma.productInventory.findUnique).not.toHaveBeenCalled();
      expect(mockPrisma.productInventory.update).not.toHaveBeenCalled();
    });

    it("正常系: 商品が存在しない場合でも在庫数量を0にセット", async () => {
      const orderWithStatus = { ...mockOrder, shippingStatus: "発送準備中" };
      mockRepo.findByOrderNo.mockResolvedValue(orderWithStatus);
      mockRepo.save.mockResolvedValue(undefined);

      mockPrisma.productInventory.findUnique.mockResolvedValue(null);
      mockPrisma.productInventory.update.mockResolvedValue({});

      await service.updateShippingStatus("ORD001", "発送済");

      expect(mockPrisma.productInventory.update).toHaveBeenCalledWith({
        where: { productNo: "P001" },
        data: {
          stockQuantity1: {
            decrement: 2,
          },
          stockQuantity2: {
            set: 0, // 商品が存在しない場合は0
          },
        },
      });
    });

    it("正常系: stockQuantity1がnullの場合でも在庫数量を0にセット", async () => {
      const orderWithStatus = { ...mockOrder, shippingStatus: "発送準備中" };
      mockRepo.findByOrderNo.mockResolvedValue(orderWithStatus);
      mockRepo.save.mockResolvedValue(undefined);

      const mockProduct = {
        productNo: "P001",
        stockQuantity1: null,
        stockQuantity2: 8,
      };
      mockPrisma.productInventory.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.productInventory.update.mockResolvedValue({});

      await service.updateShippingStatus("ORD001", "発送済");

      expect(mockPrisma.productInventory.update).toHaveBeenCalledWith({
        where: { productNo: "P001" },
        data: {
          stockQuantity1: {
            decrement: 2,
          },
          stockQuantity2: {
            set: 0, // stockQuantity1がnullの場合は0
          },
        },
      });
    });

    it("異常系: 注文が存在しない場合はエラー", async () => {
      mockRepo.findByOrderNo.mockResolvedValue(null);

      await expect(
        service.updateShippingStatus("ORD999", "発送済")
      ).rejects.toThrow("注文番号 ORD999 の注文が見つかりません。");

      expect(mockRepo.save).not.toHaveBeenCalled();
      expect(mockPrisma.productInventory.findUnique).not.toHaveBeenCalled();
    });
  });

  describe("getDeliveryNote", () => {
    it("正常系: 納品書データを正常に取得できる", async () => {
      const mockOrder = {
        orderNo: "ORD001",
        generateDeliveryNote: jest.fn().mockReturnValue({
          orderNo: "ORD001",
          deliveryDate: "2024-01-01",
          items: [{ productName: "商品A", quantity: 2 }],
        }),
      };
      mockRepo.findByOrderNo.mockResolvedValue(mockOrder);

      const result = await service.getDeliveryNote("ORD001");

      expect(mockRepo.findByOrderNo).toHaveBeenCalledWith("ORD001");
      expect(mockOrder.generateDeliveryNote).toHaveBeenCalled();
      expect(result).toEqual({
        orderNo: "ORD001",
        deliveryDate: "2024-01-01",
        items: [{ productName: "商品A", quantity: 2 }],
      });
    });

    it("異常系: 注文が存在しない場合はエラー", async () => {
      mockRepo.findByOrderNo.mockResolvedValue(null);

      await expect(service.getDeliveryNote("ORD999")).rejects.toThrow(
        "注文番号 ORD999 の注文が見つかりません。"
      );
    });
  });

  describe("getInvoice", () => {
    it("正常系: 請求書データを正常に取得できる", async () => {
      const mockOrder = {
        orderNo: "ORD001",
        generateInvoice: jest.fn().mockReturnValue({
          orderNo: "ORD001",
          invoiceDate: "2024-01-01",
          totalAmount: 5000,
          items: [{ productName: "商品A", price: 2500, quantity: 2 }],
        }),
      };
      mockRepo.findByOrderNo.mockResolvedValue(mockOrder);

      const result = await service.getInvoice("ORD001");

      expect(mockRepo.findByOrderNo).toHaveBeenCalledWith("ORD001");
      expect(mockOrder.generateInvoice).toHaveBeenCalled();
      expect(result).toEqual({
        orderNo: "ORD001",
        invoiceDate: "2024-01-01",
        totalAmount: 5000,
        items: [{ productName: "商品A", price: 2500, quantity: 2 }],
      });
    });

    it("異常系: 注文が存在しない場合はエラー", async () => {
      mockRepo.findByOrderNo.mockResolvedValue(null);

      await expect(service.getInvoice("ORD999")).rejects.toThrow(
        "注文番号 ORD999 の注文が見つかりません。"
      );
    });
  });

  describe("エラーハンドリング統合テスト", () => {
    it("データベースエラーが適切に伝播される", async () => {
      const dbError = new Error("Database connection lost");
      mockPrisma.productInventory.findUnique.mockRejectedValue(dbError);

      await expect(
        service.registerNetOrder([
          {
            productNo: "P001",
            productName: "商品A",
            purchaserName: "山田太郎",
            purchaserAddress: "東京都",
            purchaserContact: "090-0000-0000",
            purchaseQuantity: 1,
          },
        ])
      ).rejects.toThrow("Database connection lost");
    });

    it("リポジトリエラーが適切に伝播される", async () => {
      const repoError = new Error("Repository save failed");
      mockRepo.findByOrderNo.mockRejectedValue(repoError);

      await expect(
        service.updatePaymentStatus("ORD001", "支払済")
      ).rejects.toThrow("Repository save failed");
    });
  });
});
