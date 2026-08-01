"use client";

import { useEffect, useState } from "react";
import { BEST_RECORD_KEY } from "../config/practice";
import { buildRecordKey } from "../lib/buildRecordKey";
import { PracticeDifficulty, PracticeVendor } from "./types";

/**
 * 최고 기록(가장 짧은 총 소요 시간)을 localStorage로 관리하는 훅.
 *
 * 예매처와 난이도가 다르면 조건이 달라 기록을 견줄 수 없으므로 그 조합마다 따로 남긴다.
 * 어떤 키로 저장하는지는 훅 안에서만 알면 되므로, 쓰는 쪽은 조건만 넘긴다.
 *
 * SSR에서는 localStorage를 읽을 수 없으므로 빈 기록으로 시작하고, 클라이언트 마운트 후
 * 저장값을 반영한다. (서버와 첫 렌더 결과를 맞춰 하이드레이션 불일치를 막는다)
 */

type BestRecords = Record<string, number>;

interface UseBestRecordResult {
  /** 해당 조건의 최고 기록(ms). 아직 없으면 undefined */
  getBest: (
    vendor: PracticeVendor,
    difficulty: PracticeDifficulty
  ) => number | undefined;
  /** 기존 기록보다 빠르면 갱신하고 true를 반환한다 */
  submitRecord: (
    vendor: PracticeVendor,
    difficulty: PracticeDifficulty,
    totalMs: number
  ) => boolean;
}

export function useBestRecord(): UseBestRecordResult {
  const [best, setBest] = useState<BestRecords>({});

  useEffect(() => {
    const loadSavedRecords = () => {
      try {
        const raw = localStorage.getItem(BEST_RECORD_KEY);
        if (raw) setBest(JSON.parse(raw) as BestRecords);
      } catch {
        // 저장값이 깨졌으면 기록 없이 시작한다
      }
    };
    loadSavedRecords();
  }, []);

  const getBest = (
    vendor: PracticeVendor,
    difficulty: PracticeDifficulty
  ): number | undefined => best[buildRecordKey(vendor, difficulty)];

  const submitRecord = (
    vendor: PracticeVendor,
    difficulty: PracticeDifficulty,
    totalMs: number
  ) => {
    const key = buildRecordKey(vendor, difficulty);
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

  return { getBest, submitRecord };
}
