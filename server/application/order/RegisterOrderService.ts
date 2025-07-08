import { OrderFactory } from "../../domain/order/OrderFactory";
import { OrderRepository } from "../../infrastructure/OrderRepository";
import { PrismaClient } from "@prisma/client";

type NetOrderInput = {
  productNo: string;
  productName: string;
  purchaserName: string;
  purchaserAddress: string;
  purchaserContact: string;
  purchaseQuantity: number;
};

export class RegisterOrderService {
  private orderRepository: OrderRepository;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.orderRepository = new OrderRepository(prisma);
  }

  async registerNetOrder(inputs: NetOrderInput[]): Promise<string[]> {
    const orderNos: string[] = [];
    for (const input of inputs) {
      // 在庫チェック
      const product = await this.prisma.productInventory.findUnique({
        where: { productNo: input.productNo },
      });
      if (!product) {
        throw new Error(`商品番号 ${input.productNo} は存在しません。`);
      }
      if (product.stockQuantity2 < input.purchaseQuantity) {
        throw new Error(`商品番号 ${input.productNo} の在庫が不足しています。`);
      }
      // エンティティ生成
      const order = OrderFactory.createNetOrder(
        input.productNo,
        input.productName,
        input.purchaserName,
        input.purchaserAddress,
        input.purchaserContact,
        input.purchaseQuantity
      );
      await this.orderRepository.save(order);
      orderNos.push(order.orderNo);
    }
    return orderNos;
  }
}
