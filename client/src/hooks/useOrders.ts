import { useState, useCallback } from "react";
import type { Order, ApiResponse } from "../types";

/**
 * 注文データを取得・管理するカスタムフック
 */
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL as string;

  // 注文検索
  const searchOrders = useCallback(
    async (searchParams: Record<string, string>) => {
      if (!apiUrl) {
        console.warn("VITE_API_URLが設定されていません。");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });

        const response = await fetch(
          `${apiUrl}/api/orders?${params.toString()}`
        );
        const data: ApiResponse = await response.json();

        if (data.status === "success" && Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          setOrders([]);
          setError("注文データの取得に失敗しました");
        }
      } catch (err) {
        setError("ネットワークエラーが発生しました");
        setOrders([]);
        console.error("注文検索エラー:", err);
      } finally {
        setLoading(false);
      }
    },
    [apiUrl]
  );

  // 支払い状態更新
  const updatePaymentStatus = useCallback(
    async (orderNo: string, status: string) => {
      if (!apiUrl) return false;

      try {
        const response = await fetch(
          `${apiUrl}/api/orders/${orderNo}/payment-status`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          }
        );

        const data = await response.json();
        if (data.status === "success") {
          setOrders((prev) =>
            prev.map((order) =>
              order.orderNo === orderNo
                ? { ...order, paymentStatus: status }
                : order
            )
          );
          return true;
        }
        return false;
      } catch (err) {
        console.error("支払い状態更新エラー:", err);
        return false;
      }
    },
    [apiUrl]
  );

  // 発送状態更新
  const updateShippingStatus = useCallback(
    async (orderNo: string, status: string) => {
      if (!apiUrl) return false;

      try {
        const response = await fetch(
          `${apiUrl}/api/orders/${orderNo}/shipping-status`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          }
        );

        const data = await response.json();
        if (data.status === "success") {
          setOrders((prev) =>
            prev.map((order) =>
              order.orderNo === orderNo
                ? { ...order, shippingStatus: status }
                : order
            )
          );
          return true;
        }
        return false;
      } catch (err) {
        console.error("発送状態更新エラー:", err);
        return false;
      }
    },
    [apiUrl]
  );

  return {
    orders,
    loading,
    error,
    searchOrders,
    updatePaymentStatus,
    updateShippingStatus,
  };
}
