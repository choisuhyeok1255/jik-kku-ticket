import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@/app/styles/globals.css";
import Providers from "@/app/providers";
import { THEME_INIT_SCRIPT } from "@/features/theme";
import {
  SITE_URL,
  SITE_NAME,
  SITE_TITLE,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
} from "@/shared/config/site";

// victory와 톤을 맞춘 LaundryGothic(런드리고딕) 본문 폰트
const laundryGothic = localFont({
  src: [
    { path: "../public/fonts/LaundryGothic-Regular.woff", weight: "400" },
    { path: "../public/fonts/LaundryGothic-Bold.woff", weight: "700" },
  ],
  variable: "--font-laundry",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  category: "sports",
  alternates: { canonical: "/" },
  verification: {
    other: {
      "naver-site-verification": "91cf84e19891ee8fff1886ecec76bf8e22f0df16",
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  // 두 테마를 모두 지원하므로 브라우저 UI 색도 테마별로 알려준다
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1f2ef" },
    { media: "(prefers-color-scheme: dark)", color: "#131416" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

/** 검색엔진용 구조화 데이터(JSON-LD). 이 앱을 무료 웹 애플리케이션으로 기술한다. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "SportsApplication",
  operatingSystem: "Web",
  inLanguage: "ko-KR",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "KRW",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /* suppressHydrationWarning은 <html> 태그 자신의 속성에만 적용된다(자식에는 번지지 않는다).
       아래 스크립트가 하이드레이션 전에 data-theme을 박기 때문에 서버 HTML과 반드시 어긋나는데,
       그건 의도된 것이라 이 한 요소에서만 경고를 끈다. */
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 첫 페인트 전에 테마를 확정해 화면이 번쩍이지 않게 한다 */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={laundryGothic.variable}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
