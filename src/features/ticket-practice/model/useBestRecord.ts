"use client";

import { useEffect, useState } from "react";
import { BEST_RECORD_KEY } from "../config/practice";
import { mergeBestRecords, pickValidRecords } from "../lib/bestRecords";
import { BestRecords, PracticeDifficulty } from "./types";

/**
 * 최고 기록(가장 짧은 총 소요 시간)을 localStorage로 관리하는 훅.
 *
 * 난이도가 다르면 좌석이 나가는 속도가 달라 기록을 견줄 수 없으므로 난이도마다 따로 남긴다.
 * 저장값은 읽을 때마다 한 번 걸러, 옛 형식이나 손상된 값이 화면까지 새지 않게 한다.
 *
 * SSR에서는 localStorage를 읽을 수 없으므로 빈 기록으로 시작하고, 클라이언트 마운트 후
 * 저장값을 반영한다. (서버와 첫 렌더 결과를 맞춰 하이드레이션 불일치를 막는다)
 */

/** 저장된 기록을 읽어온다. 없거나 읽을 수 없으면 빈 기록 */
function readStoredRecords(): BestRecords {
  try {
    const raw = localStorage.getItem(BEST_RECORD_KEY);
    if (!raw) return {};
    return pickValidRecords(JSON.parse(raw));
  } catch {
    // 저장값이 깨졌으면 기록이 없는 것으로 본다
    return {};
  }
}

interface UseBestRecordResult {
  /** 해당 난이도의 최고 기록(ms). 아직 없으면 undefined */
  getBest: (difficulty: PracticeDifficulty) => number | undefined;
  /** 기존 기록보다 빠르면 갱신하고 true를 반환한다 */
  submitRecord: (difficulty: PracticeDifficulty, totalMs: number) => boolean;
}

export function useBestRecord(): UseBestRecordResult {
  const [best, setBest] = useState<BestRecords>({});

  useEffect(() => {
    const loadSavedRecords = () => setBest(readStoredRecords());
    loadSavedRecords();
  }, []);

  const getBest = (difficulty: PracticeDifficulty): number | undefined =>
    best[difficulty];

  const submitRecord = (difficulty: PracticeDifficulty, totalMs: number) => {
    /**
     * 화면이 들고 있는 기록과 저장된 기록을 **합쳐서** 판단하고 그 위에 얹는다.
     *
     * 둘 다 봐야 하는 이유가 서로 다르다.
     * - 저장값: 연습 페이지를 탭 두 개로 열어두면 각 탭은 자기가 켜질 때의 기록만 안다.
     *   화면만 보고 덮으면 다른 탭이 세운 기록이 지워진다.
     * - 화면값: 저장이 막힌 환경(사파리 프라이빗 모드 등)에서는 저장값이 늘 비어 있다.
     *   저장값만 보면 점점 느려져도 매번 최고 기록으로 판정된다.
     */
    const merged = mergeBestRecords(best, readStoredRecords());
    const previous = merged[difficulty];
    if (previous !== undefined && previous <= totalMs) {
      setBest(merged);
      return false;
    }

    const next = { ...merged, [difficulty]: totalMs };
    setBest(next);
    try {
      localStorage.setItem(BEST_RECORD_KEY, JSON.stringify(next));
    } catch {
      // 저장에 실패해도 이번 판 결과 표시에는 지장이 없다
    }
    return true;
  };

  return { getBest, submitRecord };
}
