import { useState, useCallback } from "react";

type Severity = "success" | "error" | "warning" | "info";

export type NotificationState = {
  open: boolean;
  message: string;
  severity: Severity;
};

/**
 * 通知機能を提供するカスタムフック
 */
export function useNotification() {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: "",
    severity: "info",
  });

  const showNotification = useCallback(
    (message: string, severity: Severity = "info") => {
      setNotification({
        open: true,
        message,
        severity,
      });
    },
    []
  );

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    notification,
    showNotification,
    hideNotification,
  };
}
