import { useState, useCallback } from "react";
import type { Product, CartItem } from "../types";

/**
 * カート機能を管理するカスタムフック
 */
export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  // カートに追加
  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const found = prev.find((item) => item.productNo === product.productNo);
      if (found) {
        return prev.map((item) =>
          item.productNo === product.productNo &&
          item.quantity < product.stockQuantity2
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  // カート数量変更
  const updateCartQuantity = useCallback(
    (productNo: string, quantity: number) => {
      setCart((prev) =>
        prev.map((item) =>
          item.productNo === productNo
            ? {
                ...item,
                quantity: Math.max(1, Math.min(quantity, item.stockQuantity2)),
              }
            : item
        )
      );
    },
    []
  );

  // カートから削除
  const removeFromCart = useCallback((productNo: string) => {
    setCart((prev) => prev.filter((item) => item.productNo !== productNo));
  }, []);

  // カートをクリア
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // カートの合計金額を計算
  const getTotalAmount = useCallback(() => {
    return cart.reduce(
      (total, item) => total + item.unitPrice * item.quantity,
      0
    );
  }, [cart]);

  // カートの合計数量を計算
  const getTotalQuantity = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  return {
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    getTotalAmount,
    getTotalQuantity,
  };
}
