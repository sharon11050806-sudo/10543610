import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 載入環境變數 (讓本機開發也能讀取 .env)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // 使用相對路徑 './' 以支援 GitHub Pages 非根目錄部署
    base: './', 
    build: {
      outDir: 'dist',
    },
    // 重要：將 process.env.API_KEY 定義為全域常數，讓前端程式碼可以直接讀取
    // 加入 || '' 確保變數不存在時不會變成 undefined，避免前端報錯
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      'process.env.VITE_FINNHUB_API_KEY': JSON.stringify(env.VITE_FINNHUB_API_KEY || ''),
      'process.env.VITE_FIREBASE_CONFIG_STRING': JSON.stringify(env.VITE_FIREBASE_CONFIG_STRING || ''),
    }
  };
});