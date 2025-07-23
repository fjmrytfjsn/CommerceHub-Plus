import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { RegisterOrderService } from "../application/order/RegisterOrderService";

/**
 * DI対応: prisma, registerOrderServiceを引数で受け取る
 */
export function createOrderRouter(
  prisma: PrismaClient,
  registerOrderService: RegisterOrderService
) {
  const router = Router();

  /**
   * ネット注文登録API
   * POST /api/orders/net
   */
  router.post("/net", async (req: Request, res: Response) => {
    const { productDetails, purchaserInfo, creditCardInfo, shippingFee } =
      req.body;

    // 必須項目チェック
    if (
      !Array.isArray(productDetails) ||
      productDetails.length === 0 ||
      !purchaserInfo ||
      !creditCardInfo ||
      shippingFee !== 660
    ) {
      return res.status(400).json({
        status: "failure",
        message: "リクエスト内容が不正です。",
      });
    }

    // クレジットカード情報の簡易バリデーション（実際の決済連携は省略）
    if (
      !creditCardInfo.cardNumber ||
      !creditCardInfo.holderName ||
      !creditCardInfo.expiryDate ||
      !creditCardInfo.securityCode
    ) {
      return res.status(400).json({
        status: "failure",
        message: "クレジットカード情報が不正です。",
      });
    }

    try {
      // 商品名をDBから取得してユースケースに渡す
      const inputs = await Promise.all(
        productDetails.map(async (item: any) => {
          const product = await prisma.productInventory.findUnique({
            where: { productNo: item.productNo },
          });
          return {
            productNo: item.productNo,
            productName: product?.productName ?? "",
            purchaserName: purchaserInfo.name,
            purchaserAddress: purchaserInfo.address,
            purchaserContact: purchaserInfo.contact,
            purchaseQuantity: item.purchaseQuantity,
          };
        })
      );
      const orderNos = await registerOrderService.registerNetOrder(inputs);
      return res.status(200).json({
        status: "success",
        orderNos,
      });
    } catch (error: any) {
      return res.status(400).json({
        status: "failure",
        message: error.message ?? "注文登録中にエラーが発生しました。",
      });
    }
  });

  /**
   * 支払い状態更新API
   * PATCH /api/orders/:orderNo/payment-status
   */
  router.patch(
    "/:orderNo/payment-status",
    async (req: Request, res: Response) => {
      const { orderNo } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({
          status: "failure",
          message: "支払い状態が指定されていません。",
        });
      }
      try {
        await registerOrderService.updatePaymentStatus(orderNo, status);
        return res.status(200).json({
          status: "success",
          message: "支払い状態を更新しました。",
        });
      } catch (error: any) {
        return res.status(400).json({
          status: "failure",
          message: error.message ?? "支払い状態更新中にエラーが発生しました。",
        });
      }
    }
  );

  /**
   * 発送状態更新API
   * PATCH /api/orders/:orderNo/shipping-status
   */
  router.patch(
    "/:orderNo/shipping-status",
    async (req: Request, res: Response) => {
      const { orderNo } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({
          status: "failure",
          message: "発送状態が指定されていません。",
        });
      }
      try {
        await registerOrderService.updateShippingStatus(orderNo, status);
        return res.status(200).json({
          status: "success",
          message: "発送状態を更新しました。",
        });
      } catch (error: any) {
        return res.status(400).json({
          status: "failure",
          message: error.message ?? "発送状態更新中にエラーが発生しました。",
        });
      }
    }
  );

  /**
   * 納品書データ取得API
   * GET /api/orders/:orderNo/delivery-note
   */
  router.get("/:orderNo/delivery-note", async (req: Request, res: Response) => {
    const { orderNo } = req.params;
    try {
      const note = await registerOrderService.getDeliveryNote(orderNo);
      return res.status(200).json({
        status: "success",
        deliveryNote: note,
      });
    } catch (error: any) {
      return res.status(404).json({
        status: "failure",
        message: error.message ?? "納品書データ取得中にエラーが発生しました。",
      });
    }
  });

  /**
   * 請求書データ取得API
   * GET /api/orders/:orderNo/invoice
   */
  router.get("/:orderNo/invoice", async (req: Request, res: Response) => {
    const { orderNo } = req.params;
    try {
      const invoice = await registerOrderService.getInvoice(orderNo);
      return res.status(200).json({
        status: "success",
        invoice,
      });
    } catch (error: any) {
      return res.status(404).json({
        status: "failure",
        message: error.message ?? "請求書データ取得中にエラーが発生しました。",
      });
    }
  });

  /**
   * 注文検索API
   * GET /api/orders?orderNo=...&orderDate=...&purchaserName=...
   */
  router.get("/", async (req: Request, res: Response) => {
    // 支払い状態・支払い方法・発送状態もクエリで受け取る
    const {
      orderNo,
      orderDate,
      purchaserName,
      paymentStatus,
      paymentMethod,
      shippingStatus,
    } = req.query;
    try {
      const where: any = {};
      if (orderNo) where.orderNo = orderNo;
      if (orderDate) where.orderDate = new Date(orderDate as string);
      if (purchaserName)
        where.purchaserName = { contains: purchaserName as string };
      if (paymentStatus) where.paymentStatus = paymentStatus;
      if (paymentMethod) where.paymentMethod = paymentMethod;
      if (shippingStatus) where.shippingStatus = shippingStatus;
      const orders = await prisma.orderData.findMany({
        where,
        orderBy: { orderDate: "desc" },
      });
      return res.status(200).json({
        status: "success",
        orders,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: "failure",
        message: error.message ?? "注文検索中にエラーが発生しました。",
      });
    }
  });

  /**
   * 電話・FAX注文登録API
   * POST /api/orders/phone-fax
   */
  router.post("/phone-fax", async (req: Request, res: Response) => {
    const { productDetails, purchaserInfo, paymentMethod, shippingFee } =
      req.body;

    // 必須項目チェック
    if (
      !Array.isArray(productDetails) ||
      productDetails.length === 0 ||
      !purchaserInfo ||
      !paymentMethod ||
      shippingFee !== 660
    ) {
      return res.status(400).json({
        status: "failure",
        message: "リクエスト内容が不正です。",
      });
    }

    try {
      // 商品名をDBから取得してユースケースに渡す
      const inputs = await Promise.all(
        productDetails.map(async (item: any) => {
          const product = await prisma.productInventory.findUnique({
            where: { productNo: item.productNo },
          });
          return {
            productNo: item.productNo,
            productName: product?.productName ?? "",
            purchaserName: purchaserInfo.name,
            purchaserAddress: purchaserInfo.address,
            purchaserContact: purchaserInfo.contact,
            purchaseQuantity: item.purchaseQuantity,
            paymentMethod,
          };
        })
      );
      const orderNos = await registerOrderService.registerPhoneFaxOrder(inputs);
      return res.status(200).json({
        status: "success",
        orderNos,
      });
    } catch (error: any) {
      return res.status(400).json({
        status: "failure",
        message: error.message ?? "注文登録中にエラーが発生しました。",
      });
    }
  });

  return router;
}
