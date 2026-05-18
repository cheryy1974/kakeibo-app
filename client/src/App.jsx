// アプリ全体のルートコンポーネント
// レシートのアップロード・一覧表示・グラフ表示を統合する
import { useEffect, useState } from "react";
import ReceiptUploader from "./components/ReceiptUploader.jsx";
import ReceiptList from "./components/ReceiptList.jsx";
import CategoryPieChart from "./components/CategoryPieChart.jsx";
import MonthlyBarChart from "./components/MonthlyBarChart.jsx";
import {
  loadReceipts,
  addReceipt,
  deleteReceipt,
  clearAllReceipts,
} from "./utils/storage.js";
import { calculateTotalSpending } from "./utils/aggregate.js";

export default function App() {
  // 起動時にローカルストレージから既存データを読み込む
  const [receipts, setReceipts] = useState([]);

  useEffect(() => {
    setReceipts(loadReceipts());
  }, []);

  // 新しいレシートが解析されたときの処理
  const handleReceiptAnalyzed = (data) => {
    const newReceipt = addReceipt(data);
    setReceipts((prev) => [...prev, newReceipt]);
  };

  // 個別レシート削除
  const handleDelete = (id) => {
    if (!confirm("このレシートを削除しますか？")) return;
    const updated = deleteReceipt(id);
    setReceipts(updated);
  };

  // 全データ削除
  const handleClearAll = () => {
    if (!confirm("すべてのレシートデータを削除します。よろしいですか？")) return;
    clearAllReceipts();
    setReceipts([]);
  };

  const totalSpending = calculateTotalSpending(receipts);

  return (
    <div className="app">
      <header className="app-header">
        <h1>📒 家計簿アプリ</h1>
        <div className="summary">
          <span>累計支出: </span>
          <strong>¥{totalSpending.toLocaleString()}</strong>
        </div>
      </header>

      <main className="app-main">
        <section>
          <ReceiptUploader onReceiptAnalyzed={handleReceiptAnalyzed} />
        </section>

        {receipts.length > 0 && (
          <section className="charts">
            <CategoryPieChart receipts={receipts} />
            <MonthlyBarChart receipts={receipts} />
          </section>
        )}

        <section>
          <ReceiptList receipts={receipts} onDelete={handleDelete} />
        </section>

        {receipts.length > 0 && (
          <section className="danger-zone">
            <button onClick={handleClearAll} className="danger-button">
              全データをリセット
            </button>
          </section>
        )}
      </main>

      <footer className="app-footer">
        <small>レシート画像はClaude AIで自動解析されます。データはブラウザ内に保存されます。</small>
      </footer>
    </div>
  );
}
