# 家計簿アプリ 📒

レシート画像をアップロードすると、Claude AI が自動で内容を読み取り、カテゴリ別に分類して家計を可視化するWebアプリです。

## 主な機能

- 📷 レシート画像をアップロードして Claude API が商品名・金額・日付・カテゴリを自動抽出
- 📋 登録したレシートの一覧表示（商品ごとの明細つき）
- 🥧 カテゴリ別支出の円グラフ
- 📊 月別支出の棒グラフ
- 💾 ブラウザの localStorage に保存（リロードしてもデータが残る）

## 技術スタック

- フロントエンド: React + Vite + Chart.js
- バックエンド: Node.js + Express + Anthropic SDK
- AIモデル: `claude-haiku-4-5`（最新のHaiku、ビジョン対応）

## セットアップ手順

### 1. リポジトリをクローン
```bash
git clone https://github.com/cheryy1974/kakeibo-app.git
cd kakeibo-app
```

### 2. APIキーを設定

[Anthropic Console](https://console.anthropic.com/) でAPIキーを発行し、`server/.env` に設定します。

```bash
cd server
cp .env.example .env
# .env を編集して ANTHROPIC_API_KEY を入力
```

### 3. 依存関係をインストール
```bash
# プロジェクトルートで
cd server && npm install
cd ../client && npm install
```

### 4. 起動

ターミナルを2つ用意し、それぞれで以下を実行:

```bash
# ターミナル1: バックエンド (http://localhost:3001)
cd server && npm run dev
```

```bash
# ターミナル2: フロントエンド (http://localhost:5173)
cd client && npm run dev
```

ブラウザで http://localhost:5173 を開いて利用できます。

## セキュリティに関する注意

- `.env` ファイルは `.gitignore` で除外されています。**絶対にコミットしないでください**。
- APIキーはバックエンドのみで利用し、ブラウザに送信されることはありません。

## ライセンス

個人用プロジェクト。
