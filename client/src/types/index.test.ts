import { describe, it, expect } from "vitest";
import type {
  Product,
  CartItem,
  Order,
  PurchaserInfo,
  CreditCardInfo,
  UserRole,
  ApiResponse,
  OrderDetail,
  NetOrderRequest,
  PhoneOrderRequest,
} from "./index";

describe("Type Definitions", () => {
  describe("Product型", () => {
    it("正しいProduct型のオブジェクトを作成できる", () => {
      const product: Product = {
        productNo: "P001",
        productName: "テスト商品",
        unitPrice: 1000,
        stockQuantity2: 50,
      };

      expect(product.productNo).toBe("P001");
      expect(product.productName).toBe("テスト商品");
      expect(product.unitPrice).toBe(1000);
      expect(product.stockQuantity2).toBe(50);
    });
  });

  describe("CartItem型", () => {
    it("正しいCartItem型のオブジェクトを作成できる", () => {
      const cartItem: CartItem = {
        productNo: "P001",
        productName: "テスト商品",
        unitPrice: 1000,
        stockQuantity2: 50,
        quantity: 2,
      };

      expect(cartItem.quantity).toBe(2);
      expect(cartItem.productNo).toBe("P001");
    });
  });

  describe("Order型", () => {
    it("正しいOrder型のオブジェクトを作成できる", () => {
      const order: Order = {
        orderNo: "ORD001",
        orderDate: "2025-07-23",
        purchaserName: "テスト太郎",
        paymentStatus: "未払い",
        shippingStatus: "準備中",
        paymentMethod: "クレジットカード",
      };

      expect(order.orderNo).toBe("ORD001");
      expect(order.purchaserName).toBe("テスト太郎");
      expect(order.paymentMethod).toBe("クレジットカード");
    });

    it("paymentMethodが省略可能である", () => {
      const order: Order = {
        orderNo: "ORD002",
        orderDate: "2025-07-23",
        purchaserName: "テスト花子",
        paymentStatus: "支払済み",
        shippingStatus: "配送済み",
      };

      expect(order.paymentMethod).toBeUndefined();
    });
  });

  describe("PurchaserInfo型", () => {
    it("正しいPurchaserInfo型のオブジェクトを作成できる", () => {
      const purchaserInfo: PurchaserInfo = {
        name: "テスト太郎",
        address: "東京都渋谷区1-1-1",
        contact: "test@example.com",
      };

      expect(purchaserInfo.name).toBe("テスト太郎");
      expect(purchaserInfo.address).toBe("東京都渋谷区1-1-1");
      expect(purchaserInfo.contact).toBe("test@example.com");
    });
  });

  describe("CreditCardInfo型", () => {
    it("正しいCreditCardInfo型のオブジェクトを作成できる", () => {
      const creditCardInfo: CreditCardInfo = {
        cardNumber: "1234-5678-9012-3456",
        holderName: "TEST TARO",
        expiryDate: "12/25",
        securityCode: "123",
      };

      expect(creditCardInfo.cardNumber).toBe("1234-5678-9012-3456");
      expect(creditCardInfo.holderName).toBe("TEST TARO");
      expect(creditCardInfo.expiryDate).toBe("12/25");
      expect(creditCardInfo.securityCode).toBe("123");
    });
  });

  describe("UserRole型", () => {
    it("有効なユーザーロールを使用できる", () => {
      const roles: UserRole[] = [
        "purchaser",
        "ordertaker",
        "accountant",
        "shipping",
      ];

      roles.forEach((role) => {
        expect(typeof role).toBe("string");
      });

      expect(roles).toContain("purchaser");
      expect(roles).toContain("ordertaker");
      expect(roles).toContain("accountant");
      expect(roles).toContain("shipping");
    });
  });

  describe("ApiResponse型", () => {
    it("成功レスポンスの型を作成できる", () => {
      const response: ApiResponse<Product[]> = {
        status: "success",
        message: "商品取得成功",
        data: [
          {
            productNo: "P001",
            productName: "テスト商品",
            unitPrice: 1000,
            stockQuantity2: 50,
          },
        ],
      };

      expect(response.status).toBe("success");
      expect(response.data).toHaveLength(1);
    });

    it("エラーレスポンスの型を作成できる", () => {
      const response: ApiResponse = {
        status: "error",
        message: "エラーが発生しました",
      };

      expect(response.status).toBe("error");
      expect(response.data).toBeUndefined();
    });

    it("orders配列を含むレスポンスを作成できる", () => {
      const response: ApiResponse = {
        status: "success",
        orders: [
          {
            orderNo: "ORD001",
            orderDate: "2025-07-23",
            purchaserName: "テスト太郎",
            paymentStatus: "未払い",
            shippingStatus: "準備中",
          },
        ],
      };

      expect(response.orders).toHaveLength(1);
    });

    it("products配列を含むレスポンスを作成できる", () => {
      const response: ApiResponse = {
        status: "success",
        products: [
          {
            productNo: "P001",
            productName: "テスト商品",
            unitPrice: 1000,
            stockQuantity2: 50,
          },
        ],
      };

      expect(response.products).toHaveLength(1);
    });
  });

  describe("OrderDetail型", () => {
    it("正しいOrderDetail型のオブジェクトを作成できる", () => {
      const orderDetail: OrderDetail = {
        productNo: "P001",
        purchaseQuantity: 3,
      };

      expect(orderDetail.productNo).toBe("P001");
      expect(orderDetail.purchaseQuantity).toBe(3);
    });
  });

  describe("NetOrderRequest型", () => {
    it("正しいNetOrderRequest型のオブジェクトを作成できる", () => {
      const netOrderRequest: NetOrderRequest = {
        productDetails: [
          {
            productNo: "P001",
            purchaseQuantity: 2,
          },
        ],
        purchaserInfo: {
          name: "テスト太郎",
          address: "東京都渋谷区1-1-1",
          contact: "test@example.com",
        },
        creditCardInfo: {
          cardNumber: "1234-5678-9012-3456",
          holderName: "TEST TARO",
          expiryDate: "12/25",
          securityCode: "123",
        },
        shippingFee: 660,
      };

      expect(netOrderRequest.productDetails).toHaveLength(1);
      expect(netOrderRequest.shippingFee).toBe(660);
    });
  });

  describe("PhoneOrderRequest型", () => {
    it("正しいPhoneOrderRequest型のオブジェクトを作成できる", () => {
      const phoneOrderRequest: PhoneOrderRequest = {
        productDetails: [
          {
            productNo: "P001",
            purchaseQuantity: 1,
          },
        ],
        purchaserInfo: {
          name: "テスト花子",
          address: "大阪府大阪市2-2-2",
          contact: "hanako@example.com",
        },
        paymentMethod: "代金引換",
        shippingFee: 660, // 固定の送料
      };

      expect(phoneOrderRequest.productDetails).toHaveLength(1);
      expect(phoneOrderRequest.paymentMethod).toBe("代金引換");
    });
  });
});
