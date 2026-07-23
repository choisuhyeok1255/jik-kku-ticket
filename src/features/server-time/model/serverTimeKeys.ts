/**
 * 서버시간 쿼리키 팩토리.
 * - useQuery와 무효화가 같은 키를 공유하도록 한곳에서 관리한다. (인라인 배열 금지)
 * - source(vendor)로 표준시/예매처별 시계를 구분한다.
 */
export const serverTimeKeys = {
  all: ["serverTime"] as const,
  source: (vendor?: string) =>
    [...serverTimeKeys.all, vendor ?? "standard"] as const,
};
