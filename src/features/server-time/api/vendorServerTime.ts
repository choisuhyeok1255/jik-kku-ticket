/**
 * 예매처 서버시간을 '밀리초 정밀도'로 복원하는 서버 사이드 로직. (네이비즘 방식)
 *
 * 문제: HTTP `Date` 헤더는 '초 단위'라 밀리초를 알 수 없다.
 * 해결: 예매처를 여러 번 찔러 관측할 때마다 오프셋 후보 구간을 좁힌다(이분 탐색).
 *       관측 한 번은 "그 순간 예매처가 s초대였다"는 사실을 주고, 이는 곧
 *       오프셋이 [s - 관측시각, s - 관측시각 + 1000) 안에 있다는 제약이다.
 *       다음 관측을 '현재 추정 구간의 한가운데가 초 경계가 되는 시각'에 맞춰 쏘면
 *       구간이 매번 절반으로 줄어든다.
 *
 * 초 경계를 '발견한 순간'을 그대로 .000으로 쓰던 이전 방식은 발견이 늘 늦어
 * 오프셋이 평균 (폴링간격 + 왕복지연)/2 만큼 뒤처졌다. 구간의 중앙값을 쓰는
 * 지금 방식은 그 편향이 없다.
 *
 * 오프셋은 예매처마다 메모리에 캐싱한다. 캐시가 오래됐어도 일단 그 값을 돌려주고
 * 갱신은 호출자가 응답 뒤에서 처리하도록 `refresh`를 함께 반환한다(응답 지연 방지).
 */

const FRESH_TTL_MS = 5 * 60 * 1000; // 정밀하게 측정된 값은 이 동안 갱신 불필요
const IMPRECISE_TTL_MS = 3 * 60 * 1000; // 목표 폭에 못 미친 값은 더 짧게만 신뢰한다
const STALE_MAX_MS = 30 * 60 * 1000; // 이걸 넘으면 백그라운드 갱신을 믿지 않고 다시 측정
const RETRY_COOLDOWN_MS = 60 * 1000; // 측정 실패 후 이 시간 안에는 다시 시도하지 않는다
const TARGET_WIDTH_MS = 60; // 오프셋 추정 구간을 이 폭까지 좁히면 종료
const MAX_NARROWINGS = 7; // 구간을 좁히는 횟수 상한. 이상적 이분이면 1000ms → 약 31ms까지 좁혀진다
const MAX_OBSERVATIONS = 12; // 총 요청 횟수 상한 (이상치·실패로 버리는 관측 포함)
const CONFLICTS_BEFORE_RESET = 2; // 이만큼 연달아 어긋나야 예매처 시계가 움직였다고 본다
const DETECT_DEADLINE_MS = 8000; // 감지 전체 예산
const REQUEST_TIMEOUT_MS = 3000; // 개별 요청 타임아웃
const FAILED_PROBE_DELAY_MS = 150; // 관측 실패 후 쉬는 시간 (연속 실패 시 몰아치지 않도록)

// 예매처 시각을 못 구했을 때 쓰는 '정밀도 미상' 센티널.
// 실측 정밀도는 구조상 500ms(구간 폭 1000의 절반)를 넘을 수 없으므로 이 값과 겹치지 않는다.
const UNKNOWN_PRECISION_MS = 1000;

interface CachedOffset {
  offset: number; // 예매처시각(ms) - 우리서버시각(ms)
  precisionMs: number; // 추정 오차 폭(±ms)
  ts: number; // 측정에 성공한 시각
}

// 예매처 key별 오프셋 캐시 (모듈 스코프 = 서버 인스턴스 수명 동안 유지)
const offsetCache = new Map<string, CachedOffset>();

// 예매처별 마지막 측정 시도 시각 (성공·실패 무관).
// 한 번도 성공한 적 없는 예매처도 여기 남아야 실패한 곳을 쉬지 않고 두드리는 일을 막을 수 있다.
const lastAttemptAt = new Map<string, number>();

