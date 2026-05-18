# kakeibo-app

レシート画像を Claude API でOCR・分類し、収支を可視化する家計簿Webアプリ。

## プロジェクト構成

```
kakeibo-app/
├── server/          # Node.js + Express バックエンド
│   ├── server.js    # Claude API呼び出しを担うサーバー
│   ├── package.json
│   └── .env.example # 環境変数のサンプル（実際の .env はGit除外）
├── client/          # React + Vite フロントエンド
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/   # UI部品
│   │   └── utils/        # localStorage・集計ユーティリティ
│   ├── vite.config.js    # /api を server:3001 にプロキシ
│   └── package.json
├── .gitignore
└── CLAUDE.md
```

## 技術スタック

- **フロントエンド**: React 18 + Vite + Chart.js (react-chartjs-2)
- **バックエンド**: Node.js (ESM) + Express + Anthropic SDK
- **モデル**: `claude-haiku-4-5`（ビジョン対応の最新Haiku）
- **データ保存**: ブラウザの localStorage（サーバー側にDBなし）

## セットアップ

### 1. APIキーの設定
```bash
cd server
cp .env.example .env
# .env を編集して ANTHROPIC_API_KEY=sk-ant-... を設定
```

### 2. 依存関係のインストール
```bash
cd server && npm install
cd ../client && npm install
```

### 3. 起動
ターミナルを2つ開いて以下をそれぞれ実行:

```bash
# ターミナル1: バックエンド
cd server && npm run dev   # http://localhost:3001
```

```bash
# ターミナル2: フロントエンド
cd client && npm run dev   # http://localhost:5173
```

ブラウザで http://localhost:5173 を開く。

## 重要事項

- **APIキーは `.env` で管理し、絶対にコミットしない**。`.gitignore` で除外済み。
- **ブラウザから直接 Claude API は呼ばない**。必ずバックエンド経由で呼び出す（APIキーの保護）。
- レシートデータは localStorage に保存されるため、ブラウザを変えるとデータは引き継がれない。
- 構造化出力（`output_config.format` + JSONスキーマ）を使い、Claudeから決まった形のJSONが返るようにしている。

## Git 運用ルール

**コードを変更するたびに GitHub へプッシュする。**

具体的な手順:

1. 変更を行ったら、まず `git status` / `git diff` で内容を確認する
2. 関連する変更ごとに意味のある単位でコミットを分ける
3. コミットメッセージは「何を・なぜ」が伝わる日本語または英語で簡潔に書く
4. コミット後は必ず `git push` をリモート (`origin`) に対して実行する
5. プッシュ後に `git status` で作業ツリーがクリーンであることを確認する

注意事項:

- `git push --force` / `--force-with-lease` などの破壊的なプッシュは、ユーザーから明示的に依頼された場合のみ実施する
- pre-commit フックが失敗した場合は `--no-verify` で回避せず、根本原因を修正してから再コミットする
- `.env` などの機密ファイルや大きなバイナリを誤ってコミット・プッシュしないよう、ステージング前に `git status` を必ず確認する

## 開発コマンド

| コマンド | 実行ディレクトリ | 説明 |
|---|---|---|
| `npm install` | server/, client/ それぞれ | 依存関係のインストール |
| `npm run dev` | server/ | バックエンド起動（--watchで自動再起動） |
| `npm run dev` | client/ | Viteの開発サーバー起動 |
| `npm run build` | client/ | 本番用ビルド |

## カテゴリ一覧

レシートの各商品は以下のいずれかに自動分類される:
食費 / 外食 / 日用品 / 衣服 / 医療 / 交通 / 娯楽 / その他
