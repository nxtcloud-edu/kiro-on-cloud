import "./globals.css";

export const metadata = {
  title: "구름다방 · 방명록",
  description: "다녀간 자리에 한 줄 남기고, 주인장의 답글을 받습니다.",
  openGraph: {
    title: "구름다방 · 방명록",
    description: "다녀간 자리에 한 줄 남기고, 주인장의 답글을 받습니다.",
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
