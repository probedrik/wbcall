import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ВАЖНО: Укажите здесь имя вашего репозитория на GitHub
  base: '/wbcall/',
})