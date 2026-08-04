"use client";

import { useEffect, useState } from "react";
import { BEST_RECORD_KEY } from "../config/practice";
import { mergeBestRecords, readValidRecords } from "../lib/bestRecords";
import { BestRecords, PracticeDifficulty } from "./types";

/**
 * 최고 기록(가장 짧은 총 소요 시간)을 localStorage로 관리하는 훅.
 *
 * 난이도가 다르면 좌석이 나가는 속도가 달라 기록을 견줄 수 없으므로 난이도마다 따로 남긴다.
 * 저장값은 읽을 때마다 한 번 걸러, 옛 형식이나 손상된 값이 화면까지 새지 않게 한다.
 * 마운트할 때는 거기서 그치지 않고 **걸러낸 결과로 저장소를 덮어써 한 번 정리한다.**
 *
 * SSR에서는 localStorage를 읽을 수 없으므로 빈 기록으로 시작하고, 클라이언트 마운트 후
 * 저장값을 반영한다. (서버와 첫 렌더 결과를 맞춰 하이드레이션 불일치를 막는다)
 */

/** 저장된 문자열. 저장된 적 없거나 읽을 수 없으면 null */
function readStoredText(): string | null {
  try {
    return localStorage.getItem(BEST_RECORD_KEY);
  } catch {
    return null;
  }
}

/** 저장된 문자열을 JSON으로 읽는다. 깨져서 못 읽으면 undefined */
function parseRecords(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/** 저장된 기록 중 지금 형식에 맞는 것만. 없거나 읽을 수 없으면 빈 기록 */
function readStoredRecords(): BestRecords {
  const text = readStoredText();
  if (!text) return {};
  return readValidRecords(parseRecords(text)).valid;
}

/**
 * 저장된 기록을 읽으면서, 못 쓰는 항목이 섞여 있었으면 그 자리에서 정리한다.
 *
 * 기록을 쓸 때만 정리하면 더 좋은 기록을 못 내는 사용자의 저장소에는
 * 옛 항목이 계속 남는다. 읽는 김에 한 번 덮어써서 그때 털어낸다.
 */
function loadAndCleanStoredRecords(): BestRecords {
  const text = readStoredText();
  // 저장된 적이 없으면 정리할 것도 없다 (없던 키를 새로 만들지 않는다)
  if (!text) return {};

  const { valid, isStale } = readValidRecords(parseRecords(text));
  if (!isStale) return valid;

  try {
    localStorage.setItem(BEST_RECORD_KEY, JSON.stringify(valid));
  } catch {
    // 정리에 실패해도 읽어온 기록을 쓰는 데는 지장이 없다
  }
  return valid;
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
    const loadSavedRecords = () => setBest(loadAndCleanStoredRecords());
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