// 같은 예매처를 동시에 중복 측정하지 않도록 진행 중인 감지를 공유한다
const inFlight = new Map<string, Promise<DetectedOffset | null>>();

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

interface DateSample {
  sec: number; // Date 헤더가 가리키는 '그 초의 시작'(ms, 밀리초는 항상 .000)
  mid: number; // 요청 왕복의 중간 시각(우리서버 기준 ms)
  rtt: number; // 왕복 소요 시간(ms)
}

/**
 * 예매처에 한 번 요청해 Date 헤더와 왕복 중간 시각을 얻는다.
 * 개별 요청이 전체 예산을 넘겨 늘어지지 않도록 남은 예산으로 타임아웃을 자른다.
 */
async function fetchDateSample(
  url: string,
  deadline: number
): Promise<DateSample | null> {
  const timeout = Math.min(REQUEST_TIMEOUT_MS, deadline - Date.now());
  if (timeout <= 0) return null;

  const before = Date.now();
  try {
    const res = await fetch(url, {
      method: "HEAD",
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(timeout),
    });
    const after = Date.now();
    const dateHeader = res.headers.get("date");
    if (!dateHeader) return null;

    const sec = new Date(dateHeader).getTime();
    if (Number.isNaN(sec)) return null;

    return { sec, mid: (before + after) / 2, rtt: after - before };
  } catch {
    return null;
  }
}

/** 오프셋이 들어있을 수 있는 범위. [lo, hi) */
interface OffsetRange {
  lo: number;
  hi: number;
}

const rangeWidth = (range: OffsetRange): number => range.hi - range.lo;
const rangeCenter = (range: OffsetRange): number => (range.lo + range.hi) / 2;

interface NarrowResult {
  /** 관측이 기존 구간과 겹치지 않았는지 */
  conflicted: boolean;
  /** 겹쳤으면 좁혀진 구간, 어긋났으면 이 관측만으로 다시 세운 구간 */
  range: OffsetRange;
}

/**
 * 관측 하나로 오프셋 범위를 좁힌다.
 * 관측 시각 mid에 예매처가 sec초대였다 = 오프셋이 [sec - mid, sec - mid + 1000)에 있다.
 *
 * 왕복 지연이 튄 관측은 mid 추정이 어긋나 기존 구간과 겹치지 않을 수 있다. 그 교집합을
 * 그대로 쓰면 구간이 역전(lo > hi)돼 엉뚱한 값으로 수렴하므로 어긋났음을 알려주기만 하고,
 * 기존 구간을 버릴지는 호출자가 판단한다. (어긋난 관측 자체가 이상치일 가능성이 높다)
 */
function narrowRange(range: OffsetRange, sample: DateSample): NarrowResult {
  const lo = sample.sec - sample.mid;
  const narrowed = {
    lo: Math.max(range.lo, lo),
    hi: Math.min(range.hi, lo + 1000),
  };
  if (narrowed.lo >= narrowed.hi) {
    return { conflicted: true, range: { lo, hi: lo + 1000 } };
  }
  return { conflicted: false, range: narrowed };
}

/**
 * 다음 관측을 쏠 시각을 정한다.
 * 오프셋이 현재 구간의 중앙값이라면 초 경계가 되는 시각을 노린다. 그 지점에서
 * 초가 이미 넘어갔는지 여부가 '오프셋이 중앙보다 큰가'를 그대로 알려주므로 구간이 반으로 준다.
 */
function nextProbeDelay(range: OffsetRange, rtt: number): number {
  const mid = rangeCenter(range);
  const now = Date.now();
  // (관측시각 + mid)가 1000의 배수가 되는 가장 이른 시각
  const boundary = Math.ceil((now + mid) / 1000) * 1000 - mid;
  // 요청은 왕복의 중간이 boundary에 놓이도록 rtt/2 먼저 출발시킨다
  let delay = boundary - rtt / 2 - now;
  while (delay < 0) delay += 1000;
  return delay;
}

