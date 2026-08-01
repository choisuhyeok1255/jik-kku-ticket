import { PracticePhase } from "../model/types";

/**
 * 결과가 나와 더 진행할 것이 없는 단계인지.
 * 성공(done)과 실패(soldout) 양쪽을 함께 다뤄야 하는 곳이 여럿이라 한 곳에 모아둔다.
 */
export function isFinishedPhase(phase: PracticePhase): boolean {
  return phase === "done" || phase === "soldout";
}
