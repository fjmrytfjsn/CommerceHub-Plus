export type OrderProps = {
  orderNo: string;
  orderDate: Date;
  productNo: string;
  productName: string;
  purchaserName: string;
  purchaserAddress: string;
  purchaserContact: string;
  purchaseQuantity: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingStatus: string;
};

export class Order {
  private props: OrderProps;

  constructor(props: OrderProps) {
    this.props = props;
  }

  get orderNo() {
    return this.props.orderNo;
  }
  get orderDate() {
    return this.props.orderDate;
  }
  get productNo() {
    return this.props.productNo;
  }
  get productName() {
    return this.props.productName;
  }
  get purchaserName() {
    return this.props.purchaserName;
  }
  get purchaserAddress() {
    return this.props.purchaserAddress;
  }
  get purchaserContact() {
    return this.props.purchaserContact;
  }
  get purchaseQuantity() {
    return this.props.purchaseQuantity;
  }
  get paymentMethod() {
    return this.props.paymentMethod;
  }
  get paymentStatus() {
    return this.props.paymentStatus;
  }
  get shippingStatus() {
    return this.props.shippingStatus;
  }

  // ドメインロジック（例：支払い状態・発送状態の遷移など）をここに追加

  /**
   * 支払い状態を更新する
   * @param status 新しい支払い状態
   */
  updatePaymentStatus(status: string) {
    this.props.paymentStatus = status;
  }

  /**
   * 発送状態を更新する
   * @param status 新しい発送状態
   */
  updateShippingStatus(status: string) {
    this.props.shippingStatus = status;
  }

  /**
   * 納品書データを生成する
   * @returns 納品書情報オブジェクト
   */
  generateDeliveryNote() {
    return {
      注文番号: this.props.orderNo,
      注文日: this.props.orderDate,
      購入者氏名: this.props.purchaserName,
      購入者住所: this.props.purchaserAddress,
      商品番号: this.props.productNo,
      商品名: this.props.productName,
      数量: this.props.purchaseQuantity,
      支払い方法: this.props.paymentMethod,
      支払い状態: this.props.paymentStatus,
      発送状態: this.props.shippingStatus,
    };
  }

  /**
   * 請求書データを生成する
   * @returns 請求書情報オブジェクト
   */
  generateInvoice() {
    return {
      注文番号: this.props.orderNo,
      注文日: this.props.orderDate,
      購入者氏名: this.props.purchaserName,
      購入者住所: this.props.purchaserAddress,
      商品番号: this.props.productNo,
      商品名: this.props.productName,
      数量: this.props.purchaseQuantity,
      支払い方法: this.props.paymentMethod,
      支払い状態: this.props.paymentStatus,
      発送状態: this.props.shippingStatus,
      // 追加項目があればここに記載
    };
  }
}
