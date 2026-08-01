import { ZoneKind } from "@/entities/stadium";
import { DIFFICULTIES } from "../config/practice";

/**
 * 티켓팅 연습의 진행 상태 타입.
 * 실제 예매 절차를 그대로 따른다: 대기 → (진입) → 구역 → 보안문자 → 좌석 → 결과.
 * 보안문자를 통과해야 좌석 배치도가 열리므로, 포도알 고르기는 마지막 단계다.
 */

/**
 * 값 목록에서 타입을 파생시킨다.
 * 저장된 세션을 복원할 때 "이 값이 지금도 유효한가"를 실행 중에 확인해야 하는데,
 * 타입만 있으면 그 검사를 할 수 없기 때문이다. (타입은 빌드 후 사라진다)
 * 목록과 타입을 따로 적으면 한쪽만 바뀌어 어긋나므로 항상 목록을 원본으로 삼는다.
 */

/** 연습 대상 예매처. 진입 방식이 서로 다르다 */
export const PRACTICE_VENDORS = ["ticketlink", "nol"] as const;
export type PracticeVendor = (typeof PRACTICE_VENDORS)[number];

/**
 * 좌석이 얼마나 빨리 나가는지 (= 얼마나 서둘러야 하는지).
 * 난이도 정의(DIFFICULTIES)가 곧 유효값이므로 그 키에서 직접 파생시킨다.
 */
export type PracticeDifficulty = keyof typeof DIFFICULTIES;

export const PRACTICE_PHASES = [
  "waiting", // 오픈 대기 (예매 버튼 누르기 전)
  "zone", // 구역 선택
  "captcha", // 보안문자 입력
  "seat", // 좌석(포도알) 선택
  "done", // 원하는 매수를 다 잡음 (성공)
  "soldout", // 고를 자리가 다 나감 (실패)
] as const;
export type PracticePhase = (typeof PRACTICE_PHASES)[number];

/** 각 단계를 통과한 시각(ms). 구간별 소요 시간을 여기서 계산한다 */
export interface PracticeMarks {
  openAt: number; // 예매가 열리는 시각
  enteredAt?: number; // 예매 버튼을 누른 시각
  zonePickedAt?: number; // 구역을 고른 시각
  captchaPassedAt?: number; // 보안문자를 통과한 시각
  finishedAt?: number; // 좌석을 잡은 시각 (= 예매 완료)
}

/** 새로고침 너머로 이어야 하는 연습 상태 */
export interface PracticeSession {
  phase: PracticePhase;
  vendor: PracticeVendor;
  marks: PracticeMarks;
  /** 이번 판에 잡아야 하는 표 수. 시작할 때 사용자가 고른다 */
  ticketCount: number;
  /** 좌석이 나가는 속도. 시작할 때 사용자가 고른다 */
  difficulty: PracticeDifficulty;
  zoneId?: ZoneKind;
  missClicks: number;
}

/** 구간별 소요 시간(ms) */
export interface PracticeResult {
  enter: number; // 오픈 → 진입
  zone: number; // 진입 → 구역 선택
  captcha: number; // 구역 → 보안문자 통과
  seat: number; // 보안문자 → 좌석 잡기
  total: number; // 오픈 → 완료
  missClicks: number;
}
