"use client";

import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchServerTime } from "../api/fetchServerTime";
import { serverTimeKeys } from "./serverTimeKeys";

/**
 * 특정 시간 소스(표준시 또는 예매처)에 동기화된 실시간 시계 훅.
 *
 * 동작:
 *  1) react-query로 /api/server-time 을 조회해 소스의 시각·오프셋을 받는다.
 *     (왕복 보정된 오프셋은 fetchServerTime이 계산한다)
 *  2) 30초마다 자동 재조회(refetchInterval)해 오차 누적을 막는다.
 *  3) 50ms 로컬 틱으로 브라우저 시계 + 오프셋을 부드럽게 흘려보낸다.
 *  4) 탭(vendor) 전환 시 keepPreviousData로 이전 시각을 유지해 깜빡임을 줄인다.
 *
 * @param vendor 예매처 key. 비우면(undefined) 표준시(우리 서버 시각)를 사용한다.
 */

export type ClockState = "loading" | "synced" | "error";

interface UseServerClockResult {
  serverNow: number | null;
  state: ClockState;
}

export function useServerClock(vendor?: string): UseServerClockResult {
  const {
    data: serverTimeSample,
    isError: isServerTimeError,
    isPlaceholderData: isPreviousSourceSample,
  } = useQuery({
    queryKey: serverTimeKeys.source(vendor),
    queryFn: () => fetchServerTime(vendor),
    refetchInterval: 30_000,
    placeholderData: keepPreviousData,
  });

  // 화면 갱신 (부드러운 틱) — 마운트 후 첫 틱부터 시각을 채운다 (하이드레이션 방지)
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 50);
    return () => clearInterval(tick);
  }, []);

  const offset = serverTimeSample?.offset ?? 0;
  const serverNow = now === null ? null : now + offset;

  const state: ClockState = getClockState(
    isServerTimeError,
    isPreviousSourceSample,
    serverTimeSample?.ok
  );

  return { serverNow, state };
}

/** 쿼리 상태 + 응답 ok 여부를 시계 표시 상태로 변환한다. */
function getClockState(
  isError: boolean,
  isPreviousSourceSample: boolean,
  ok?: boolean
): ClockState {
  if (isError) return "error";
  // 아직 이전 소스의 값을 보여주는 중이므로 이 소스와 동기화됐다고 말할 수 없다
  if (isPreviousSourceSample) return "loading";
  if (ok === undefined) return "loading"; // 아직 첫 응답 전
  return ok ? "synced" : "error";
}
