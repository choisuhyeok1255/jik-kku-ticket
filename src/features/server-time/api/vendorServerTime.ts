/**
 * 예매처 서버시간을 '밀리초 정밀도'로 복원하는 서버 사이드 로직. (네이비즘 방식)
 *
 * 문제: HTTP `Date` 헤더는 '초 단위'라 밀리초를 알 수 없어, 그냥 읽으면 평균 0.5초 뒤처진다.
 * 해결: 예매처에 짧은 간격으로 반복 요청해 `Date` 헤더의 '초가 바뀌는 순간'을 포착한다.
 *       초가 막 바뀐 순간은 곧 그 초의 .000이므로, 이때의 (예매처시각 - 우리서버시각)을
 *       오프셋으로 잡으면 밀리초까지 정확해진다. (초 경계 감지)
 *
 * 오프셋은 예매처마다 메모리에 캐싱한다(TTL). 예매처-표준시 차이는 잘 변하지 않으므로,
 * 매 요청마다 예매처를 두드리지 않고 캐시된 오프셋으로 즉시 현재 시각을 계산한다.
 */

const OFFSET_TTL_MS = 5 * 60 * 1000; // 캐시 유효기간 5분
const DETECT_BUDGET_MS = 1800; // 초 경계 감지에 쓸 최대 시간
const POLL_INTERVAL_MS = 70; // 예매처 재요청 간격
const REQUEST_TIMEOUT_MS = 3000; // 개별 요청 타임아웃

interface CachedOffset {
  offset: number; // 예매처시각(ms) - 우리서버시각(ms)
  precise: boolean; // 초 경계로 잡은 정밀 오프셋인지
  ts: number; // 캐시 저장 시각
}

// 예매처 key별 오프셋 캐시 (모듈 스코프 = 서버 인스턴스 수명 동안 유지)
const offsetCache = new Map<string, CachedOffset>();

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

interface DateSample {
  sec: number; // Date 헤더의 시각(ms, 단 밀리초는 항상 .000)
  mid: number; // 요청 왕복의 중간 시각(우리서버 기준 ms)
}

/** 예매처에 한 번 요청해 Date 헤더와 왕복 중간 시각을 얻는다. */
async function fetchDateSample(url: string): Promise<DateSample | null> {
  const before = Date.now();
  try {
    const res = await fetch(url, {
      method: "HEAD",
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const after = Date.now();
    const dateHeader = res.headers.get("date");
    if (!dateHeader) return null;

    const sec = new Date(dateHeader).getTime();
    if (Number.isNaN(sec)) return null;

    return { sec, mid: (before + after) / 2 };
  } catch {
    return null;
  }
}

/**
 * 초 경계 감지로 예매처의 (예매처시각 - 우리서버시각) 오프셋을 구한다.
 * 경계를 못 잡으면 마지막 초 단위 값으로 근사 오프셋을 반환한다(precise=false).
 */
async function detectOffset(
  url: string
): Promise<{ offset: number; precise: boolean } | null> {
  let prev = await fetchDateSample(url);
  if (!prev) return null;

  const deadline = Date.now() + DETECT_BUDGET_MS;
  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS);
    const cur = await fetchDateSample(url);
    if (!cur) continue;

    if (cur.sec !== prev.sec) {
      // 초가 막 바뀐 순간 = 새 초의 .000. 그 순간 우리서버 시각은 cur.mid.
      return { offset: cur.sec - cur.mid, precise: true };
    }
    prev = cur;
  }

  // 경계 못 잡음 → 초 단위 근사 (평균 0.5초 뒤처질 수 있음)
  return { offset: prev.sec - prev.mid, precise: false };
}

export interface ServerTimeResult {
  serverTime: number; // 예매처의 현재 시각(ms, 밀리초 정밀)
  precise: boolean; // 초 경계로 잡은 정밀 값인지
  fallback: boolean; // 예매처 접근 실패로 우리서버 시각으로 대체했는지
}

/**
 * 예매처의 현재 서버시간을 밀리초 정밀도로 반환한다.
 * 캐시된 오프셋이 유효하면 즉시 계산하고, 없거나 만료됐으면 초 경계 감지를 수행한다.
 */
export async function getVendorServerTime(
  vendorKey: string,
  pingUrl: string
): Promise<ServerTimeResult> {
  const cached = offsetCache.get(vendorKey);
  if (cached && Date.now() - cached.ts < OFFSET_TTL_MS) {
    return {
      serverTime: Date.now() + cached.offset,
      precise: cached.precise,
      fallback: false,
    };
  }

  const detected = await detectOffset(pingUrl);
  if (!detected) {
    // 예매처 접근 실패 → 우리서버 시각으로 폴백
    return { serverTime: Date.now(), precise: false, fallback: true };
  }

  offsetCache.set(vendorKey, {
    offset: detected.offset,
    precise: detected.precise,
    ts: Date.now(),
  });

  return {
    serverTime: Date.now() + detected.offset,
    precise: detected.precise,
    fallback: false,
  };
}
