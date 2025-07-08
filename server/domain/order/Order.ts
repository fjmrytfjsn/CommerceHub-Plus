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
}
