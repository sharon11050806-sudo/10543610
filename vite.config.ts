import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 這裡非常重要：
  // 1. 如果你的儲存庫名稱是 "my-project"，請將 base 改為 '/my-project/'
  // 2. 或者使用 './' (相對路徑)，這通常適用於簡單的專案
  base: './', 
  build: {
    outDir: 'dist',
  }
});