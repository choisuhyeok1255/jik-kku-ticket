import type { Metadata } from "next";
import { PracticePage } from "@/pages/practice";

/**
 * 티켓팅 연습 라우트(/practice) 진입점.
 * - Next.js App Router의 얇은 라우팅 파일. 실제 화면은 FSD pages 레이어의 PracticePage가 담당한다.
 */

export const metadata: Metadata = {
  title: "포도알 연습",
  description:
    "예매 오픈 대기부터 구역 선택, 좌석(포도알) 잡기, 보안문자 입력까지. 티켓링크·NOL 티켓의 실제 예매 절차 그대로 연습하세요.",
  alternates: { canonical: "/practice" },
  openGraph: {
    title: "포도알 연습 | 직꾸 티켓",
    description:
      "티켓링크·NOL 티켓의 실제 예매 절차 그대로 연습하는 티켓팅 시뮬레이터.",
    url: "/practice",
  },
};

export default function Page() {
  return <PracticePage />;
}
