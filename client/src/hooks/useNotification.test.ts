import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useNotification } from "./useNotification";

describe("useNotification", () => {
  describe("初期状態", () => {
    it("初期状態では通知が閉じている", () => {
      const { result } = renderHook(() => useNotification());

      expect(result.current.notification.open).toBe(false);
      expect(result.current.notification.message).toBe("");
      expect(result.current.notification.severity).toBe("info");
    });
  });

  describe("showNotification", () => {
    it("デフォルトのseverityで通知を表示できる", () => {
      const { result } = renderHook(() => useNotification());

      act(() => {
        result.current.showNotification("テストメッセージ");
      });

      expect(result.current.notification.open).toBe(true);
      expect(result.current.notification.message).toBe("テストメッセージ");
      expect(result.current.notification.severity).toBe("info");
    });

    it("successの通知を表示できる", () => {
      const { result } = renderHook(() => useNotification());

      act(() => {
        result.current.showNotification("成功しました", "success");
      });

      expect(result.current.notification.open).toBe(true);
      expect(result.current.notification.message).toBe("成功しました");
      expect(result.current.notification.severity).toBe("success");
    });

    it("errorの通知を表示できる", () => {
      const { result } = renderHook(() => useNotification());

      act(() => {
        result.current.showNotification("エラーが発生しました", "error");
      });

      expect(result.current.notification.open).toBe(true);
      expect(result.current.notification.message).toBe("エラーが発生しました");
      expect(result.current.notification.severity).toBe("error");
    });

    it("warningの通知を表示できる", () => {
      const { result } = renderHook(() => useNotification());

      act(() => {
        result.current.showNotification("警告メッセージ", "warning");
      });

      expect(result.current.notification.open).toBe(true);
      expect(result.current.notification.message).toBe("警告メッセージ");
      expect(result.current.notification.severity).toBe("warning");
    });

    it("infoの通知を明示的に表示できる", () => {
      const { result } = renderHook(() => useNotification());

      act(() => {
        result.current.showNotification("情報メッセージ", "info");
      });

      expect(result.current.notification.open).toBe(true);
      expect(result.current.notification.message).toBe("情報メッセージ");
      expect(result.current.notification.severity).toBe("info");
    });
  });

  describe("hideNotification", () => {
    it("表示中の通知を非表示にできる", () => {
      const { result } = renderHook(() => useNotification());

      // まず通知を表示
      act(() => {
        result.current.showNotification("テストメッセージ", "success");
      });

      expect(result.current.notification.open).toBe(true);

      // 通知を非表示にする
      act(() => {
        result.current.hideNotification();
      });

      expect(result.current.notification.open).toBe(false);
      // メッセージとseverityは変更されない
      expect(result.current.notification.message).toBe("テストメッセージ");
      expect(result.current.notification.severity).toBe("success");
    });
  });

  describe("複数の通知操作", () => {
    it("連続して異なる通知を表示できる", () => {
      const { result } = renderHook(() => useNotification());

      // 最初の通知
      act(() => {
        result.current.showNotification("最初のメッセージ", "info");
      });

      expect(result.current.notification.message).toBe("最初のメッセージ");
      expect(result.current.notification.severity).toBe("info");

      // 二番目の通知（上書き）
      act(() => {
        result.current.showNotification("二番目のメッセージ", "error");
      });

      expect(result.current.notification.message).toBe("二番目のメッセージ");
      expect(result.current.notification.severity).toBe("error");
      expect(result.current.notification.open).toBe(true);
    });

    it("通知の表示・非表示を繰り返すことができる", () => {
      const { result } = renderHook(() => useNotification());

      // 通知表示
      act(() => {
        result.current.showNotification("メッセージ1", "success");
      });

      expect(result.current.notification.open).toBe(true);

      // 非表示
      act(() => {
        result.current.hideNotification();
      });

      expect(result.current.notification.open).toBe(false);

      // 再度表示
      act(() => {
        result.current.showNotification("メッセージ2", "warning");
      });

      expect(result.current.notification.open).toBe(true);
      expect(result.current.notification.message).toBe("メッセージ2");
      expect(result.current.notification.severity).toBe("warning");
    });
  });

  describe("型安全性", () => {
    it("すべてのseverityタイプが正しく動作する", () => {
      const { result } = renderHook(() => useNotification());

      const severities = ["success", "error", "warning", "info"] as const;

      severities.forEach((severity) => {
        act(() => {
          result.current.showNotification(`${severity}メッセージ`, severity);
        });

        expect(result.current.notification.severity).toBe(severity);
        expect(result.current.notification.message).toBe(
          `${severity}メッセージ`
        );
      });
    });
  });
});
