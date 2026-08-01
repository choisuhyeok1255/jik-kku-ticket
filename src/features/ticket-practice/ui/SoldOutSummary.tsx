"use client";

/**
 * 예매 실패(매진) 화면.
 * 고르려던 자리가 다 나가버려 원하는 매수를 채우지 못한 경우다 — 실전에서도 흔한 결말이다.
 */

interface Props {
  ticketCount: number;
  /** 오픈부터 실패까지 걸린 시간(ms) */
  elapsedMs: number;
  missClicks: number;
  onRetry: () => void;
}

const toSeconds = (ms: number) => `${(ms / 1000).toFixed(2)}초`;

export default function SoldOutSummary({
  ticketCount,
  elapsedMs,
  missClicks,
  onRetry,
}: Props) {
  return (
    <section className="pr-card">
      <p className="pr-eyebrow fail">예매 실패</p>
      <div className="pr-total">
        <span className="pr-total-value fail">매진</span>
        <span className="pr-total-label">
          {ticketCount}자리를 채우기 전에 좌석이 모두 나갔어요
        </span>
      </div>

      <ul className="pr-steps">
        <li>
          <span>버틴 시간</span>
          <b>{toSeconds(elapsedMs)}</b>
        </li>
        <li className="pr-miss">
          <span>이미 나간 좌석을 누른 횟수</span>
          <b>{missClicks}회</b>
        </li>
      </ul>

      <p className="pr-fail-tip">
        좌석표에서 고민이 길어지면 그사이 다른 사람들이 자리를 가져가요. 눈에
        보이는 자리가 이미 나간 경우도 많으니, 빠르게 다음 자리로 넘어가세요.
      </p>

      <button type="button" className="pr-retry" onClick={onRetry}>
        다시 연습하기
      </button>
    </section>
  );
}
