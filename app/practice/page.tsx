import type { Metadata } from "next";
import { PracticePage } from "@/pages/practice";
import { SITE_NAME, SITE_URL } from "@/shared/config/site";

/**
 * 티켓팅 연습 라우트(/practice) 진입점.
 * - Next.js App Router의 얇은 라우팅 파일. 실제 화면은 FSD pages 레이어의 PracticePage가 담당한다.
 * - 이 페이지만의 메타(설명·OG·트위터 카드)와 구조화 데이터를 여기서 붙인다.
 */

const PAGE_TITLE = "포도알 연습";
const PAGE_DESCRIPTION =
  "구역 선택부터 보안문자, 좌석(포도알) 잡기까지 KBO 티켓팅의 실제 예매 절차를 그대로 연습하세요. 난이도를 고르면 그 속도로 좌석이 팔려나갑니다.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/practice" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    title: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    url: "/practice",
  },
  // 루트에 정의된 트위터 카드는 홈 내용이라, 이 페이지 것으로 덮어쓴다
  twitter: {
    card: "summary_large_image",
    title: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
  },
};

/**
 * 이 페이지만의 구조화 데이터.
 * 루트 레이아웃의 JSON-LD는 사이트 전체를 설명하므로, 연습 도구 자체를 따로 기술해
 * 검색엔진·AI가 "티켓팅 연습 도구"라는 것을 페이지 단위로 알 수 있게 한다.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${SITE_URL}/practice#webapp`,
  // 엔티티의 이름이지 문서 제목이 아니다. `A | B` 형태를 넣으면 구분자가 이름의 일부로 읽힌다
  name: PAGE_TITLE,
  url: `${SITE_URL}/practice`,
  description: PAGE_DESCRIPTION,
  applicationCategory: "GameApplication",
  operatingSystem: "Web",
  inLanguage: "ko-KR",
  // 사이트 노드를 다시 기술하지 않고 이름표로만 가리킨다 (루트 레이아웃의 @id)
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
      <PracticePage />
    </>
  );
}
