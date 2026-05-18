// 月別支出の棒グラフコンポーネント
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { aggregateByMonth } from "../utils/aggregate.js";

// Chart.js の必要なコンポーネントを登録
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function MonthlyBarChart({ receipts }) {
  const monthly = aggregateByMonth(receipts);

  if (monthly.length === 0) {
    return (
      <div className="chart-container">
        <h3>月別支出</h3>
        <p className="empty">データがまだありません</p>
      </div>
    );
  }

  const data = {
    labels: monthly.map((m) => m.month),
    datasets: [
      {
        label: "支出合計（円）",
        data: monthly.map((m) => m.total),
        backgroundColor: "#36A2EB",
        borderColor: "#1976D2",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `¥${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `¥${value.toLocaleString()}`,
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <h3>月別支出</h3>
      <div className="chart-wrapper">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
