"use client";

import { useEffect, useState } from "react";
import { BEST_RECORD_KEY } from "../config/practice";

/**
 * 최고 기록(가장 짧은 총 소요 시간)을 localStorage로 관리하는 훅.
 *
 * 키는 호출자가 정한다. 지금은 예매처와 난이도를 묶어 쓰는데(`nol:hard`),
 * 조건이 다르면 기록을 견줄 수 없기 때문이다.
 *
 * SSR에서는 localStorage를 읽을 수 없으므로 loaded=false로 시작하고,
 * 클라이언트 마운트 후 값을 반영한다. (하이드레이션 불일치 방지)
 */

type BestRecords = Record<string, number>;

interface UseBestRecordResult {
  best: BestRecords;
  loaded: boolean;
  /** 기존 기록보다 빠르면 갱신하고 true를 반환한다 */
  submitRecord: (key: string, totalMs: number) => boolean;
}

export function useBestRecord(): UseBestRecordResult {
  const [best, setBest] = useState<BestRecords>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadSavedRecords = () => {
      try {
        const raw = localStorage.getItem(BEST_RECORD_KEY);
        if (raw) setBest(JSON.parse(raw) as BestRecords);
      } catch {
        // 저장값이 깨졌으면 기록 없이 시작한다
      }
      setLoaded(true);
    };
    loadSavedRecords();
  }, []);

  const submitRecord = (key: string, totalMs: number) => {
    const previous = best[key];
    if (previous !== undefined && previous <= totalMs) return false;

    const next = { ...best, [key]: totalMs };
    setBest(next);
    try {
      localStorage.setItem(BEST_RECORD_KEY, JSON.stringify(next));
    } catch {
      // 저장에 실패해도 이번 판 결과 표시에는 지장이 없다
    }
    return true;
  };

  return { best, loaded, submitRecord };
}
