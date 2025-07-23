# CommerceHub-Plus

ソフトウェアシステム開発のグループ演習。

## 🧪 テスト実行

### 基本的なテスト実行

```bash
# 全てのテストを実行
npm test

# クライアントサイドのテストのみ
npm run test:client

# サーバーサイドのテストのみ
npm run test:server
```

### 📊 カバレッジ測定

```bash
# 全体のカバレッジ測定
npm run test:coverage

# クライアントサイドのカバレッジ測定
npm run test:coverage:client

# サーバーサイドのカバレッジ測定
npm run test:coverage:server
```

### 🎯 カバレッジ目標

* **目標値**: 全項目で80%以上
* **現在の状況**: [coverage-report.md](./coverage-report.md)を参照

### CI/CD用テスト実行

```bash
# 継続的インテグレーション用（カバレッジ付き）
npm run test:ci

# クライアントサイドCI用
npm run test:ci:client

# サーバーサイドCI用
npm run test:ci:server
```

## 📁 カバレッジレポート

カバレッジ測定後、以下の場所にHTMLレポートが生成されます：

* **クライアントサイド**: `client/coverage/index.html`
* **サーバーサイド**: `server/coverage/index.html`

ブラウザでこれらのファイルを開くと、詳細なカバレッジ情報を確認できます。

## 🚀 開発ワークフロー

1. **新機能開発時**
   ```bash
   # 1. 失敗するテストを書く（Red）
   npm test

   # 2. 実装してテストを通す（Green）
   npm test

   # 3. カバレッジを確認
   npm run test:coverage

   # 4. リファクタリング（Refactor）
   npm test
   ```

2. **プルリクエスト前**
   ```bash
   # 全テスト＋カバレッジ確認
   npm run test:ci
   ```
