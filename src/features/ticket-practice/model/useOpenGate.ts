"use client";

import { useEffect, useState } from "react";
import { PracticeVendor } from "./types";

/**
 * 예매 버튼이 열렸는지를 예매처 방식대로 판정하는 훅.
 *
 * - NOL: 오픈 시각이 되면 버튼이 저절로 살아난다 → 현재 시각으로 판정하며 실시간 갱신한다.
 * - 티켓링크: 시간이 돼도 그대로면 버튼이 죽어 있고, **새로고침을 해야** 살아난다
 *   → '이번 페이지 로드 시각'이 오픈 이후인지로 판정한다. 오픈 전에 새로고침하면 여전히 닫혀 있다.
 *
 * @param vendor 연습 대상 예매처
 * @param openAt 예매가 열리는 시각(ms)
 * @param pageLoadedAt 이번 페이지가 로드된 시각(ms)
 */

interface UseOpenGateResult {
  /** 오픈 시각이 지났는지 (사실 자체) */
  isOpen: boolean;
  /** 지금 예매 버튼을 누를 수 있는지 (예매처 방식 반영) */
  canEnter: boolean;
  /** 오픈까지 남은 시간(ms). 이미 지났으면 0 */
  remainMs: number;
}

export function useOpenGate(
  vendor: PracticeVendor,
  openAt: number,
  pageLoadedAt: number
): UseOpenGateResult {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 50);
    return () => clearInterval(tick);
  }, []);

  const isOpen = now >= openAt;
  const canEnter = vendor === "nol" ? isOpen : pageLoadedAt >= openAt;

  return { isOpen, canEnter, remainMs: Math.max(0, openAt - now) };
}
