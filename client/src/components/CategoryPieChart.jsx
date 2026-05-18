// カテゴリ別支出の円グラフコンポーネント
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { CATEGORIES, CATEGORY_COLORS, aggregateByCategory } from "../utils/aggregate.js";

// Chart.js の必要なコンポーネントを登録
ChartJS.register(ArcElement, Tooltip, Legend);

export default function CategoryPieChart({ receipts }) {
  const totals = aggregateByCategory(receipts);

  // 金額が0のカテゴリは表示から除外する
  const activeCategories = CATEGORIES.filter((c) => totals[c] > 0);

  if (activeCategories.length === 0) {
    return (
      <div className="chart-container">
        <h3>カテゴリ別支出</h3>
        <p className="empty">データがまだありません</p>
      </div>
    );
  }

  const data = {
    labels: activeCategories,
    datasets: [
      {
        data: activeCategories.map((c) => totals[c]),
        backgroundColor: activeCategories.map((c) => CATEGORY_COLORS[c]),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.parsed;
            const total = ctx.dataset.data.reduce((s, v) => s + v, 0);
            const pct = ((value / total) * 100).toFixed(1);
            return `${ctx.label}: ¥${value.toLocaleString()} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <h3>カテゴリ別支出</h3>
      <div className="chart-wrapper">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
}
