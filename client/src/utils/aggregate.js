// レシート配列からグラフ用の集計データを生成するユーティリティ

// カテゴリの並び順（円グラフの一貫性のため固定）
export const CATEGORIES = [
  "食費",
  "外食",
  "日用品",
  "衣服",
  "医療",
  "交通",
  "娯楽",
  "その他",
];

// 各カテゴリに対応する色
export const CATEGORY_COLORS = {
  食費: "#FF6384",
  外食: "#FF9F40",
  日用品: "#36A2EB",
  衣服: "#9966FF",
  医療: "#4BC0C0",
  交通: "#FFCD56",
  娯楽: "#C9CBCF",
  その他: "#A0A0A0",
};

// カテゴリ別の合計金額を集計
// 戻り値: { 食費: 1200, 日用品: 500, ... }
export function aggregateByCategory(receipts) {
  const totals = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));

  for (const receipt of receipts) {
    if (!Array.isArray(receipt.items)) continue;
    for (const item of receipt.items) {
      const category = CATEGORIES.includes(item.category) ? item.category : "その他";
      totals[category] += Number(item.price) || 0;
    }
  }

  return totals;
}

// 月別の合計金額を集計（直近12ヶ月）
// 戻り値: [{ month: '2026-05', total: 12345 }, ...] （月の昇順）
export function aggregateByMonth(receipts) {
  const monthMap = new Map();

  for (const receipt of receipts) {
    const date = receipt.date;
    if (!date || typeof date !== "string") continue;
    // YYYY-MM-DD から YYYY-MM を抜き出す
    const month = date.slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(month)) continue;

    const total = Number(receipt.total) || 0;
    monthMap.set(month, (monthMap.get(month) || 0) + total);
  }

  // 月の昇順でソート
  const sorted = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }));

  return sorted;
}

// 全期間の合計支出金額を算出
export function calculateTotalSpending(receipts) {
  return receipts.reduce((sum, r) => sum + (Number(r.total) || 0), 0);
}