/** 이분 탐색의 진행 상태 */
interface SearchState {
  range: OffsetRange;
  rtt: number; // 다음 관측 시각을 맞추는 데 쓸 직전 왕복 시간
  narrowings: number; // 구간을 실제로 좁힌 횟수
  conflicts: number; // 연달아 어긋난 관측 수
}

const INITIAL_STATE: SearchState = {
  range: { lo: -Infinity, hi: Infinity },
  rtt: 0,
  narrowings: 0,
  conflicts: 0,
};

/**
 * 관측 하나를 탐색 상태에 반영한다.
 *
 * 기존 구간과 어긋나는 관측은 지연이 튄 이상치로 보고 버린다(상태를 바꾸지 않는다).
 * 연달아 어긋날 때만 예매처 시계가 실제로 움직였다고 보고 그 관측 기준으로 다시 시작한다.
 * 이상치의 왕복 시간은 다음 관측 스케줄을 망치므로 채택하지 않는다.
 */
function applyObservation(state: SearchState, sample: DateSample): SearchState {
  const { conflicted, range } = narrowRange(state.range, sample);

  if (conflicted) {
    const conflicts = state.conflicts + 1;
    if (conflicts < CONFLICTS_BEFORE_RESET) return { ...state, conflicts };
    return { range, rtt: sample.rtt, narrowings: 1, conflicts: 0 };
  }

  // 프로브 시각이 흔들리면 구간이 그대로일 수 있다. 그때는 '좁혔다'로 세지 않는다
  const narrowed = rangeWidth(range) < rangeWidth(state.range);
  return {
    range,
    rtt: sample.rtt,
    narrowings: state.narrowings + (narrowed ? 1 : 0),
    conflicts: 0,
  };
}

interface DetectedOffset {
  offset: number;
  /**
   * 추정 오차 폭(±ms). 관측들의 제약 구간에서 나온 값이며,
   * 왕복 지연의 상·하행 비대칭에서 오는 편향은 포함하지 않는다.
   */
  precisionMs: number;
}

/**
 * 예매처의 (예매처시각 - 우리서버시각) 오프셋을 이분 탐색으로 측정한다.
 * 목표 폭에 도달하거나 예산이 끝나면 그때까지 좁혀진 구간의 중앙값을 반환한다.
 */
async function detectOffset(url: string): Promise<DetectedOffset | null> {
  const deadline = Date.now() + DETECT_DEADLINE_MS;
  let state = INITIAL_STATE;

  for (let observations = 0; observations < MAX_OBSERVATIONS; observations++) {
    if (state.narrowings >= MAX_NARROWINGS) break;

    // 첫 관측은 구간이 없으니 곧바로, 이후에는 구간 중앙이 초 경계가 되는 시점에 맞춰 쏜다
    if (state.narrowings > 0) {
      const delay = nextProbeDelay(state.range, state.rtt);
      if (Date.now() + delay + state.rtt > deadline) break;
      await sleep(delay);
    }

    const sample = await fetchDateSample(url, deadline);
    if (!sample) {
      if (Date.now() + FAILED_PROBE_DELAY_MS >= deadline) break;
      await sleep(FAILED_PROBE_DELAY_MS);
      continue;
    }

    // 받아온 관측은 데드라인과 무관하게 유효한 제약이므로 먼저 반영하고 종료를 판단한다
    state = applyObservation(state, sample);
    if (rangeWidth(state.range) <= TARGET_WIDTH_MS) break;
    if (Date.now() >= deadline) break;
  }

  if (state.narrowings === 0) return null;

  return {
    offset: rangeCenter(state.range),
    precisionMs: rangeWidth(state.range) / 2,
  };
}

/**
 * 진행 중인 감지가 있으면 그것을 공유하고, 결과를 캐시에 반영한다.
 * 성공·실패와 무관하게 시도 시각을 남긴다 — 그래야 접근이 막힌 예매처를 쉬지 않고 두드리지 않는다.
 */
