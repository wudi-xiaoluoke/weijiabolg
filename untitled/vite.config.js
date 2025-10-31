import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          // 保留/api前缀，因为后端API可能期望这个路径格式
          // 不再重写路径，直接转发完整请求路径
        },
      '/music': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          // 转发音乐文件请求到后端静态资源
          pathRewrite: {
            '^/music': '/static/music'
          }
        }
    }
  }
})
