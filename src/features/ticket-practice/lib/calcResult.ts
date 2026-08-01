import { PracticeMarks, PracticeResult } from "../model/types";

/**
 * 단계별로 찍어둔 시각을 구간 소요 시간으로 환산한다.
 * 아직 끝나지 않은 연습(완료 시각 없음)은 결과를 낼 수 없으므로 null을 준다.
 *
 * @param marks 각 단계를 통과한 시각들
 * @param missClicks 이미 팔린 좌석을 잘못 누른 횟수
 */
export function calcResult(
  marks: PracticeMarks,
  missClicks: number
): PracticeResult | null {
  const { openAt, enteredAt, zonePickedAt, captchaPassedAt, finishedAt } = marks;
  if (!enteredAt || !zonePickedAt || !captchaPassedAt || !finishedAt) {
    return null;
  }

  return {
    enter: enteredAt - openAt,
    zone: zonePickedAt - enteredAt,
    captcha: captchaPassedAt - zonePickedAt,
    seat: finishedAt - captchaPassedAt,
    total: finishedAt - openAt,
    missClicks,
  };
}
