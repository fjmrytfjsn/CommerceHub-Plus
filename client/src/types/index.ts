/**
 * 商品情報の型定義
 */
export type Product = {
  productNo: string;
  productName: string;
  unitPrice: number;
  stockQuantity2: number;
};

/**
 * カート内商品の型定義
 */
export type CartItem = Product & { quantity: number };

/**
 * 注文情報の型定義
 */
export type Order = {
  orderNo: string;
  orderDate: string;
  purchaserName: string;
  paymentStatus: string;
  shippingStatus: string;
  paymentMethod?: string;
};

/**
 * 購入者情報の型定義
 */
export type PurchaserInfo = {
  name: string;
  address: string;
  contact: string;
};

/**
 * クレジットカード情報の型定義
 */
export type CreditCardInfo = {
  cardNumber: string;
  holderName: string;
  expiryDate: string;
  securityCode: string;
};

/**
 * ユーザーロールの型定義
 */
export type UserRole = "purchaser" | "ordertaker" | "accountant" | "shipping";

/**
 * API レスポンスの基本型
 */
export type ApiResponse<T = unknown> = {
  status: "success" | "error";
  message?: string;
  data?: T;
  orders?: Order[];
  products?: Product[];
};

/**
 * 注文詳細の型定義
 */
export type OrderDetail = {
  productNo: string;
  purchaseQuantity: number;
};

/**
 * ネット注文リクエストの型定義
 */
export type NetOrderRequest = {
  productDetails: OrderDetail[];
  purchaserInfo: PurchaserInfo;
  creditCardInfo: CreditCardInfo;
  shippingFee: number;
};

/**
 * 電話注文リクエストの型定義
 */
export type PhoneOrderRequest = {
  productDetails: OrderDetail[];
  purchaserInfo: PurchaserInfo;
  paymentMethod: string;
};
