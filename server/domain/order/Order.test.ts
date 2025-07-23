/**
 * Orderドメインモデルの単体テスト
 * - プロパティ取得、状態遷移、納品書・請求書生成の正常系・異常系
 */

import { Order, OrderProps } from "./Order";

describe("Order", () => {
  let props: OrderProps;
  let order: Order;

  beforeEach(() => {
    props = {
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
    };
    order = new Order(props);
  });

  it("プロパティ取得が正しい", () => {
    expect(order.orderNo).toBe("10001");
    expect(order.productName).toBe("商品A");
    expect(order.purchaserName).toBe("山田太郎");
    expect(order.purchaseQuantity).toBe(2);
    expect(order.paymentStatus).toBe("未払い");
    expect(order.shippingStatus).toBe("未発送");
  });

  it("支払い状態を更新できる", () => {
    order.updatePaymentStatus("支払済");
    expect(order.paymentStatus).toBe("支払済");
  });

  it("発送状態を更新できる", () => {
    order.updateShippingStatus("発送済");
    expect(order.shippingStatus).toBe("発送済");
  });

  it("納品書データを正しく生成できる", () => {
    const note = order.generateDeliveryNote();
    expect(note.注文番号).toBe("10001");
    expect(note.購入者氏名).toBe("山田太郎");
    expect(note.商品名).toBe("商品A");
    expect(note.数量).toBe(2);
    expect(note.支払い状態).toBe("未払い");
    expect(note.発送状態).toBe("未発送");
  });

  it("請求書データを正しく生成できる", () => {
    const invoice = order.generateInvoice();
    expect(invoice.注文番号).toBe("10001");
    expect(invoice.購入者氏名).toBe("山田太郎");
    expect(invoice.商品名).toBe("商品A");
    expect(invoice.数量).toBe(2);
    expect(invoice.支払い状態).toBe("未払い");
    expect(invoice.発送状態).toBe("未発送");
  });

  it("異常系: 不正な支払い状態でも例外は投げない", () => {
    order.updatePaymentStatus("不明な状態");
    expect(order.paymentStatus).toBe("不明な状態");
  });

  it("異常系: 不正な発送状態でも例外は投げない", () => {
    order.updateShippingStatus("不明な状態");
    expect(order.shippingStatus).toBe("不明な状態");
  });
});
