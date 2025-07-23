import { useState, useCallback } from "react";
import type { Product, ApiResponse } from "../types";

/**
 * 商品データを取得・管理するカスタムフック
 */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL as string;

  // 商品一覧取得関数
  const fetchProducts = useCallback(async () => {
    if (!apiUrl) {
      console.warn(
        "VITE_API_URLが設定されていません。client/.envファイルにVITE_API_URLを定義し、Viteサーバーを再起動してください。"
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/api/products`);
      const data: ApiResponse = await response.json();

      if (data.status === "success" && Array.isArray(data.products)) {
        setProducts(
          data.products.map((p: Product) => ({
            productNo: p.productNo,
            productName: p.productName,
            unitPrice: typeof p.unitPrice === "number" ? p.unitPrice : 0,
            stockQuantity2:
              typeof p.stockQuantity2 === "number" ? p.stockQuantity2 : 0,
          }))
        );
      } else {
        setError("商品データの取得に失敗しました");
      }
    } catch (err) {
      setError("ネットワークエラーが発生しました");
      console.error("商品取得エラー:", err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  return {
    products,
    loading,
    error,
    fetchProducts,
  };
}
