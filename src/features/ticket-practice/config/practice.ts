/**
 * 티켓팅 연습의 규칙 상수.
 * 실제 예매 절차(대기 → 진입 → 구역 → 좌석 → 보안문자)를 흉내 내는 데 쓰는 값들이다.
 */

/** 시작을 누른 뒤 예매가 열리기까지의 대기 시간 범위. 미리 알 수 없어야 실전에 가깝다 */
export const OPEN_DELAY_MIN_MS = 5000;
export const OPEN_DELAY_MAX_MS = 8000;

/** 연습 시작 전에 고를 수 있는 표 수 */
export const TICKET_COUNT_OPTIONS = [1, 2, 3, 4] as const;

/** 야구는 둘이 가는 경우가 가장 흔하다 */
export const DEFAULT_TICKET_COUNT = 2;

/** 좌석이 팔려나가는 것을 화면에 반영하는 주기 */
export const SELLOUT_INTERVAL_MS = 800;

/**
 * 난이도 = 그 구역의 빈자리가 모두 나가기까지 걸리는 시간.
 *
 * '남은 자리의 몇 %'로 깎으면 구역 크기에 따라 난이도가 7배까지 벌어진다
 * (빈자리가 적은 테이블석은 순식간에, 외야는 한참 버틴다).
 * 그래서 '처음 빈자리를 정해진 시간에 걸쳐 소진'하는 방식으로 두어,
 * 어느 구역을 골라도 체감 난이도가 같게 만든다.
 */
export const DIFFICULTIES = {
  easy: { label: "쉬움", durationMs: 45000, hint: "여유 있게 익히기" },
  normal: { label: "보통", durationMs: 35000, hint: "실전과 비슷하게" },
  hard: { label: "어려움", durationMs: 25000, hint: "인기 경기처럼" },
} as const;

export const DEFAULT_DIFFICULTY = "normal";

/** 보안문자 길이 */
export const CAPTCHA_LENGTH = 6;

/** 사람이 헷갈리는 글자(0/O, 1/I/l)는 빼고 쓴다 */
export const CAPTCHA_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** 연습 진행 상태를 새로고침 너머로 잇기 위한 sessionStorage 키 */
export const SESSION_KEY = "jikku:practiceRun";

/** 최고 기록 저장 키 */
export const BEST_RECORD_KEY = "jikku:practiceBest";
