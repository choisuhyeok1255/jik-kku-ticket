"use client";

import { PracticeResult } from "../model/types";

/**
 * 연습 결과 화면.
 * 어느 구간에서 시간을 썼는지 보여줘, 무엇을 더 연습해야 할지 알 수 있게 한다.
 */

interface Props {
  result: PracticeResult;
  /** 이번 판에 잡은 표 수 */
  ticketCount: number;
  bestMs?: number;
  isNewBest: boolean;
  onRetry: () => void;
}

/** 소요 시간을 읽기 쉬운 초 단위 문자열로 바꾼다 */
const toSeconds = (ms: number) => `${(ms / 1000).toFixed(2)}초`;

export default function ResultSummary({
  result,
  ticketCount,
  bestMs,
  isNewBest,
  onRetry,
}: Props) {
  const steps = [
    { label: "구역 선택", value: result.zone },
    { label: "보안문자", value: result.captcha },
    { label: "좌석 잡기", value: result.seat },
  ];

  return (
    <section className="pr-card">
      <p className="pr-eyebrow">{ticketCount}장 예매 완료</p>
      <div className="pr-total">
        <span className="pr-total-value">{toSeconds(result.total)}</span>
        <span className="pr-total-label">총 소요 시간</span>
      </div>

      {isNewBest && <p className="pr-newbest">최고 기록을 경신했어요!</p>}
      {!isNewBest && bestMs !== undefined && (
        <p className="pr-best">내 최고 기록 {toSeconds(bestMs)}</p>
      )}

      <ul className="pr-steps">
        {steps.map((step) => (
          <li key={step.label}>
            <span>{step.label}</span>
            <b>{toSeconds(step.value)}</b>
          </li>
        ))}
        <li className="pr-miss">
          <span>잘못 누른 좌석</span>
          <b>{result.missClicks}회</b>
        </li>
      </ul>

      <button type="button" className="pr-retry" onClick={onRetry}>
        다시 연습하기
      </button>
    </section>
  );
}
