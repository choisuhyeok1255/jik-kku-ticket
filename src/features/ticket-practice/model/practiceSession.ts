import { ZONES } from "@/entities/stadium";
import { DIFFICULTY_KEYS, SESSION_KEY } from "../config/practice";
import { hasAllMarks } from "../lib/calcResult";
import {
  PRACTICE_PHASES,
  PRACTICE_VENDORS,
  PracticeMarks,
  PracticePhase,
  PracticeSession,
} from "./types";

/**
 * 연습 상태를 sessionStorage에 넣고 빼는 순수 함수들.
 *
 * 티켓링크 모드는 실제로 브라우저를 새로고침해야 예매 버튼이 열리므로, 그때 상태가 날아가면
 * 연습이 끊긴다. 그래서 진행 상황을 세션에 남겨 새로고침 뒤에도 이어서 진행한다.
 * (탭을 닫으면 사라지는 sessionStorage라, 다음에 열 때는 깨끗한 상태로 시작한다)
 */

/** 시각 필드가 없거나(아직 안 지난 단계) 숫자여야 한다 */
const isOptionalTime = (value: unknown): boolean =>
  value === undefined || typeof value === "number";

/**
 * 단계별로 반드시 채워져 있어야 하는 시각·값이 있는지 확인한다.
 *
 * 직전 단계의 시각 하나만 보면 그 앞의 시각이 빠진 세션이 통과하고, 연습을 끝낸 순간
 * 구간 시간을 계산하지 못해 결과 화면을 못 그린다. 그래서 그 단계까지 거쳐온 시각을
 * 모두 확인한다. '완료' 단계는 결과 화면이 쓰는 값 전부가 기준이 된다.
 */
function matchesPhase(
  phase: PracticePhase,
  marks: PracticeMarks,
  zoneId: unknown
): boolean {
  const needsZone = phase === "captcha" || phase === "seat" || phase === "done";
  if (needsZone && zoneId === undefined) return false;

  const { enteredAt, zonePickedAt, captchaPassedAt, finishedAt } = marks;
  switch (phase) {
    case "waiting":
      return true;
    case "zone":
      return typeof enteredAt === "number";
    case "captcha":
      return typeof enteredAt === "number" && typeof zonePickedAt === "number";
    case "seat":
      return (
        typeof enteredAt === "number" &&
        typeof zonePickedAt === "number" &&
        typeof captchaPassedAt === "number"
      );
    case "done":
      return hasAllMarks(marks);
    case "soldout":
      // 실패 화면은 버틴 시간만 쓰므로 완료 시각만 있으면 된다
      return typeof finishedAt === "number";
  }
}

/**
 * 저장된 값이 지금 코드가 다룰 수 있는 형태인지 확인한다.
 *
 * 연습 규칙이 바뀌면 저장 구조도 바뀌는데, 예전 구조가 세션에 남아 있는 채로 배포되면
 * 없는 필드를 읽다가 화면이 깨진다. 그래서 복원 전에 값의 유효성과 단계별 정합성을 함께 보고,
 * 하나라도 어긋나면 옛 기록으로 보고 버린다(새로 시작하면 그만이다).
 */
function isValidSession(value: unknown): value is PracticeSession {
  if (typeof value !== "object" || value === null) return false;

  const session = value as Partial<PracticeSession>;
  const marks = session.marks;

  // 값이 지금도 유효한가 — 타입만 맞고 값이 옛것이면(사라진 구역 id 등)
  // 그걸 참조하는 순간 화면이 깨진다
  if (typeof session.phase !== "string") return false;
  if (!PRACTICE_PHASES.includes(session.phase)) return false;
  if (typeof session.vendor !== "string") return false;
  if (!PRACTICE_VENDORS.includes(session.vendor)) return false;
  if (typeof session.difficulty !== "string") return false;
  if (!DIFFICULTY_KEYS.includes(session.difficulty)) return false;
  // `in` 대신 hasOwn을 쓰는 이유는 `in`이 "toString" 같은 프로토타입 속성까지 통과시키기 때문이다
  if (session.zoneId !== undefined && !Object.hasOwn(ZONES, session.zoneId)) {
    return false;
  }
  if (typeof session.ticketCount !== "number") return false;
  if (typeof session.missClicks !== "number") return false;

  if (typeof marks?.openAt !== "number") return false;
  if (!isOptionalTime(marks.enteredAt)) return false;
  if (!isOptionalTime(marks.zonePickedAt)) return false;
  if (!isOptionalTime(marks.captchaPassedAt)) return false;
  if (!isOptionalTime(marks.finishedAt)) return false;

  // 단계와 값이 앞뒤가 맞는가 — '완료' 상태인데 완료 시각이 없으면
  // 결과 화면도 못 그리고 빠져나갈 버튼도 없는 막다른 화면이 된다
  return matchesPhase(session.phase, marks, session.zoneId);
}

export function loadSession(): PracticeSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isValidSession(parsed)) {
      clearSession();
      return null;
    }
    return parsed;
  } catch {
    // 값이 깨져 읽을 수 없다 — 계속 남겨둬도 쓸 데가 없으니 지운다
    clearSession();
    return null;
  }
}

export function saveSession(session: PracticeSession): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // 저장에 실패해도 연습 자체는 진행할 수 있으므로 무시한다
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // 위와 같은 이유로 무시
  }
}
