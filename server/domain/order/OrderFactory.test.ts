/**
 * OrderFactoryの単体テスト
 * - createNetOrder, createPhoneFaxOrderの生成結果を検証
 */

import { OrderFactory } from "./OrderFactory";
import { Order } from "./Order";

describe("OrderFactory", () => {
  it("createNetOrderで正しいOrderが生成される", () => {
    const order = OrderFactory.createNetOrder(
      "P001",
      "商品A",
      "山田太郎",
      "東京都",
      "090-0000-0000",
      2
    );
    expect(order).toBeInstanceOf(Order);
    expect(order.productNo).toBe("P001");
    expect(order.productName).toBe("商品A");
    expect(order.purchaserName).toBe("山田太郎");
    expect(order.purchaserAddress).toBe("東京都");
    expect(order.purchaserContact).toBe("090-0000-0000");
    expect(order.purchaseQuantity).toBe(2);
    expect(order.paymentMethod).toBe("creditCard");
    expect(order.paymentStatus).toBe("支払済");
    expect(order.shippingStatus).toBe("未発送");
    expect(order.orderNo).toMatch(/^ORD\d+/);
    expect(order.orderDate).toBeInstanceOf(Date);
  });

  it("createPhoneFaxOrderで正しいOrderが生成される", () => {
    const order = OrderFactory.createPhoneFaxOrder(
      "P002",
      "商品B",
      "佐藤花子",
      "大阪府",
      "080-1111-2222",
      1,
      "銀行振込"
    );
    expect(order).toBeInstanceOf(Order);
    expect(order.productNo).toBe("P002");
    expect(order.productName).toBe("商品B");
    expect(order.purchaserName).toBe("佐藤花子");
    expect(order.purchaserAddress).toBe("大阪府");
    expect(order.purchaserContact).toBe("080-1111-2222");
    expect(order.purchaseQuantity).toBe(1);
    expect(order.paymentMethod).toBe("銀行振込");
    expect(order.paymentStatus).toBe("未払い");
    expect(order.shippingStatus).toBe("未発送");
    expect(order.orderNo).toMatch(/^ORD\d+/);
    expect(order.orderDate).toBeInstanceOf(Date);
  });
});
