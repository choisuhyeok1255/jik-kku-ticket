"use client";

import { useRef, useState } from "react";
import { ZoneKind } from "@/entities/stadium";
import { calcResult } from "../lib/calcResult";
import { PracticeDifficulty, PracticeSession } from "./types";

/**
 * 티켓팅 연습 한 판의 진행을 관리하는 훅.
 *
 * 실제 예매 절차대로 단계를 넘기며 각 시점을 찍어두고, 끝나면 구간별 소요 시간을 낸다.
 *
 * 진행 상태는 메모리에만 둔다 — 페이지를 벗어나거나 새로고침하면 판이 처음으로 돌아간다.
 */

export function usePracticeRun() {
  const [session, setSession] = useState<PracticeSession | null>(null);
  /**
   * 지금 판의 상태를 렌더와 무관하게 들고 있는 사본.
   *
   * 판을 바꾸는 요청은 서로 다른 흐름에서 온다 — 매진은 화면을 그린 뒤 도는 effect가,
   * 좌석 잡기와 그만두기는 사용자의 클릭이 알린다. 화면에 그려진 값만 보고 판단하면
   * 그 사이에 이미 갈린 승부를 못 보고 덮어쓴다 (실패한 판이 성공으로 기록되는 식).
   *
   * ref는 렌더를 기다리지 않고 즉시 바뀌므로, 이걸 유일한 기준으로 삼으면
   * 먼저 도착한 요청이 확실하게 이긴다.
   */
  const current = useRef<PracticeSession | null>(null);

  /** 판을 통째로 갈아끼운다. 사본과 화면이 늘 같은 값을 보게 이 함수로만 바꾼다 */
  const replaceSession = (next: PracticeSession | null) => {
    current.current = next;
    setSession(next);
  };

  /**
   * 지금이 그 단계일 때만 판을 갱신한다. (단계를 넘기는 것도, 제자리에서 값만 바꾸는 것도)
   *
   * @param inPhase 이 단계일 때만 갱신한다. 아니면 아무 일도 하지 않고 null을 준다
   * @returns 갱신된 판. 갱신하지 못했으면 null
   */
  const updateInPhase = (
    inPhase: PracticeSession["phase"],
    toNext: (prev: PracticeSession) => PracticeSession
  ): PracticeSession | null => {
    const prev = current.current;
    if (!prev || prev.phase !== inPhase) return null;

    const next = toNext(prev);
    replaceSession(next);
    return next;
  };

  const start = (ticketCount: number, difficulty: PracticeDifficulty) => {
    replaceSession({
      phase: "zone",
      marks: { startedAt: Date.now() },
      ticketCount,
      difficulty,
      missClicks: 0,
    });
  };

  const pickZone = (zoneId: ZoneKind) => {
    updateInPhase("zone", (prev) => ({
      ...prev,
      phase: "captcha",
      zoneId,
      marks: { ...prev.marks, zonePickedAt: Date.now() },
    }));
  };

  // 보안문자를 통과해야 좌석 배치도가 열린다
  const passCaptcha = () => {
    updateInPhase("captcha", (prev) => ({
      ...prev,
      phase: "seat",
      marks: { ...prev.marks, captchaPassedAt: Date.now() },
    }));
  };

  /**
   * 좌석을 잡으면 예매 완료.
   * 완료 시각을 함께 돌려준다 — 호출자가 기록을 남길 때 시각을 다시 재면
   * 화면에 보이는 소요 시간과 저장되는 기록이 미세하게 어긋나기 때문이다.
   * 완료로 넘어가지 못했으면(이미 끝났거나 그만둔 판) null을 주어 기록을 남기지 않게 한다.
   */
  const pickSeat = (): number | null => {
    const finishedAt = Date.now();
    const next = updateInPhase("seat", (prev) => ({
      ...prev,
      phase: "done",
      marks: { ...prev.marks, finishedAt },
    }));
    return next ? finishedAt : null;
  };

  // 고를 자리가 다 나가 원하는 매수를 채울 수 없게 됐다 — 예매 실패
  const failSoldOut = () => {
    updateInPhase("seat", (prev) => ({
      ...prev,
      phase: "soldout",
      marks: { ...prev.marks, finishedAt: Date.now() },
    }));
  };

  const addMissClick = () => {
    updateInPhase("seat", (prev) => ({
      ...prev,
      missClicks: prev.missClicks + 1,
    }));
  };

  const reset = () => replaceSession(null);

  return {
    session,
    result: session ? calcResult(session.marks, session.missClicks) : null,
    start,
    pickZone,
    passCaptcha,
    pickSeat,
    failSoldOut,
    addMissClick,
    reset,
  };
}
