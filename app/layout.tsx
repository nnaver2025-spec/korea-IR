import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Korea IR Calendar",
  description: "한국 상장사 실적발표, IR, 공시 통합 캘린더"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
