import Link from "next/link";

/**
 * 포도알 연습 유도 카드.
 * - 티켓팅 연습 페이지(/practice)로 가는 진입점이다.
 * - 앱 다운로드 카드와 같은 광고 영역에 나란히 놓인다(위치는 부모 레이아웃이 담당).
 */
export default function PracticePromo() {
  return (
    <div className="app-promo practice-promo">
      <p className="promo-title">예매 전에 손부터 풀기</p>
      <p className="promo-sub">
        오픈 대기 · 보안문자 · 포도알 잡기까지 실제 절차 그대로
      </p>
      <Link className="promo-btn practice-btn" href="/practice">
        포도알 연습하기
      </Link>
    </div>
  );
}
