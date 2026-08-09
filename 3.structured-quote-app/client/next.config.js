// 화면(프레젠테이션 티어) 설정.
//
//   output: "export" → 서버 없이 도는 정적 파일(out/)만 뽑는다.
//     1-Tier의 Next.js는 EC2에서 "실행"됐지만, 이 화면은 S3에 "올려두기만" 한다.
//     그래서 API 라우트를 쓸 수 없다 — 데이터는 전부 FastAPI에 물어봐야 한다.
//
//   env → 화면 코드에 넣어줄 값. 여기 적은 것만 브라우저로 나간다.
//     DB_PASSWORD 같은 건 .env에 있어도 절대 번들에 들어가지 않는다.
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  env: {
    SERVER_URL: process.env.SERVER_URL || "",
  },
};

module.exports = nextConfig;
