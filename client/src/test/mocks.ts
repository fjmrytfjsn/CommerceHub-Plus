import { vi } from "vitest";

/**
 * API関連のモック設定
 */
export const setupApiMocks = () => {
  global.fetch = vi.fn((url) => {
    const urlString = typeof url === "string" ? url : url.toString();

    // 商品一覧API
    if (urlString.includes("/api/products")) {
      return Promise.resolve({
        json: async () => ({
          status: "success",
          products: [
            {
              productNo: "P001",
              productName: "テスト商品A",
              unitPrice: 1000,
              stockQuantity2: 5,
            },
            {
              productNo: "P002",
              productName: "テスト商品B",
              unitPrice: 2000,
              stockQuantity2: 3,
            },
          ],
        }),
      });
    }

    // ネット注文API
    if (urlString.includes("/api/orders/net")) {
      return Promise.resolve({
        json: async () => ({
          status: "success",
          message: "注文が完了しました",
        }),
      });
    }

    // 電話注文API
    if (urlString.includes("/api/orders/phone")) {
      return Promise.resolve({
        json: async () => ({
          status: "success",
          message: "注文が完了しました",
        }),
      });
    }

    // 注文検索API
    if (urlString.includes("/api/orders")) {
      return Promise.resolve({
        json: async () => ({
          status: "success",
          orders: [
            {
              orderNo: "ORD001",
              orderDate: "2024-01-01",
              purchaserName: "テスト太郎",
              paymentStatus: "未払い",
              shippingStatus: "未発送",
              paymentMethod: "銀行振込",
            },
          ],
        }),
      });
    }

    // 支払い状態更新API
    if (urlString.includes("/payment-status")) {
      return Promise.resolve({
        json: async () => ({
          status: "success",
        }),
      });
    }

    // 発送状態更新API
    if (urlString.includes("/shipping-status")) {
      return Promise.resolve({
        json: async () => ({
          status: "success",
        }),
      });
    }

    // デフォルト
    return Promise.resolve({
      json: async () => ({ status: "error", message: "Not found" }),
    });
  }) as unknown as typeof fetch;
};

/**
 * 環境変数のモック
 */
export const setupEnvMocks = () => {
  // @ts-expect-error - テスト用のモック
  import.meta.env = {
    ...import.meta.env,
    VITE_API_URL: "http://localhost:3000",
  };
};

/**
 * localStorage のモック
 */
export const setupLocalStorageMocks = () => {
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };

  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });

  return localStorageMock;
};
