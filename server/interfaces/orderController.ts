import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { RegisterOrderService } from "../application/order/RegisterOrderService";

const prisma = new PrismaClient();
const router = Router();
const registerOrderService = new RegisterOrderService(prisma);

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
          purchaseQuantity: item.quantity,
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

export default router;
