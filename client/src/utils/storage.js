// ローカルストレージへのレシートデータの保存・読み込みユーティリティ
// すべてのレシートは"kakeibo:receipts"というキーに配列として保存される

const STORAGE_KEY = "kakeibo:receipts";

// 保存されている全レシートを取得する
// 形式が壊れている場合は空配列を返す
export function loadReceipts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("レシートデータの読み込みに失敗しました:", err);
    return [];
  }
}

// 全レシートを保存する（既存データを上書き）
export function saveReceipts(receipts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
    return true;
  } catch (err) {
    console.error("レシートデータの保存に失敗しました:", err);
    return false;
  }
}

// 新しいレシートを追加する。IDと登録日時を自動付与
export function addReceipt(receipt) {
  const receipts = loadReceipts();
  const newReceipt = {
    id: `receipt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...receipt,
  };
  receipts.push(newReceipt);
  saveReceipts(receipts);
  return newReceipt;
}

// 指定したIDのレシートを削除する
export function deleteReceipt(id) {
  const receipts = loadReceipts().filter((r) => r.id !== id);
  saveReceipts(receipts);
  return receipts;
}

// 全レシートを削除する（リセット用）
export function clearAllReceipts() {
  localStorage.removeItem(STORAGE_KEY);
}
