import { ZoneKind } from "@/entities/stadium";
import { DIFFICULTIES } from "../config/practice";

/**
 * 티켓팅 연습의 진행 상태 타입.
 * 실제 예매 절차를 따른다: 구역 → 보안문자 → 좌석 → 결과.
 * 보안문자를 통과해야 좌석 배치도가 열리므로, 포도알 고르기는 마지막 단계다.
 */

/**
 * 좌석이 얼마나 빨리 나가는지 (= 얼마나 서둘러야 하는지).
 * 난이도 정의(DIFFICULTIES)가 곧 유효값이므로 그 키에서 직접 파생시킨다.
 */
export type PracticeDifficulty = keyof typeof DIFFICULTIES;

export type PracticePhase =
  | "zone" // 구역 선택
  | "captcha" // 보안문자 입력
  | "seat" // 좌석(포도알) 선택
  | "done" // 원하는 매수를 다 잡음 (성공)
  | "soldout"; // 고를 자리가 다 나감 (실패)

/** 각 단계를 통과한 시각(ms). 구간별 소요 시간을 여기서 계산한다 */
export interface PracticeMarks {
  startedAt: number; // 연습을 시작한 시각
  zonePickedAt?: number; // 구역을 고른 시각
  captchaPassedAt?: number; // 보안문자를 통과한 시각
  finishedAt?: number; // 판이 끝난 시각 (좌석 확보 또는 매진)
}

/** 진행 중인 연습 한 판 */
export interface PracticeSession {
  phase: PracticePhase;
  marks: PracticeMarks;
  /** 이번 판에 잡아야 하는 표 수. 시작할 때 사용자가 고른다 */
  ticketCount: number;
  /** 좌석이 나가는 속도. 시작할 때 사용자가 고른다 */
  difficulty: PracticeDifficulty;
  zoneId?: ZoneKind;
  missClicks: number;
}

/** 난이도별 최고 기록(가장 짧은 총 소요 시간, ms) */
export type BestRecords = Partial<Record<PracticeDifficulty, number>>;

/** 구간별 소요 시간(ms) */
export interface PracticeResult {
  zone: number; // 시작 → 구역 선택
  captcha: number; // 구역 → 보안문자 통과
  seat: number; // 보안문자 → 좌석 잡기
  total: number; // 시작 → 완료
  missClicks: number;
}
