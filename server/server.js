// 家計簿アプリのバックエンドサーバー
// Claude APIを呼び出してレシート画像から商品情報を抽出する
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 画像をbase64で受け取るためボディサイズ上限を引き上げる（最大10MB）
app.use(express.json({ limit: "10mb" }));
app.use(cors());

// Anthropicクライアントの初期化（APIキーは環境変数から取得）
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// レシートから抽出するJSONのスキーマ定義
// Claudeが必ずこの形式で返すよう構造化出力を利用する
const receiptSchema = {
  type: "object",
  properties: {
    store: {
      type: "string",
      description: "店舗名。読み取れない場合は'不明'",
    },
    date: {
      type: "string",
      description: "購入日付（YYYY-MM-DD形式）。読み取れない場合は今日の日付",
    },
    items: {
      type: "array",
      description: "購入した商品の一覧",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "商品名",
          },
          price: {
            type: "number",
            description: "価格（円、税込み）",
          },
          category: {
            type: "string",
            enum: ["食費", "外食", "日用品", "衣服", "医療", "交通", "娯楽", "その他"],
            description: "商品のカテゴリ",
          },
        },
        required: ["name", "price", "category"],
        additionalProperties: false,
      },
    },
    total: {
      type: "number",
      description: "合計金額（円、税込み）",
    },
  },
  required: ["store", "date", "items", "total"],
  additionalProperties: false,
};

// ヘルスチェック用エンドポイント
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// レシート解析エンドポイント
// 入力: { imageBase64: string, mediaType: string }
// 出力: 構造化されたレシート情報
app.post("/api/analyze-receipt", async (req, res) => {
  try {
    const { imageBase64, mediaType } = req.body;

    if (!imageBase64 || !mediaType) {
      return res.status(400).json({
        error: "imageBase64とmediaTypeは必須です",
      });
    }

    // 対応する画像形式のチェック
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(mediaType)) {
      return res.status(400).json({
        error: `対応していない画像形式です: ${mediaType}`,
      });
    }

    // Claude APIに画像とプロンプトを送信
    // - claude-haiku-4-5 はビジョン対応の最新Haikuモデル
    // - output_config.format で JSONスキーマを指定し、必ずこの形式で返却させる
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 4096,
      output_config: {
        format: {
          type: "json_schema",
          schema: receiptSchema,
        },
      },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `このレシート画像を分析して、以下の情報を抽出してください。

- 店舗名（店名やロゴから判断）
- 購入日付（YYYY-MM-DD形式）
- 各商品の情報:
  - 商品名
  - 価格（税込みで円単位の数値のみ）
  - カテゴリ（以下から最も適切なものを1つ選ぶ）
    - 食費: スーパーやコンビニで購入した食料品・飲料・調味料など
    - 外食: レストラン・カフェ・ファストフードでの飲食
    - 日用品: 洗剤・トイレットペーパー・歯ブラシなどの消耗品
    - 衣服: 服・靴・アクセサリーなど
    - 医療: 薬・病院・サプリメントなど
    - 交通: 電車・バス・タクシー・ガソリンなど
    - 娯楽: 書籍・ゲーム・映画・趣味用品など
    - その他: 上記のいずれにも該当しないもの
- 合計金額（税込みで円単位の数値）

不明な項目がある場合は、その他としてください。価格は数値のみで返してください（円記号や,は含めない）。`,
            },
          ],
        },
      ],
    });

    // 構造化出力なのでcontent[0].textに有効なJSON文字列が含まれる
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock) {
      return res.status(500).json({
        error: "Claude APIからの応答にテキストが含まれていませんでした",
      });
    }

    const receiptData = JSON.parse(textBlock.text);

    res.json({
      success: true,
      data: receiptData,
      usage: response.usage,
    });
  } catch (err) {
    console.error("レシート解析エラー:", err);

    // Anthropic SDK の典型的なエラーに対応
    if (err instanceof Anthropic.AuthenticationError) {
      return res.status(401).json({
        error: "APIキーが無効です。.envのANTHROPIC_API_KEYを確認してください",
      });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(429).json({
        error: "APIのレート制限に達しました。しばらく待ってから再試行してください",
      });
    }
    if (err instanceof Anthropic.APIError) {
      return res.status(err.status || 500).json({
        error: `Claude APIエラー: ${err.message}`,
      });
    }

    res.status(500).json({
      error: err.message || "不明なエラーが発生しました",
    });
  }
});

app.listen(PORT, () => {
  console.log(`サーバーが http://localhost:${PORT} で起動しました`);
});
