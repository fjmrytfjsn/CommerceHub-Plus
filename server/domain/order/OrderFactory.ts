import { Order, OrderProps } from "./Order";

export class OrderFactory {
  static createNetOrder(
    productNo: string,
    productName: string,
    purchaserName: string,
    purchaserAddress: string,
    purchaserContact: string,
    purchaseQuantity: number
  ): Order {
    const orderNo =
      "ORD" +
      Date.now().toString() +
      Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
    const order: OrderProps = {
      orderNo,
      orderDate: new Date(),
      productNo,
      productName,
      purchaserName,
      purchaserAddress,
      purchaserContact,
      purchaseQuantity,
      paymentMethod: "creditCard",
      paymentStatus: "支払済",
      shippingStatus: "未発送",
    };
    return new Order(order);
  }

  static createPhoneFaxOrder(
    productNo: string,
    productName: string,
    purchaserName: string,
    purchaserAddress: string,
    purchaserContact: string,
    purchaseQuantity: number,
    paymentMethod: string
  ): Order {
    const orderNo =
      "ORD" +
      Date.now().toString() +
      Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
    const order: OrderProps = {
      orderNo,
      orderDate: new Date(),
      productNo,
      productName,
      purchaserName,
      purchaserAddress,
      purchaserContact,
      purchaseQuantity,
      paymentMethod,
      paymentStatus: "未払い",
      shippingStatus: "未発送",
    };
    return new Order(order);
  }
}
