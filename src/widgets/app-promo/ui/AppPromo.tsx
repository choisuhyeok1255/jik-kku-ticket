import {
  APP_STORE_URL,
  GOOGLE_PLAY_URL,
  JIKKKU_HOME_URL,
} from "@/shared/config/site";

/**
 * 직꾸 본체(직관 기록) 유도 배너.
 * - 웹과 두 앱 스토어, 세 갈래 모두를 여기 모은다. 헤더에는 같은 링크를 두지 않는다.
 * - 데스크탑에선 사이드, 좁은 화면에선 본문 위쪽에 놓인다(위치는 부모 레이아웃이 담당).
 */
export default function AppPromo() {
  return (
    <div className="app-promo">
      <div className="promo-text">
        <p className="promo-title">이미 200명이 직관을 기록 중</p>
        <p className="promo-sub">
          경기만 고르면 자동 기록 · KBO 일정 · 하이라이트까지
        </p>
      </div>
      <div className="promo-btns">
        {/* 웹이 먼저다 — 앱을 깔지 않아도 바로 볼 수 있는 길 */}
        <a
          className="promo-btn"
          href={JIKKKU_HOME_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          직관 기록하러 가기
          <span className="sr-only"> (새 탭에서 열림)</span>
        </a>
        <a
          className="promo-btn"
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          App Store
        </a>
        <a
          className="promo-btn"
          href={GOOGLE_PLAY_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Play
        </a>
      </div>
    </div>
  );
}
