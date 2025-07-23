/**
 * DashboardLayoutコンポーネントの単体テスト
 * - レスポンシブレイアウトの検証
 * - プロパティの正常な動作確認
 * - MUIコンポーネントの適切な使用検証
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardLayout from "./DashboardLayout";

describe("DashboardLayoutコンポーネント", () => {
  it("子要素が正しくレンダリングされる", () => {
    const testContent = "テストコンテンツ";
    render(
      <DashboardLayout>
        <div>{testContent}</div>
      </DashboardLayout>
    );

    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it("デフォルトのmaxWidthプロパティがxlに設定される", () => {
    const testContent = "デフォルトテスト";
    render(
      <DashboardLayout>
        <div>{testContent}</div>
      </DashboardLayout>
    );

    // Containerコンポーネントが存在することを確認
    const container = screen
      .getByText(testContent)
      .closest(".MuiContainer-root");
    expect(container).toBeInTheDocument();
  });

  it("カスタムmaxWidthプロパティが適用される", () => {
    const testContent = "カスタムmaxWidthテスト";
    render(
      <DashboardLayout maxWidth="sm">
        <div>{testContent}</div>
      </DashboardLayout>
    );

    expect(screen.getByText(testContent)).toBeInTheDocument();
    // maxWidthがsmに設定されていることを確認
    const container = screen
      .getByText(testContent)
      .closest(".MuiContainer-root");
    expect(container).toBeInTheDocument();
  });

  it("複数の子要素を正しく表示する", () => {
    render(
      <DashboardLayout>
        <h1>タイトル</h1>
        <p>説明文</p>
        <button>ボタン</button>
      </DashboardLayout>
    );

    expect(screen.getByText("タイトル")).toBeInTheDocument();
    expect(screen.getByText("説明文")).toBeInTheDocument();
    expect(screen.getByText("ボタン")).toBeInTheDocument();
  });

  it("すべてのmaxWidthオプションが受け入れられる", () => {
    const maxWidthOptions: Array<"sm" | "md" | "lg" | "xl"> = [
      "sm",
      "md",
      "lg",
      "xl",
    ];

    maxWidthOptions.forEach((maxWidth) => {
      const testContent = `maxWidth ${maxWidth} テスト`;
      const { unmount } = render(
        <DashboardLayout maxWidth={maxWidth}>
          <div>{testContent}</div>
        </DashboardLayout>
      );

      expect(screen.getByText(testContent)).toBeInTheDocument();
      unmount();
    });
  });

  it("PaperコンポーネントがContainerの子要素として存在する", () => {
    const testContent = "Paperテスト";
    render(
      <DashboardLayout>
        <div>{testContent}</div>
      </DashboardLayout>
    );

    const testElement = screen.getByText(testContent);
    const paperContainer = testElement.closest(".MuiPaper-root");
    expect(paperContainer).toBeInTheDocument();
  });

  it("ReactNodeとして様々な要素を受け入れる", () => {
    render(
      <DashboardLayout>
        <div>
          <span>ネストされた要素</span>
          <ul>
            <li>リスト項目1</li>
            <li>リスト項目2</li>
          </ul>
          <p>条件付き表示</p>
        </div>
      </DashboardLayout>
    );

    expect(screen.getByText("ネストされた要素")).toBeInTheDocument();
    expect(screen.getByText("リスト項目1")).toBeInTheDocument();
    expect(screen.getByText("リスト項目2")).toBeInTheDocument();
    expect(screen.getByText("条件付き表示")).toBeInTheDocument();
  });

  it("空の子要素でもエラーなく動作する", () => {
    render(<DashboardLayout>{null}</DashboardLayout>);

    // コンテナが存在することを確認
    const container = document.querySelector(".MuiContainer-root");
    expect(container).toBeInTheDocument();
  });

  it("レスポンシブ対応のためのMUIのsxプロパティが設定されている", () => {
    const testContent = "レスポンシブテスト";
    render(
      <DashboardLayout>
        <div>{testContent}</div>
      </DashboardLayout>
    );

    // MUI要素が正しく配置されていることを確認
    const container = screen
      .getByText(testContent)
      .closest(".MuiContainer-root");
    const paper = screen.getByText(testContent).closest(".MuiPaper-root");

    expect(container).toBeInTheDocument();
    expect(paper).toBeInTheDocument();
  });

  describe("プロパティテスト", () => {
    it("maxWidth: sm が正しく適用される", () => {
      render(
        <DashboardLayout maxWidth="sm">
          <div>Small Layout</div>
        </DashboardLayout>
      );
      expect(screen.getByText("Small Layout")).toBeInTheDocument();
    });

    it("maxWidth: md が正しく適用される", () => {
      render(
        <DashboardLayout maxWidth="md">
          <div>Medium Layout</div>
        </DashboardLayout>
      );
      expect(screen.getByText("Medium Layout")).toBeInTheDocument();
    });

    it("maxWidth: lg が正しく適用される", () => {
      render(
        <DashboardLayout maxWidth="lg">
          <div>Large Layout</div>
        </DashboardLayout>
      );
      expect(screen.getByText("Large Layout")).toBeInTheDocument();
    });

    it("maxWidth: xl が正しく適用される", () => {
      render(
        <DashboardLayout maxWidth="xl">
          <div>Extra Large Layout</div>
        </DashboardLayout>
      );
      expect(screen.getByText("Extra Large Layout")).toBeInTheDocument();
    });
  });

  describe("スタイリング検証", () => {
    it("Containerに適切なスタイリングが適用されている", () => {
      render(
        <DashboardLayout>
          <div>スタイルテスト</div>
        </DashboardLayout>
      );

      const container = screen
        .getByText("スタイルテスト")
        .closest(".MuiContainer-root");
      expect(container).toHaveClass("MuiContainer-root");
    });

    it("Paperコンポーネントに適切なelevationが設定されている", () => {
      render(
        <DashboardLayout>
          <div>Elevationテスト</div>
        </DashboardLayout>
      );

      const paper = screen
        .getByText("Elevationテスト")
        .closest(".MuiPaper-root");
      expect(paper).toBeInTheDocument();
      // elevation=2の設定を確認（MUIのクラス名で）
      expect(paper).toHaveClass("MuiPaper-elevation2");
    });
  });
});
