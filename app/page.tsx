import { HomePage } from "@/pages/home";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/shared/config/site";

/**
 * 루트 라우트(/) 진입점.
 * - Next.js App Router의 얇은 라우팅 파일. 실제 화면은 FSD pages 레이어의 HomePage가 담당한다.
 * - 이 페이지가 제공하는 도구(예매 서버시계)를 구조화 데이터로 기술한다.
 */

/**
 * 이 페이지의 구조화 데이터.
 * 루트 레이아웃은 사이트(WebSite)만 말하므로, 서버시계라는 도구는 여기서 기술하고
 * 그 사이트의 일부임을 @id로 가리킨다.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${SITE_URL}#clock`,
  name: `${SITE_NAME} 예매 서버시계`,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "SportsApplication",
  operatingSystem: "Web",
  inLanguage: "ko-KR",
  isPartOf: { "@id": `${SITE_URL}#website` },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "KRW",
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePage />
    </>
  );
}
