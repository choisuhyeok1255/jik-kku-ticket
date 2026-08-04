/**
 * 티켓팅 연습의 규칙 상수.
 * 실제 예매 절차(구역 → 보안문자 → 좌석)를 흉내 내는 데 쓰는 값들이다.
 */

/** 연습 시작 전에 고를 수 있는 표 수 */
export const TICKET_COUNT_OPTIONS = [1, 2, 3, 4] as const;

/** 야구는 둘이 가는 경우가 가장 흔하다 */
export const DEFAULT_TICKET_COUNT = 2;

/** 좌석이 팔려나가는 것을 화면에 반영하는 주기 */
export const SELLOUT_INTERVAL_MS = 400;

/**
 * 난이도.
 *
 * - `durationMs` — 그 구역의 빈자리가 모두 나가기까지 걸리는 시간.
 *   '남은 자리의 몇 %'로 깎으면 구역 크기에 따라 난이도가 7배까지 벌어지므로
 *   ('빈자리가 적은 테이블석은 순식간에, 외야는 한참 버틴다),
 *   '처음 빈자리를 정해진 시간에 걸쳐 소진'하는 방식으로 두어 구역과 무관하게 맞춘다.
 *
 * - `preTakenRate` — 좌석표가 열린 그 순간 이미 남이 잡고 있는 빈자리의 비율.
 *   0으로 두면 처음 몇 초는 아무 자리나 눌러도 성공해서, 실제 예매의 핵심인
 *   '눌러봐야 이미 나갔음을 아는' 함정을 만나지 못한다.
 *
 * 예전에는 가장 어려운 난이도도 25초여서, 좌석 두 개 고르는 데 1~3초면 끝나는 것과
 * 견주면 시간이 8배 남았다. 실패가 사실상 불가능해 지금 값으로 줄였다.
 */
export const DIFFICULTIES = {
  easy: { label: "쉬움", durationMs: 25000, preTakenRate: 0.1 },
  normal: { label: "보통", durationMs: 15000, preTakenRate: 0.25 },
  hard: { label: "어려움", durationMs: 8000, preTakenRate: 0.4 },
} as const;

/**
 * 난이도 목록(정의 순서 = 쉬움 → 어려움).
 *
 * 손으로 다시 나열하지 않고 정의에서 그대로 뽑는다. 목록을 따로 적으면 난이도를 추가할 때
 * 한쪽만 고쳐 어긋나는데, 타입 검사로는 '누락'을 잡을 수 없어 조용히 빠지기 때문이다.
 * (Object.keys의 반환 타입이 string[]이라 단언이 필요하지만, 값은 정확히 이 객체의 키다)
 */
export const DIFFICULTY_KEYS = Object.keys(
  DIFFICULTIES
) as readonly (keyof typeof DIFFICULTIES)[];

export const DEFAULT_DIFFICULTY = "normal";

/** 보안문자 길이 */
export const CAPTCHA_LENGTH = 6;

/** 사람이 헷갈리는 글자(0/O, 1/I/l)는 빼고 쓴다 */
export const CAPTCHA_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** 최고 기록 저장 키 */
export const BEST_RECORD_KEY = "jikku:practiceBest";
