import type { Metadata } from "next";
import { Nanum_Myeongjo, Gowun_Dodum } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/footer";

// 제목·강조용 명조체 (전통 서예 느낌)
const myeongjo = Nanum_Myeongjo({
  variable: "--font-myeongjo",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  display: "swap",
});

// 본문용 부드러운 한글 고딕 (가독성)
const gowun = Gowun_Dodum({
  variable: "--font-gowun",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  // 공유 미리보기 이미지의 기준 주소 (커스텀 도메인 연결 시 이 값을 바꾸세요)
  metadataBase: new URL("https://saju.fineboll.com"),
  title: "사주 풀이",
  description: "생년월일로 사주팔자를 계산하고 풀이해 주는 무료 사주 사이트",
  // public/logo.png 를 파비콘·공유 미리보기에 사용 (파일 준비되면 자동 적용)
  icons: { icon: "/logo.png" },
  openGraph: {
    title: "사주 풀이",
    description: "생년월일로 사주팔자를 계산하고 풀이해 드립니다.",
    images: ["/api/og"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${myeongjo.variable} ${gowun.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Footer
          links={[{ label: "개인정보처리방침", href: "/privacy" }]}
          note="본 풀이는 재미·참고용입니다"
        />
      </body>
    </html>
  );
}
