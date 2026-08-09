import "./globals.css";

export const metadata = {
  title: "명언집 · 오늘의 명언",
  description: "마음에 남는 한 문장을 만나고, 나의 문장을 더합니다.",
  openGraph: {
    title: "명언집 · 오늘의 명언",
    description: "마음에 남는 한 문장을 만나고, 나의 문장을 더합니다.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
