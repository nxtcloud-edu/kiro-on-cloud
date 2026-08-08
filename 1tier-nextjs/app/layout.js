import "./globals.css";

export const metadata = {
  title: "랜덤 명언 · 1-Tier",
  description: "프론트+백+데이터가 한 코드에 있는 모놀리스",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
