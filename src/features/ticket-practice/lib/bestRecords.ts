import { DIFFICULTY_KEYS } from "../config/practice";
import { BestRecords } from "../model/types";

/**
 * 최고 기록 값을 다루는 순수 함수들.
 * 기록은 화면(메모리)과 localStorage 두 곳에 있어, 읽어들일 때 거르고 합칠 필요가 있다.
 */

/**
 * 두 기록을 합친다. 같은 난이도가 양쪽에 있으면 더 빠른(작은) 쪽을 남긴다.
 *
 * 기록이 두 곳에 나뉘어 있기 때문에 필요하다 — 화면이 들고 있는 값과 저장된 값은
 * 다른 탭의 갱신이나 저장 실패로 서로 어긋날 수 있고, 어느 한쪽만 믿으면 기록이 사라지거나
 * 느려진 기록이 최고 기록으로 잘못 판정된다.
 */
export function mergeBestRecords(a: BestRecords, b: BestRecords): BestRecords {
  const merged: BestRecords = { ...a };
  DIFFICULTY_KEYS.forEach((difficulty) => {
    const other = b[difficulty];
    if (other === undefined) return;

    const mine = merged[difficulty];
    merged[difficulty] = mine === undefined ? other : Math.min(mine, other);
  });
  return merged;
}

/** 난이도 키에 양수 값이 담긴 항목만 남긴다 */
function pickValidRecords(stored: Record<string, unknown>): BestRecords {
  const valid: BestRecords = {};
  DIFFICULTY_KEYS.forEach((difficulty) => {
    const value = stored[difficulty];
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      valid[difficulty] = value;
    }
  });
  return valid;
}

/**
 * 저장값에서 지금 형식에 맞는 기록만 골라내고, 버린 항목이 있었는지 함께 알려준다.
 *
 * **거르는 이유** — 저장 키는 그대로 두고 값의 형태만 바꿔왔다(예전에는 `예매처:난이도`가
 * 키였다). 값도 함께 확인한다. 소요 시간은 양수여야 하는데 0이나 음수가 섞여 들어오면
 * 어떤 기록으로도 깰 수 없어 그 난이도의 기록 갱신이 영영 막힌다.
 *
 * **버린 항목을 알려주는 이유** — 읽은 쪽이 저장소를 정리해줘야 못 쓰는 항목이
 * 계속 따라다니지 않는다. 판정을 거르는 쪽 안에 두어, 무엇을 걸렀는지와 어긋날 수 없게 한다.
 *
 * @param raw JSON.parse 결과 (무엇이든 들어올 수 있다)
 */
export function readValidRecords(raw: unknown): {
  valid: BestRecords;
  isStale: boolean;
} {
  // 객체가 아니면 통째로 못 쓰는 값이다
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { valid: {}, isStale: true };
  }

  const valid = pickValidRecords(raw as Record<string, unknown>);
  // 고른 결과는 늘 원본의 부분집합이라 항목 수만 견주면 된다
  return {
    valid,
    isStale: Object.keys(raw).length !== Object.keys(valid).length,
  };
}
