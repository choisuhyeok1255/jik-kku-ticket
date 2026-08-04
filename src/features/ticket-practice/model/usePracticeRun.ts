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
   * 이 판이 이미 끝났는지. 승부가 갈리는 순간에 성공과 실패가 겹치는 것을 막는다.
   *
   * 판을 끝내는 두 길(좌석 잡기 / 매진)은 서로 다른 흐름에서 온다 —
   * 매진은 화면을 그린 뒤 도는 effect가 알리고, 좌석 잡기는 사용자의 클릭이 알린다.
   * 그래서 매진이 감지된 직후, 그 결과가 화면에 반영되기 전에 마지막 클릭이 들어올 수 있다.
   * phase만 보고 판단하면 그 클릭이 낡은 값(아직 '좌석 선택')을 읽어 실패한 판을
   * 성공으로 덮고 최고 기록까지 남긴다.
   *
   * ref는 렌더를 기다리지 않고 즉시 바뀌므로, 먼저 도착한 쪽이 확실하게 이긴다.
   */
  const isFinished = useRef(false);
  const phase = session?.phase;

  const start = (ticketCount: number, difficulty: PracticeDifficulty) => {
    isFinished.current = false;
    setSession({
      phase: "zone",
      marks: { startedAt: Date.now() },
      ticketCount,
      difficulty,
      missClicks: 0,
    });
  };

  const pickZone = (zoneId: ZoneKind) => {
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        phase: "captcha",
        zoneId,
        marks: { ...prev.marks, zonePickedAt: Date.now() },
      };
    });
  };

  // 보안문자를 통과해야 좌석 배치도가 열린다
  const passCaptcha = () => {
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        phase: "seat",
        marks: { ...prev.marks, captchaPassedAt: Date.now() },
      };
    });
  };

  /**
   * 좌석을 잡으면 예매 완료.
   * 완료 시각을 함께 돌려준다 — 호출자가 기록을 남길 때 시각을 다시 재면
   * 화면에 보이는 소요 시간과 저장되는 기록이 미세하게 어긋나기 때문이다.
   * 이미 끝난 판이면 null을 주어, 호출자가 기록을 남기지 않게 한다.
   */
  const pickSeat = (): number | null => {
    // 좌석 화면에서 온 것만 완료로 친다 — 앞 단계에서 넘어오면 거쳐온 시각이 비어
    // 구간별 소요 시간을 낼 수 없고, 결과 화면이 영영 뜨지 않는다
    if (phase !== "seat" || isFinished.current) return null;
    isFinished.current = true;

    const finishedAt = Date.now();
    setSession((prev) => {
      if (!prev) return prev;
      return { ...prev, phase: "done", marks: { ...prev.marks, finishedAt } };
    });
    return finishedAt;
  };

  // 고를 자리가 다 나가 원하는 매수를 채울 수 없게 됐다 — 예매 실패
  const failSoldOut = () => {
    // 성공 쪽과 같은 조건으로 막는다. 한쪽만 느슨하면 진행 중이 아닌 판에 '끝남' 표시만
    // 남아, 뒤이은 좌석 잡기가 통째로 무시된다
    if (phase !== "seat" || isFinished.current) return;
    isFinished.current = true;

    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        phase: "soldout",
        marks: { ...prev.marks, finishedAt: Date.now() },
      };
    });
  };

  const addMissClick = () => {
    setSession((prev) => {
      if (!prev) return prev;
      return { ...prev, missClicks: prev.missClicks + 1 };
    });
  };

  const reset = () => {
    isFinished.current = false;
    setSession(null);
  };

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
