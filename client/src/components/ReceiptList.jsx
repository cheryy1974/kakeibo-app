// 登録済みのレシート一覧を表示するコンポーネント
// 各レシートには商品の明細とカテゴリが表示される

export default function ReceiptList({ receipts, onDelete }) {
  if (receipts.length === 0) {
    return (
      <div className="receipt-list">
        <h2>レシート一覧</h2>
        <p className="empty">まだレシートが登録されていません。上のフォームからアップロードしてください。</p>
      </div>
    );
  }

  // 新しい順に並べる（dateの降順）
  const sorted = [...receipts].sort((a, b) => {
    const dateA = a.date || "";
    const dateB = b.date || "";
    return dateB.localeCompare(dateA);
  });

  return (
    <div className="receipt-list">
      <h2>レシート一覧（{receipts.length}件）</h2>
      <div className="receipts">
        {sorted.map((receipt) => (
          <div key={receipt.id} className="receipt-card">
            <div className="receipt-header">
              <div>
                <strong>{receipt.store || "不明な店舗"}</strong>
                <span className="date">{receipt.date}</span>
              </div>
              <div className="receipt-actions">
                <span className="total">¥{Number(receipt.total).toLocaleString()}</span>
                <button
                  onClick={() => onDelete(receipt.id)}
                  className="delete-button"
                  aria-label="削除"
                >
                  ×
                </button>
              </div>
            </div>
            <table className="items">
              <thead>
                <tr>
                  <th>商品名</th>
                  <th>カテゴリ</th>
                  <th>金額</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td>
                      <span className="category-badge">{item.category}</span>
                    </td>
                    <td className="price">¥{Number(item.price).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
