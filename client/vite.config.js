// Viteの設定ファイル
// 開発時に /api 宛のリクエストをバックエンド(3001番ポート)にプロキシする
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
