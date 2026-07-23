/**
 * 사이트 전역 메타 상수.
 * - SEO(metadata·robots·sitemap·manifest·OG)와 JSON-LD가 공유하는 사이트 정보다.
 * - SITE_URL은 환경변수(NEXT_PUBLIC_SITE_URL)로 덮어쓸 수 있고, 없으면 기본 도메인을 쓴다.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ticket.jik-kku.com";

export const SITE_NAME = "직꾸 티켓";

// victory(직꾸) 본체의 title 규칙(`설명 | 직꾸`)에 맞춰, 서브도메인 접미사 `직꾸 티켓`을 뒤에 둔다.
export const SITE_TITLE = "KBO 예매 서버시계 | 직꾸 티켓";

export const SITE_DESCRIPTION =
  "KBO 구단별 예매처 바로가기와 예매처 서버시간을 한 화면에서. 예매창 따로, 시계 사이트 따로 띄울 필요 없이 초 단위로 티켓 오픈을 준비하세요.";

export const SITE_KEYWORDS = [
  "KBO 예매",
  "야구 티켓 예매",
  "프로야구 예매",
  "예매처 서버시간",
  "티켓링크 서버시간",
  "네이비즘",
  "KBO 티켓 오픈",
  "야구 예매 시계",
];
