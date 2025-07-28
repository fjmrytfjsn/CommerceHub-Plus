import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useCart } from "./useCart";
import type { Product } from "../types";

describe("useCart", () => {
  const mockProduct1: Product = {
    productNo: "P001",
    productName: "テスト商品1",
    unitPrice: 1000,
    stockQuantity2: 10,
  };

  const mockProduct2: Product = {
    productNo: "P002",
    productName: "テスト商品2",
    unitPrice: 2000,
    stockQuantity2: 5,
  };

  describe("初期状態", () => {
    it("初期状態では空のカートになっている", () => {
      const { result } = renderHook(() => useCart());

      expect(result.current.cart).toEqual([]);
      expect(result.current.getTotalAmount()).toBe(0);
      expect(result.current.getTotalQuantity()).toBe(0);
    });
  });

  describe("addToCart", () => {
    it("新しい商品をカートに追加できる", () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct1);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0]).toEqual({
        ...mockProduct1,
        quantity: 1,
      });
    });

    it("同じ商品を複数回追加すると数量が増加する", () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.addToCart(mockProduct1);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].quantity).toBe(2);
    });

    it("在庫量を超えて追加しようとしても在庫量でストップする", () => {
      const { result } = renderHook(() => useCart());

      // 在庫量まで追加
      act(() => {
        for (let i = 0; i < mockProduct1.stockQuantity2; i++) {
          result.current.addToCart(mockProduct1);
        }
      });

      expect(result.current.cart[0].quantity).toBe(mockProduct1.stockQuantity2);

      // さらに追加しようとしても数量は変わらない
      act(() => {
        result.current.addToCart(mockProduct1);
      });

      expect(result.current.cart[0].quantity).toBe(mockProduct1.stockQuantity2);
    });

    it("複数の異なる商品を追加できる", () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.addToCart(mockProduct2);
      });

      expect(result.current.cart).toHaveLength(2);
      expect(
        result.current.cart.find((item) => item.productNo === "P001")
      ).toBeDefined();
      expect(
        result.current.cart.find((item) => item.productNo === "P002")
      ).toBeDefined();
    });
  });

  describe("updateCartQuantity", () => {
    it("カート内商品の数量を更新できる", () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.updateCartQuantity("P001", 3);
      });

      expect(result.current.cart[0].quantity).toBe(3);
    });

    it("数量を1未満にしようとすると1になる", () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.updateCartQuantity("P001", 0);
      });

      expect(result.current.cart[0].quantity).toBe(1);

      act(() => {
        result.current.updateCartQuantity("P001", -5);
      });

      expect(result.current.cart[0].quantity).toBe(1);
    });

    it("在庫量を超える数量にしようとすると在庫量になる", () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.updateCartQuantity(
          "P001",
          mockProduct1.stockQuantity2 + 5
        );
      });

      expect(result.current.cart[0].quantity).toBe(mockProduct1.stockQuantity2);
    });

    it("存在しない商品の数量更新は無視される", () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.updateCartQuantity("P999", 5);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].quantity).toBe(1);
    });
  });

  describe("removeFromCart", () => {
    it("指定された商品をカートから削除できる", () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.addToCart(mockProduct2);
        result.current.removeFromCart("P001");
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].productNo).toBe("P002");
    });

    it("存在しない商品IDで削除を試行しても何も起こらない", () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.removeFromCart("P999");
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].productNo).toBe("P001");
    });
  });

  describe("clearCart", () => {
    it("カートを完全にクリアできる", () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.addToCart(mockProduct2);
        result.current.clearCart();
      });

      expect(result.current.cart).toEqual([]);
      expect(result.current.getTotalAmount()).toBe(0);
      expect(result.current.getTotalQuantity()).toBe(0);
    });
  });

  describe("getTotalAmount", () => {
    it("カートの合計金額を正しく計算できる", () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct1); // 1000円 × 1個
        result.current.addToCart(mockProduct2); // 2000円 × 1個
        result.current.updateCartQuantity("P001", 3); // 1000円 × 3個
      });

      // 1000 × 3 + 2000 × 1 = 5000
      expect(result.current.getTotalAmount()).toBe(5000);
    });

    it("空のカートの合計金額は0", () => {
      const { result } = renderHook(() => useCart());

      expect(result.current.getTotalAmount()).toBe(0);
    });
  });

  describe("getShippingFee", () => {
    it("カートに商品がある場合は送料660円を返す", () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct1);
      });

      expect(result.current.getShippingFee()).toBe(660);
    });

    it("カートが空の場合は送料0円を返す", () => {
      const { result } = renderHook(() => useCart());

      expect(result.current.getShippingFee()).toBe(0);
    });
  });

  describe("getTotalAmountWithShipping", () => {
    it("送料込みの合計金額を正しく計算できる", () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct1); // 1000円 × 1個
        result.current.addToCart(mockProduct2); // 2000円 × 1個
        result.current.updateCartQuantity("P001", 3); // 1000円 × 3個
      });

      // 商品合計: 1000 × 3 + 2000 × 1 = 5000
      // 送料: 660円
      // 合計: 5660円
      expect(result.current.getTotalAmountWithShipping()).toBe(5660);
    });

    it("空のカートの送料込み合計金額は0", () => {
      const { result } = renderHook(() => useCart());

      expect(result.current.getTotalAmountWithShipping()).toBe(0);
    });
  });

  describe("getTotalQuantity", () => {
    it("カートの合計数量を正しく計算できる", () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.addToCart(mockProduct2);
        result.current.updateCartQuantity("P001", 3);
        result.current.updateCartQuantity("P002", 2);
      });

      // 3 + 2 = 5
      expect(result.current.getTotalQuantity()).toBe(5);
    });

    it("空のカートの合計数量は0", () => {
      const { result } = renderHook(() => useCart());

      expect(result.current.getTotalQuantity()).toBe(0);
    });
  });

  describe("複合操作のテスト", () => {
    it("商品追加・更新・削除の組み合わせが正しく動作する", () => {
      const { result } = renderHook(() => useCart());

      // 商品追加
      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.addToCart(mockProduct2);
      });

      expect(result.current.cart).toHaveLength(2);
      expect(result.current.getTotalQuantity()).toBe(2);

      // 数量更新
      act(() => {
        result.current.updateCartQuantity("P001", 5);
      });

      expect(result.current.getTotalQuantity()).toBe(6); // 5 + 1

      // 商品削除
      act(() => {
        result.current.removeFromCart("P002");
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.getTotalQuantity()).toBe(5);

      // カートクリア
      act(() => {
        result.current.clearCart();
      });

      expect(result.current.cart).toHaveLength(0);
      expect(result.current.getTotalQuantity()).toBe(0);
      expect(result.current.getTotalAmount()).toBe(0);
    });
  });
});
