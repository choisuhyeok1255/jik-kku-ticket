import { TEAM_LIST } from "@/entities/team";
import { getTeamVendorLinks } from "@/features/pick-vendor";
import {
  JIKKKU_HOME_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/shared/config/site";

/**
 * llms.txt — AI(대규모 언어모델) 크롤러용 사이트 안내.
 *
 * 검색 크롤러와 달리 AI 크롤러는 대부분 자바스크립트를 실행하지 않아, 브라우저에서 채워지는
 * 화면(경기 일정·응원팀 등)을 보지 못한다. 그래서 이 사이트가 무엇을 제공하는지를
 * 사람이 읽는 문장 그대로 한 파일에 정리해 둔다.
 *
 * robots.txt·sitemap.xml과 목적이 다르다 — 그 둘은 "어디를 읽어라"를 알려주고,
 * 이 파일은 "무엇에 대한 사이트인가"를 알려준다.
 *
 * ⚠️ 이 파일의 내용은 AI가 그대로 인용한다. 손으로 적은 사실은 코드가 바뀌어도
 *    타입 검사·린트가 잡아주지 못하므로, 목록처럼 설정에서 뽑을 수 있는 것은 반드시 파생시킨다.
 */

export const dynamic = "force-static";

/**
 * 실제로 어느 구단에선가 예매 링크로 연결되는 예매처만 모은다.
 * 예매처 정의(VENDORS)를 그대로 나열하면, 아직 어디에도 연결하지 않는 예매처까지
 * "지원한다"고 알리게 된다.
 */
const linkedVendors = [
  ...new Map(
    TEAM_LIST.flatMap((team) => getTeamVendorLinks(team))
      .filter((link) => link.bookingUrl)
      .map((link) => [link.vendor.key, link.vendor])
  ).values(),
];

/** 예매 링크를 제공하는 전체 예매처 */
const allVendorNames = linkedVendors.map((vendor) => vendor.name).join(", ");
/** 그중 서버시간까지 볼 수 있는 곳 (한화처럼 Date 헤더를 안 주는 곳은 빠진다) */
const clockVendorNames = linkedVendors
  .filter((vendor) => !vendor.noClock)
  .map((vendor) => vendor.name)
  .join("·");

const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

${SITE_NAME}은 KBO(한국프로야구) 티켓 예매를 준비하는 사람을 위한 웹 도구입니다.
회원가입이나 설치 없이 무료로 쓸 수 있습니다.

## 페이지

- [메인 — KBO 예매 서버시계](${SITE_URL}/): 예매처(${clockVendorNames})의 실제 서버시간을 밀리초 단위로 보여줍니다. 예매창과 시계 사이트를 따로 띄우지 않아도 됩니다. 아래에는 KBO 10개 구단의 예매처 바로가기 목록이 있어, 아무 설정 없이도 원하는 구단의 예매 페이지로 갈 수 있습니다. 응원팀을 고르면 그 팀의 월간 경기 일정(홈·원정)을 달력으로 함께 보여주고, 각 경기 칸에 홈팀 예매처 링크가 붙습니다.
- [포도알 연습 — 티켓팅 연습](${SITE_URL}/practice): 실제 예매 절차(구역 선택 → 보안문자 입력 → 좌석 잡기)를 그대로 연습합니다. 예매할 장수와 난이도를 고르면 그 속도로 좌석이 팔려나가고, 원하는 장수를 채우기 전에 자리가 다 나가면 실패합니다. 최고 기록이 난이도별로 저장됩니다.

## 자주 묻는 것

- 예매처 서버시간을 왜 보나요: 티켓 오픈은 예매처 서버 시각 기준으로 열립니다. 내 PC 시계는 몇 초씩 어긋날 수 있어, 예매처 서버시간을 봐야 정확한 순간에 누를 수 있습니다.
- 포도알이 무엇인가요: 예매창의 좌석 배치도에서 자리 하나하나를 가리키는 야구 팬들의 표현입니다. 동그란 좌석 표시가 포도알처럼 보이는 데서 왔습니다.
- 어떤 예매처를 지원하나요: ${allVendorNames}. 구단마다 예매처가 달라 구단별로 연결합니다. 이 중 ${clockVendorNames}는 서버시간까지 볼 수 있습니다.

## 관련

- [직꾸 앱](${JIKKKU_HOME_URL}): 직관 기록·KBO 일정·하이라이트를 다루는 모바일 앱입니다. ${SITE_NAME}은 그중 예매 준비를 돕는 웹 도구입니다.
`;

export function GET() {
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
