import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 화면(프레젠테이션 티어) 설정.
// - host: true  → EC2 외부(수강생 브라우저)에서 접속 허용
// - proxy       → /api 로 시작하는 요청을 애플리케이션 티어(8000)로 전달
//                 덕분에 화면 코드는 항상 "/api/..." 만 부르면 되고, CORS도 신경 쓸 필요 없음
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
});
