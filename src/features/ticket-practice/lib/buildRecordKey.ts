import { PracticeDifficulty, PracticeVendor } from "../model/types";

/**
 * 최고 기록을 저장할 키를 만든다. (useBestRecord 내부에서만 쓴다)
 * 저장과 조회가 같은 함수를 거치게 해, 키 형식이 한쪽만 바뀌는 일을 막는다.
 */
export function buildRecordKey(
  vendor: PracticeVendor,
  difficulty: PracticeDifficulty
): string {
  return `${vendor}:${difficulty}`;
}
