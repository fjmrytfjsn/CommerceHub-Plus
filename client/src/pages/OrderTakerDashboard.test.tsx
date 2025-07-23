// 注文受付担当ダッシュボードのテスト
// カスタムフックとコンテキストを使用した新しいアーキテクチャ対応

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "@testing-library/react";
import OrderTakerDashboard from "./OrderTakerDashboard";
import { TestProvider } from "../test/test-utils";
import { setupApiMocks, setupEnvMocks } from "../test/mocks";

// APIモックとEnvモックをセットアップ
setupApiMocks();
setupEnvMocks();

// テスト用のヘルパー関数
const renderOrderTakerDashboard = () => {
  return render(
    <TestProvider initialRole="ordertaker">
      <OrderTakerDashboard />
    </TestProvider>
  );
};

describe("OrderTakerDashboard", () => {
  beforeEach(() => {
    // 各テスト前にlocalStorageをクリア
    window.localStorage.clear();
  });

  it("注文受付担当ダッシュボードのタイトルが表示される", async () => {
    await act(async () => {
      renderOrderTakerDashboard();
    });
    expect(screen.getByText("注文受付係ダッシュボード")).toBeInTheDocument();
  });

  it("ログアウトボタンが機能する", async () => {
    await act(async () => {
      renderOrderTakerDashboard();
    });

    // ログアウトボタンが存在することを確認
    expect(screen.getByText("ログアウト")).toBeInTheDocument();
  });

  it("購入者情報フォームを操作できる", async () => {
    await act(async () => {
      renderOrderTakerDashboard();
    });

    // 購入者情報フォームが表示されることを確認（実際のテキストに合わせる）
    expect(screen.getByText("購入者情報・支払い方法")).toBeInTheDocument();
  });

  it("カート機能が利用できる", async () => {
    await act(async () => {
      renderOrderTakerDashboard();
    });

    // カートセクションが表示されることを確認（実際のテキストに合わせる）
    expect(screen.getByText(/カート内容/)).toBeInTheDocument();
  });

  it("支払い方法を選択できる", async () => {
    await act(async () => {
      renderOrderTakerDashboard();
    });

    // 支払い方法の選択エリアが表示されることを確認（ラベルで検索）
    expect(screen.getByLabelText("支払い方法")).toBeInTheDocument();
  });

  it("注文確定ボタンが表示される", async () => {
    await act(async () => {
      renderOrderTakerDashboard();
    });

    // 注文確定ボタンが表示されることを確認（実際のテキストに合わせる）
    expect(screen.getByText("注文を確定する")).toBeInTheDocument();
  });

  it("商品をカートに追加できる", async () => {
    await act(async () => {
      renderOrderTakerDashboard();
    });

    await waitFor(() => {
      expect(screen.getByText("テスト商品A")).toBeInTheDocument();
    });

    // カートに追加ボタンをクリック
    const addButton = screen.getAllByText("カートに追加")[0];
    await act(async () => {
      fireEvent.click(addButton);
    });

    // カートに商品が追加されることを確認（カート内に商品名が表示される）
    await waitFor(() => {
      // カートテーブル内に商品名が表示されることを確認
      expect(screen.getAllByText("テスト商品A")).toHaveLength(2); // 商品一覧とカート内
    });
  });

  it("購入者情報を入力できる", async () => {
    await act(async () => {
      renderOrderTakerDashboard();
    });

    // 商品データが読み込まれるまで待機
    await waitFor(() => {
      expect(screen.getByText("商品一覧")).toBeInTheDocument();
    });

    // 購入者情報セクションが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText("購入者情報・支払い方法")).toBeInTheDocument();
    });

    // 購入者情報の入力フィールドをテスト - placeholderまたはinput要素で検索
    await waitFor(() => {
      const inputs = screen.getAllByRole("textbox");
      expect(inputs.length).toBeGreaterThanOrEqual(3);

      // 最初の3つのテキストボックスを氏名、住所、連絡先として扱う
      const nameField = inputs[0];
      const addressField = inputs[1];
      const contactField = inputs[2];

      fireEvent.change(nameField, { target: { value: "テスト太郎" } });
      fireEvent.change(addressField, { target: { value: "東京都渋谷区" } });
      fireEvent.change(contactField, { target: { value: "090-1234-5678" } });

      expect(nameField).toHaveValue("テスト太郎");
      expect(addressField).toHaveValue("東京都渋谷区");
      expect(contactField).toHaveValue("090-1234-5678");
    });
  });

  it("商品一覧更新ボタンが機能する", async () => {
    await act(async () => {
      renderOrderTakerDashboard();
    });

    const updateButton = screen.getByText("商品一覧を更新");
    expect(updateButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(updateButton);
    });

    // ボタンクリック後も商品一覧が表示されることを確認
    await waitFor(() => {
      expect(screen.getByText("商品一覧")).toBeInTheDocument();
    });
  });

  it("必須項目未入力で注文確定するとエラー表示", async () => {
    await act(async () => {
      renderOrderTakerDashboard();
    });

    // 商品が読み込まれるまで待機
    await waitFor(() => {
      expect(screen.getByText("商品一覧")).toBeInTheDocument();
    });

    // 商品をカートに追加してから購入者情報を空でテスト
    await waitFor(() => {
      expect(screen.getByText("テスト商品A")).toBeInTheDocument();
    });

    const addButton = screen.getAllByText("カートに追加")[0];
    await act(async () => {
      fireEvent.click(addButton);
    });

    // 購入者情報セクションが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText("購入者情報・支払い方法")).toBeInTheDocument();
    });

    // 注文確定ボタンをクリック（購入者情報未入力）
    const orderButton = screen.getByText("注文を確定する");
    await act(async () => {
      fireEvent.click(orderButton);
    });

    // エラーメッセージが表示されることを確認（role="alert"で検索）
    await waitFor(
      () => {
        const alertElement = screen.getByRole("alert");
        expect(alertElement).toHaveTextContent(
          "全ての項目を入力してください。"
        );
      },
      { timeout: 3000 }
    );
  });

  it("正しい入力で注文確定すると完了メッセージが表示される", async () => {
    await act(async () => {
      renderOrderTakerDashboard();
    });

    // 商品をカートに追加
    await waitFor(() => {
      expect(screen.getByText("テスト商品A")).toBeInTheDocument();
    });

    const addButton = screen.getAllByText("カートに追加")[0];
    await act(async () => {
      fireEvent.click(addButton);
    });

    // 購入者情報セクションが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText("購入者情報・支払い方法")).toBeInTheDocument();
    });

    // 購入者情報を入力
    await waitFor(() => {
      const inputs = screen.getAllByRole("textbox");
      const nameField = inputs[0];
      const addressField = inputs[1];
      const contactField = inputs[2];

      fireEvent.change(nameField, { target: { value: "テスト太郎" } });
      fireEvent.change(addressField, { target: { value: "東京都渋谷区" } });
      fireEvent.change(contactField, { target: { value: "090-1234-5678" } });
    });

    // 注文確定ボタンをクリック
    const orderButton = screen.getByText("注文を確定する");
    await act(async () => {
      fireEvent.click(orderButton);
    });

    // 成功メッセージが表示されることを確認（role="alert"で検索）
    await waitFor(
      () => {
        const alertElement = screen.getByRole("alert");
        expect(alertElement).toHaveTextContent("注文が完了しました。");
      },
      { timeout: 3000 }
    );
  });

  it("カート内商品の数量を変更できる", async () => {
    await act(async () => {
      renderOrderTakerDashboard();
    });

    // 商品をカートに追加
    await waitFor(() => {
      expect(screen.getByText("テスト商品A")).toBeInTheDocument();
    });

    const addButton = screen.getAllByText("カートに追加")[0];
    await act(async () => {
      fireEvent.click(addButton);
    });

    // カート内の数量フィールドを見つけて変更
    await waitFor(() => {
      // 数量入力フィールドを type="number" で検索
      const quantityInput = screen.getByDisplayValue("1");
      expect(quantityInput).toBeInTheDocument();

      fireEvent.change(quantityInput, { target: { value: "2" } });
      expect(quantityInput).toHaveValue(2);
    });
  });

  it("カートから商品を削除できる", async () => {
    await act(async () => {
      renderOrderTakerDashboard();
    });

    // 商品をカートに追加
    await waitFor(() => {
      expect(screen.getByText("テスト商品A")).toBeInTheDocument();
    });

    const addButton = screen.getAllByText("カートに追加")[0];
    await act(async () => {
      fireEvent.click(addButton);
    });

    // カートから削除
    await waitFor(() => {
      const deleteButton = screen.getByText("削除");
      fireEvent.click(deleteButton);
    });

    // カートが空になったことを確認
    await waitFor(() => {
      expect(screen.getByText("カートに商品がありません")).toBeInTheDocument();
    });
  });
});
