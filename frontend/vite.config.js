import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ========================================
// Vite 설정 파일
// ========================================
// 
// 개발 서버에서 /api 요청을 백엔드 Spring Boot로 프록시합니다.
// 이 설정은 로컬 개발 환경에서만 사용됩니다.
//
// 실제 배포 환경에서는 Apache Reverse Proxy가 이 역할을 합니다.
// ========================================

export default defineConfig({
  plugins: [react()],

  // 빌드 결과물은 dist 폴더에 생성
  build: {
    outDir: 'dist',
  },

  server: {
    port: 3000,
    // ========================================
    // 개발 환경 프록시 설정
    // ========================================
    // 로컬에서 npm run dev 실행 시
    // /api 요청을 localhost:8080 (Spring Boot)으로 전달합니다.
    //
    // 배포 환경에서는 Apache mod_proxy가 이 역할을 합니다.
    // ========================================
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
