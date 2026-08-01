"use client";

import { useEffect, useState } from "react";
import { ZoneKind } from "@/entities/stadium";
import { OPEN_DELAY_MAX_MS, OPEN_DELAY_MIN_MS } from "../config/practice";
import { calcResult } from "../lib/calcResult";
import { clearSession, loadSession, saveSession } from "./practiceSession";
import { PracticeDifficulty, PracticeSession, PracticeVendor } from "./types";

/**
 * 티켓팅 연습 한 판의 진행을 관리하는 훅.
 *
 * 실제 예매 절차대로 단계를 넘기며 각 시점을 찍어두고, 끝나면 구간별 소요 시간을 낸다.
 * 진행 상태는 sessionStorage에 함께 저장한다 — 티켓링크 연습은 브라우저를 실제로 새로고침해야
 * 하므로, 그때 상태가 날아가지 않아야 이어서 진행할 수 있다.
 */

/**
 * 이번 문서가 로드된 시각. 티켓링크의 '새로고침해야 열린다'를 판정하는 기준이다.
 * `performance.timeOrigin`은 실제 문서 로드 시각이라, 화면 내 이동으로는 바뀌지 않고
 * 진짜 새로고침을 해야만 갱신된다 — 판정 기준으로 딱 맞다.
 */
const PAGE_LOADED_AT =
  typeof performance === "undefined" ? 0 : performance.timeOrigin;

export function usePracticeRun() {
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const restoreSavedRun = () => {
      setSession(loadSession());
      setLoaded(true);
    };
    restoreSavedRun();
  }, []);

  const update = (next: PracticeSession | null) => {
    setSession(next);
    if (next) saveSession(next);
    else clearSession();
  };

  const start = (
    vendor: PracticeVendor,
    ticketCount: number,
    difficulty: PracticeDifficulty
  ) => {
    const delay =
      OPEN_DELAY_MIN_MS +
      Math.random() * (OPEN_DELAY_MAX_MS - OPEN_DELAY_MIN_MS);

    update({
      phase: "waiting",
      vendor,
      marks: { openAt: Date.now() + delay },
      ticketCount,
      difficulty,
      missClicks: 0,
    });
  };

  const enter = () => {
    if (!session) return;
    update({
      ...session,
      phase: "zone",
      marks: { ...session.marks, enteredAt: Date.now() },
    });
  };

  const pickZone = (zoneId: ZoneKind) => {
    if (!session) return;
    update({
      ...session,
      phase: "captcha",
      zoneId,
      marks: { ...session.marks, zonePickedAt: Date.now() },
    });
  };

  // 보안문자를 통과해야 좌석 배치도가 열린다
  const passCaptcha = () => {
    if (!session) return;
    update({
      ...session,
      phase: "seat",
      marks: { ...session.marks, captchaPassedAt: Date.now() },
    });
  };

  /**
   * 좌석을 잡으면 예매 완료.
   * 완료 시각을 함께 돌려준다 — 호출자가 기록을 남길 때 시각을 다시 재면
   * 화면에 보이는 소요 시간과 저장되는 기록이 미세하게 어긋나기 때문이다.
   */
  const pickSeat = (): number | null => {
    if (!session) return null;

    const finishedAt = Date.now();
    update({
      ...session,
      phase: "done",
      marks: { ...session.marks, finishedAt },
    });
    return finishedAt;
  };

  // 고를 자리가 다 나가 원하는 매수를 채울 수 없게 됐다 — 예매 실패
  const failSoldOut = () => {
    if (!session) return;
    // 이미 끝난 판은 결과를 덮어쓰지 않는다
    if (session.phase === "soldout" || session.phase === "done") return;

    update({
      ...session,
      phase: "soldout",
      marks: { ...session.marks, finishedAt: Date.now() },
    });
  };

  const addMissClick = () => {
    if (!session) return;
    update({ ...session, missClicks: session.missClicks + 1 });
  };

  const reset = () => update(null);

  return {
    loaded,
    pageLoadedAt: PAGE_LOADED_AT,
    session,
    result: session ? calcResult(session.marks, session.missClicks) : null,
    start,
    enter,
    pickZone,
    passCaptcha,
    pickSeat,
    failSoldOut,
    addMissClick,
    reset,
  };
}
