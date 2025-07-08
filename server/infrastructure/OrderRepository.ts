import { PrismaClient } from "@prisma/client";
import { Order } from "../domain/order/Order";

export class OrderRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async save(order: Order): Promise<void> {
    await this.prisma.orderData.create({
      data: {
        orderNo: order.orderNo,
        orderDate: order.orderDate,
        productNo: order.productNo,
        productName: order.productName,
        purchaserName: order.purchaserName,
        purchaserAddress: order.purchaserAddress,
        purchaserContact: order.purchaserContact,
        purchaseQuantity: order.purchaseQuantity,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        shippingStatus: order.shippingStatus,
      },
    });
  }
}
