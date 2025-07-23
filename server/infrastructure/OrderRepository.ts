import { PrismaClient } from "@prisma/client";
import { Order } from "../domain/order/Order";

export class OrderRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * 注文データを保存（既存なら更新、なければ新規作成）
   * 排他制御のためトランザクションを利用
   */
  async save(order: Order): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.orderData.findUnique({
        where: { orderNo: order.orderNo },
      });
      if (existing) {
        await tx.orderData.update({
          where: { orderNo: order.orderNo },
          data: {
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
      } else {
        await tx.orderData.create({
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
    });
  }

  /**
   * 注文番号で注文を取得する
   * @param orderNo 注文番号
   * @returns Orderエンティティまたはnull
   */
  async findByOrderNo(orderNo: string): Promise<Order | null> {
    const data = await this.prisma.orderData.findUnique({
      where: { orderNo },
    });
    if (!data) {
      return null;
    }
    return new Order({
      orderNo: data.orderNo,
      orderDate: data.orderDate,
      productNo: data.productNo,
      productName: data.productName,
      purchaserName: data.purchaserName,
      purchaserAddress: data.purchaserAddress,
      purchaserContact: data.purchaserContact,
      purchaseQuantity: data.purchaseQuantity,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus,
      shippingStatus: data.shippingStatus,
    });
  }
}
