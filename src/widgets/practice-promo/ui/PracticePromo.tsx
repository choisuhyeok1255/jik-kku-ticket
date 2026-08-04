import Link from "next/link";

/**
 * 포도알 연습 유도 배너.
 * - 티켓팅 연습 페이지(/practice)로 가는 진입점이다.
 * - 앱 다운로드 배너와 같은 광고 영역에 나란히 놓인다(위치는 부모 레이아웃이 담당).
 * - 설명과 링크를 좌우로 갈라, 선 하나 위에 눕는 형태로 본문의 여백을 방해하지 않는다.
 */
export default function PracticePromo() {
  return (
    <div className="app-promo">
      <div className="promo-text">
        <p className="promo-title">포도알 연습</p>
        <p className="promo-sub">
          오픈 대기 · 보안문자 · 포도알 잡기까지 실제 절차 그대로
        </p>
      </div>
      <div className="promo-btns">
        <Link className="promo-btn practice-btn" href="/practice">
          연습하기 →
        </Link>
      </div>
    </div>
  );
}
