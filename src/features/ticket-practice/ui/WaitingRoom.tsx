"use client";

import { DIFFICULTIES } from "../config/practice";
import { useOpenGate } from "../model/useOpenGate";
import { PracticeDifficulty, PracticeVendor } from "../model/types";

/**
 * 오픈을 기다리다 예매창으로 들어가는 화면. 연습의 핵심 구간이다.
 *
 * - 오픈까지 남은 시간만 보여준다. 오픈 시각이 판마다 무작위라 절대 시각은 볼 이유가 없다.
 * - 티켓링크: 시간이 지나도 버튼이 닫혀 있고 **새로고침해야** 열린다.
 * - NOL: 오픈 시각이 되면 버튼이 저절로 열린다.
 */

interface Props {
  vendor: PracticeVendor;
  openAt: number;
  pageLoadedAt: number;
  /** 이번 판에 잡아야 하는 표 수 */
  ticketCount: number;
  difficulty: PracticeDifficulty;
  onEnter: () => void;
}

export default function WaitingRoom({
  vendor,
  openAt,
  pageLoadedAt,
  ticketCount,
  difficulty,
  onEnter,
}: Props) {
  const { isOpen, canEnter, remainMs } = useOpenGate(
    vendor,
    openAt,
    pageLoadedAt
  );
  const isTicketlink = vendor === "ticketlink";

  return (
    <section className="pr-card">
      <p className="pr-eyebrow">
        {isTicketlink ? "티켓링크" : "NOL 티켓"} 예매 대기
      </p>

      <p className="pr-mission">
        <b>{ticketCount}장</b> 예매 · {DIFFICULTIES[difficulty].label}
      </p>

      <div className="pr-countdown">
        {remainMs > 0 ? (
          <>
            <span className="pr-countdown-value">
              {(remainMs / 1000).toFixed(2)}
            </span>
            <span className="pr-countdown-unit">초 뒤 열립니다</span>
          </>
        ) : (
          <span className="pr-countdown-open">오픈되었습니다</span>
        )}
      </div>

      <button
        type="button"
        className={`pr-enter ${canEnter ? "on" : ""}`}
        disabled={!canEnter}
        onClick={onEnter}
      >
        {canEnter ? "예매하기" : "예매 대기중"}
      </button>

      {isTicketlink && (
        <div className="pr-hint">
          <p>
            티켓링크는 시간이 돼도 버튼이 저절로 열리지 않아요.{" "}
            <b>새로고침해야</b> 열립니다.
          </p>
          <p className="pr-hint-key">
            <kbd>F5</kbd> · <kbd>⌘</kbd>+<kbd>R</kbd> · 모바일은 화면을 아래로
            당기기
          </p>
          {isOpen && !canEnter && (
            <p className="pr-hint-now">지금이에요! 새로고침하세요</p>
          )}
        </div>
      )}

      {!isTicketlink && (
        <div className="pr-hint">
          <p>
            NOL은 오픈 시각이 되면 버튼이 <b>저절로 활성화</b>돼요. 살아나는
            순간 바로 누르세요.
          </p>
        </div>
      )}
    </section>
  );
}
