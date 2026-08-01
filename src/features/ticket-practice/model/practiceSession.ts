import { ZONES } from "@/entities/stadium";
import { DIFFICULTIES, SESSION_KEY } from "../config/practice";
import { PRACTICE_PHASES, PRACTICE_VENDORS, PracticeSession } from "./types";

/**
 * 연습 상태를 sessionStorage에 넣고 빼는 순수 함수들.
 *
 * 티켓링크 모드는 실제로 브라우저를 새로고침해야 예매 버튼이 열리므로, 그때 상태가 날아가면
 * 연습이 끊긴다. 그래서 진행 상황을 세션에 남겨 새로고침 뒤에도 이어서 진행한다.
 * (탭을 닫으면 사라지는 sessionStorage라, 다음에 열 때는 깨끗한 상태로 시작한다)
 */

/**
 * 저장된 값이 지금 코드가 다룰 수 있는 형태인지 확인한다.
 *
 * 연습 규칙이 바뀌면 저장 구조도 바뀌는데, 예전 구조가 세션에 남아 있는 채로 배포되면
 * 없는 필드를 읽다가 화면이 깨진다. 그래서 복원 전에 필수 필드를 검사하고,
 * 하나라도 어긋나면 옛 기록으로 보고 버린다(새로 시작하면 그만이다).
 */
function isValidSession(value: unknown): value is PracticeSession {
  if (typeof value !== "object" || value === null) return false;

  const session = value as Partial<PracticeSession>;
  // 값이 지금도 유효한지까지 확인한다. 타입만 맞고 값이 옛것이면(사라진 구역 id 등)
  // 그걸 참조하는 순간 화면이 깨지므로, 형태만 보는 검사로는 부족하다
  const hasValidZone = session.zoneId === undefined || session.zoneId in ZONES;

  return (
    typeof session.phase === "string" &&
    PRACTICE_PHASES.includes(session.phase) &&
    typeof session.vendor === "string" &&
    PRACTICE_VENDORS.includes(session.vendor) &&
    typeof session.difficulty === "string" &&
    session.difficulty in DIFFICULTIES &&
    hasValidZone &&
    typeof session.ticketCount === "number" &&
    typeof session.missClicks === "number" &&
    typeof session.marks?.openAt === "number"
  );
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