function detectAndCache(
  vendorKey: string,
  pingUrl: string
): Promise<DetectedOffset | null> {
  const running = inFlight.get(vendorKey);
  if (running) return running;

  const task = detectOffset(pingUrl)
    .catch(() => null)
    .then((detected) => {
      if (detected) {
        offsetCache.set(vendorKey, { ...detected, ts: Date.now() });
      }
      return detected;
    })
    .finally(() => {
      lastAttemptAt.set(vendorKey, Date.now());
      inFlight.delete(vendorKey);
    });

  inFlight.set(vendorKey, task);
  return task;
}

export interface ServerTimeResult {
  /** 우리서버 시각에 더하면 예매처 시각이 되는 보정값(ms) */
  offset: number;
  /** 오프셋 추정 오차 폭(±ms). 클수록 부정확 */
  precisionMs: number;
  /** 예매처 접근 실패로 우리서버 시각을 그대로 쓰는 중인지 */
  fallback: boolean;
  /** 캐시가 오래돼 갱신이 필요할 때만 채워진다. 호출자가 응답 뒤에서 실행한다 */
  refresh?: () => Promise<void>;
}

/** 예매처 시각을 모를 때의 응답 (우리서버 시각을 그대로 쓴다) */
const FALLBACK_RESULT: ServerTimeResult = {
  offset: 0,
  precisionMs: UNKNOWN_PRECISION_MS,
  fallback: true,
};

const toResult = (measured: DetectedOffset): ServerTimeResult => ({
  offset: measured.offset,
  precisionMs: measured.precisionMs,
  fallback: false,
});

/** 측정값이 목표 정밀도에 도달했으면 오래 신뢰하고, 못 미쳤으면 더 일찍 다시 재도록 한다. */
const freshTtlFor = (cached: CachedOffset): number =>
  cached.precisionMs * 2 > TARGET_WIDTH_MS ? IMPRECISE_TTL_MS : FRESH_TTL_MS;

/**
 * 예매처 시각 보정값(오프셋)을 반환한다.
 *
 * - 캐시가 신선하면 즉시 반환한다. (목표 정밀도에 못 미친 값은 더 짧게만 신선하다고 본다)
 * - 캐시가 오래됐지만 쓸 만하면 일단 반환하고, 갱신용 `refresh`를 함께 준다.
 * - 캐시가 없거나 너무 낡았으면 지금 측정한다(수 초 걸릴 수 있음).
 * - 직전 측정이 실패한 지 얼마 안 됐으면 다시 두드리지 않는다. 쓸 캐시가 있으면 그거라도 쓰고,
 *   그마저 없을 때만 우리서버 시각으로 폴백한다.
 */
export async function getVendorServerTime(
  vendorKey: string,
  pingUrl: string
): Promise<ServerTimeResult> {
  const cached = offsetCache.get(vendorKey);
  if (cached && Date.now() - cached.ts < freshTtlFor(cached)) {
    return toResult(cached);
  }

  const sinceAttempt = Date.now() - (lastAttemptAt.get(vendorKey) ?? -Infinity);
  const canRetry = sinceAttempt >= RETRY_COOLDOWN_MS;
  const refresh = async () => {
    await detectAndCache(vendorKey, pingUrl);
  };

  // 오래됐지만 아직 쓸 만함 → 지금 값으로 응답하고 갱신은 응답 뒤로 미룬다
  if (cached && Date.now() - cached.ts < STALE_MAX_MS) {
    return { ...toResult(cached), refresh: canRetry ? refresh : undefined };
  }

  // 지금 다시 잴 수 없다 → 낡았더라도 있는 값이 우리서버 시각보다는 예매처에 가깝다
  if (!canRetry) return cached ? toResult(cached) : FALLBACK_RESULT;

  const detected = await detectAndCache(vendorKey, pingUrl);
  if (detected) return toResult(detected);
  return cached ? toResult(cached) : FALLBACK_RESULT;
}
