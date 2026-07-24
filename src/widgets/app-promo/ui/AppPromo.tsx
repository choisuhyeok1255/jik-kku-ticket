import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/shared/config/site";

/**
 * 직꾸 앱 다운로드 프로모 카드.
 * - 직관 기록 기능(네이티브 앱)을 App Store·Google Play로 유도한다.
 * - 데스크탑에선 사이드 배너, 모바일에선 콘텐츠 하단 배너로 배치된다(위치는 부모 레이아웃이 담당).
 */
export default function AppPromo() {
  return (
    <div className="app-promo">
      <p className="promo-title">이미 200명이 직관을 기록 중</p>
      <p className="promo-sub">
        경기만 고르면 자동 기록 · KBO 일정 · 하이라이트까지
      </p>
      <div className="promo-btns">
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
