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

  /**
   * 電話・FAX注文登録
   * @param inputs NetOrderInput[] & { paymentMethod: string }
   * @returns 注文番号配列
   */
  async registerPhoneFaxOrder(
    inputs: (NetOrderInput & { paymentMethod: string })[]
  ): Promise<string[]> {
    const orderNos: string[] = [];
    for (const input of inputs) {
      // 在庫チェック
      const product = await this.prisma.productInventory.findUnique({
        where: { productNo: input.productNo },
      });
      if (!product) {
        throw new Error(`商品番号 ${input.productNo} は存在しません。`);
      }
      if (
        typeof input.purchaseQuantity !== "number" ||
        input.purchaseQuantity < 1
      ) {
        throw new Error(`商品番号 ${input.productNo} の購入数量が不正です。`);
      }
      if (product.stockQuantity2 < input.purchaseQuantity) {
        throw new Error(`商品番号 ${input.productNo} の在庫が不足しています。`);
      }
      // エンティティ生成（支払い方法を反映）
      const order = OrderFactory.createPhoneFaxOrder(
        input.productNo,
        input.productName,
        input.purchaserName,
        input.purchaserAddress,
        input.purchaserContact,
        input.purchaseQuantity,
        input.paymentMethod
      );
      // 在庫数量2を減算
      await this.prisma.productInventory.update({
        where: { productNo: input.productNo },
        data: {
          stockQuantity2: {
            decrement: input.purchaseQuantity,
          },
        },
      });
      await this.orderRepository.save(order);
      orderNos.push(order.orderNo);
    }
    return orderNos;
  }

  /**
   * 支払い状態を更新する
   * @param orderNo 注文番号
   * @param status 新しい支払い状態
   */
  async updatePaymentStatus(orderNo: string, status: string): Promise<void> {
    const order = await this.orderRepository.findByOrderNo(orderNo);
    if (!order) {
      throw new Error(`注文番号 ${orderNo} の注文が見つかりません。`);
    }
    order.updatePaymentStatus(status);
    await this.orderRepository.save(order);
  }

  /**
   * 発送状態を更新する
   * @param orderNo 注文番号
   * @param status 新しい発送状態
   */
  async updateShippingStatus(orderNo: string, status: string): Promise<void> {
    const order = await this.orderRepository.findByOrderNo(orderNo);
    if (!order) {
      throw new Error(`注文番号 ${orderNo} の注文が見つかりません。`);
    }
    // 発送状態を更新
    const prevStatus = order.shippingStatus;
    order.updateShippingStatus(status);
    await this.orderRepository.save(order);

    // 「発送済」へ遷移した場合のみ在庫数量1を減算・一致させる
    if (prevStatus !== "発送済" && status === "発送済") {
      // 最新の在庫情報を取得し、nullの場合は0をセット
      const prod = await this.prisma.productInventory.findUnique({
        where: { productNo: order.productNo },
      });
      const newStock2 =
        prod && typeof prod.stockQuantity1 === "number"
          ? prod.stockQuantity1 - order.purchaseQuantity
          : 0;
      await this.prisma.productInventory.update({
        where: { productNo: order.productNo },
        data: {
          stockQuantity1: {
            decrement: order.purchaseQuantity,
          },
          stockQuantity2: {
            set: newStock2,
          },
        },
      });
    }
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
      if (
        typeof input.purchaseQuantity !== "number" ||
        input.purchaseQuantity < 1
      ) {
        throw new Error(`商品番号 ${input.productNo} の購入数量が不正です。`);
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
      // 在庫数量2を減算
      await this.prisma.productInventory.update({
        where: { productNo: input.productNo },
        data: {
          stockQuantity2: {
            decrement: input.purchaseQuantity,
          },
        },
      });
      await this.orderRepository.save(order);
      orderNos.push(order.orderNo);
    }
    return orderNos;
  }

  /**
   * 納品書データを取得する
   * @param orderNo 注文番号
   * @returns 納品書情報オブジェクト
   */
  async getDeliveryNote(orderNo: string): Promise<any> {
    const order = await this.orderRepository.findByOrderNo(orderNo);
    if (!order) {
      throw new Error(`注文番号 ${orderNo} の注文が見つかりません。`);
    }
    return order.generateDeliveryNote();
  }

  /**
   * 請求書データを取得する
   * @param orderNo 注文番号
   * @returns 請求書情報オブジェクト
   */
  async getInvoice(orderNo: string): Promise<any> {
    const order = await this.orderRepository.findByOrderNo(orderNo);
    if (!order) {
      throw new Error(`注文番号 ${orderNo} の注文が見つかりません。`);
    }
    return order.generateInvoice();
  }
}
