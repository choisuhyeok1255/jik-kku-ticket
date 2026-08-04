"use client";

import { useUserCount } from "@/entities/user";
import { formatNumber } from "@/shared/lib/formatNumber";
import {
  APP_STORE_URL,
  GOOGLE_PLAY_URL,
  JIKKKU_HOME_URL,
} from "@/shared/config/site";

/**
 * 직꾸 본체(직관 기록) 유도 배너.
 * - 웹과 두 앱 스토어, 세 갈래 모두를 여기 모은다. 헤더에는 같은 링크를 두지 않는다.
 * - 데스크탑에선 사이드, 좁은 화면에선 본문 위쪽에 놓인다(위치는 부모 레이아웃이 담당).
 * - 회원 수는 실제 가입자 수를 읽어와 보여준다.
 */

/** 회원 수를 못 읽었을 때 쓰는 값. 실제 수보다 낮게 잡아 과장이 되지 않게 한다 */
const FALLBACK_USER_COUNT = 200;

export default function AppPromo() {
  const { userCount, isUserCountPending, isUserCountError } = useUserCount();

  /*
   * 불러오는 중에는 숫자를 비워둔다. 기본값을 먼저 보여주면 값이 도착하는 순간
   * 200에서 206으로 튀어, 없던 사실이 있었던 것처럼 읽힌다.
   * 실패가 확정됐을 때만 기본값으로 문장을 채운다.
   */
  const shown = isUserCountError ? FALLBACK_USER_COUNT : userCount;

  return (
    <div className="app-promo">
      <div className="promo-text">
        <p className="promo-title">
          {isUserCountPending ? (
            "직관 기록은 직꾸 앱에서"
          ) : (
            <>
              이미 {formatNumber(shown ?? FALLBACK_USER_COUNT)}명이 직관을 기록
              중
            </>
          )}
        </p>
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
