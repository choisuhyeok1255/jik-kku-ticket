import { PracticeMarks, PracticeResult } from "../model/types";

/**
 * 연습 결과 계산.
 * 단계별로 찍어둔 시각을 구간 소요 시간으로 환산하고, 그게 가능한 상태인지도 함께 판단한다.
 */

/** 모든 단계를 통과해 구간 시간을 계산할 수 있는 시각 묶음 */
type CompletedMarks = PracticeMarks &
  Required<
    Pick<
      PracticeMarks,
      "enteredAt" | "zonePickedAt" | "captchaPassedAt" | "finishedAt"
    >
  >;

/**
 * 구간별 시간을 전부 계산할 수 있을 만큼 시각이 찍혔는가.
 *
 * 결과 화면을 그릴 수 있는지 판단하는 기준이라, 저장된 연습을 복원할 때도 같은 기준을 쓴다.
 * (기준이 갈리면 '완료'로 저장됐는데 결과는 못 그리는 상태가 생긴다)
 */
export function hasAllMarks(marks: PracticeMarks): marks is CompletedMarks {
  const { enteredAt, zonePickedAt, captchaPassedAt, finishedAt } = marks;
  return Boolean(enteredAt && zonePickedAt && captchaPassedAt && finishedAt);
}

/**
 * 찍어둔 시각들을 구간별 소요 시간으로 환산한다.
 * 아직 끝나지 않은 연습(거쳐온 시각이 덜 찍힘)은 결과를 낼 수 없으므로 null을 준다.
 *
 * @param marks 각 단계를 통과한 시각들
 * @param missClicks 이미 팔린 좌석을 잘못 누른 횟수
 */
export function calcResult(
  marks: PracticeMarks,
  missClicks: number
): PracticeResult | null {
  if (!hasAllMarks(marks)) return null;

  const { openAt, enteredAt, zonePickedAt, captchaPassedAt, finishedAt } =
    marks;
  return {
    enter: enteredAt - openAt,
    zone: zonePickedAt - enteredAt,
    captcha: captchaPassedAt - zonePickedAt,
    seat: finishedAt - captchaPassedAt,
    total: finishedAt - openAt,
    missClicks,
  };
}
