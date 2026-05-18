// レシート画像をアップロードしてClaude APIで解析するコンポーネント
import { useState } from "react";

// Fileオブジェクトをbase64文字列に変換するヘルパー
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // result は "data:image/png;base64,xxxxx" の形式なので、base64部分のみ取り出す
      const result = reader.result;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ReceiptUploader({ onReceiptAnalyzed }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ファイル選択時の処理
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setError("画像ファイルを選択してください");
      return;
    }

    setFile(selected);
    setError(null);
    // プレビュー画像のURLを生成
    setPreviewUrl(URL.createObjectURL(selected));
  };

  // アップロード&解析の実行
  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const base64 = await fileToBase64(file);

      const res = await fetch("/api/analyze-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mediaType: file.type,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "解析に失敗しました");
      }

      // 解析結果を親コンポーネントに通知
      onReceiptAnalyzed(json.data);

      // フォームをリセット
      setFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "予期せぬエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="uploader">
      <h2>レシートをアップロード</h2>
      <div className="uploader-controls">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={loading}
        />
        <button
          onClick={handleAnalyze}
          disabled={!file || loading}
          className="primary-button"
        >
          {loading ? "解析中..." : "解析する"}
        </button>
      </div>

      {previewUrl && (
        <div className="preview">
          <img src={previewUrl} alt="レシートのプレビュー" />
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}
