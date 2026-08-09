import "./globals.css";

export const metadata = {
  title: "명언집 · 오늘의 명언",
  description: "마음에 남는 한 문장을 만나고, 나의 문장을 더합니다.",
  openGraph: {
    title: "명언집 · 오늘의 명언",
    description: "마음에 남는 한 문장을 만나고, 나의 문장을 더합니다.",
    type: "website",
  },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%231c1917'/%3E%3Ctext x='32' y='46' text-anchor='middle' font-family='Georgia, serif' font-size='44' fill='%23f7f6f3'%3E%E2%80%9D%3C/text%3E%3C/svg%3E",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
