// レシートデータの検証ロジック
// 保存前にチェックして、ユーザーへ警告すべき内容を文字列の配列として返す

// 単一のレシートと、既存レシート一覧を受け取り、警告メッセージの配列を返す
// 戻り値が空配列なら問題なし。
export function validateReceipt(newReceipt, existingReceipts) {
  const warnings = [];

  // 1. 金額が負の値になっていないか確認する
  if (Number(newReceipt.total) < 0) {
    warnings.push(`合計金額が負の値です: ¥${newReceipt.total}`);
  }
  if (Array.isArray(newReceipt.items)) {
    const negativeItems = newReceipt.items.filter((item) => Number(item.price) < 0);
    for (const item of negativeItems) {
      warnings.push(`商品「${item.name}」の金額が負の値です: ¥${item.price}`);
    }
  }

  // 2. 日付＋合計金額が完全一致するレシートが既に存在しないか確認する
  // （同じレシートを誤って2回登録するのを防ぐ）
  const newDate = newReceipt.date;
  const newTotal = Number(newReceipt.total);
  if (newDate && Number.isFinite(newTotal)) {
    const duplicate = existingReceipts.find(
      (r) => r.date === newDate && Number(r.total) === newTotal,
    );
    if (duplicate) {
      warnings.push(
        `同じ日付・合計金額のレシートが既に登録されています（${duplicate.date} / ¥${Number(duplicate.total).toLocaleString()} / ${duplicate.store || "不明な店舗"}）`,
      );
    }
  }

  return warnings;
}
