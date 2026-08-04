"use client";

import { useState } from "react";
import {
  DEFAULT_DIFFICULTY,
  DEFAULT_TICKET_COUNT,
  DIFFICULTIES,
  DIFFICULTY_KEYS,
  TICKET_COUNT_OPTIONS,
} from "../config/practice";
import {
  PRACTICE_VENDORS,
  PracticeDifficulty,
  PracticeVendor,
} from "../model/types";

/**
 * 연습 시작 화면.
 *
 * 몇 장을 예매할지, 좌석이 얼마나 빨리 나갈지, 어디에서 예매할지를 정하고 시작한다.
 *
 * 질문을 왼쪽 라벨 한 단어로 줄이고 선택지를 그 오른쪽에 나란히 둔다. 세 줄이 같은
 * 위치에서 시작해, 무엇을 고르는 화면인지 한눈에 잡힌다.
 *
 * 예매처 설명만은 지우지 않고 **고른 것 하나만** 아래에 보여준다 — 두 예매처의
 * 예매창 진입 방식이 다른 것이 이 연습의 핵심이라, 모르고 시작하면 연습이 되지 않는다.
 */

interface Props {
  onStart: (
    vendor: PracticeVendor,
    ticketCount: number,
    difficulty: PracticeDifficulty
  ) => void;
}

const VENDOR_LABEL: Record<PracticeVendor, string> = {
  ticketlink: "티켓링크",
  nol: "NOL 티켓",
};

/** 예매창에 들어가는 방식의 차이. 고른 예매처 것만 화면에 남는다 */
const VENDOR_NOTE: Record<PracticeVendor, React.ReactNode> = {
  ticketlink: (
    <>
      티켓링크는 시간이 돼도 버튼이 저절로 열리지 않아요. 오픈 시각에 맞춰{" "}
      <b>새로고침</b>해야 합니다.
    </>
  ),
  nol: (
    <>
      NOL은 오픈 시각이 되면 버튼이 <b>저절로 열려요</b>. 살아나는 순간 바로
      누르세요.
    </>
  ),
};

export default function VendorPicker({ onStart }: Props) {
  const [ticketCount, setTicketCount] = useState(DEFAULT_TICKET_COUNT);
  const [difficulty, setDifficulty] =
    useState<PracticeDifficulty>(DEFAULT_DIFFICULTY);
  const [vendor, setVendor] = useState<PracticeVendor>(PRACTICE_VENDORS[0]);

  return (
    <section className="pr-card">
      <div className="pr-setup">
        <div className="pr-row" role="group" aria-label="예매 장수">
          <span className="pr-row-label">장수</span>
          <div className="pr-row-opts">
            {TICKET_COUNT_OPTIONS.map((count) => (
              <button
                key={count}
                type="button"
                className={`pr-count ${count === ticketCount ? "on" : ""}`}
                onClick={() => setTicketCount(count)}
                aria-pressed={count === ticketCount}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {/* 난이도는 셋을 견줘서 고르는 것이라, 고른 것만이 아니라 셋 다 시간을 보여준다.
            초가 무엇을 뜻하는지는 왼쪽 라벨 아래에 붙여, 선택지 줄이 아래로 뻗지 않게 한다 */}
        <div className="pr-row" role="group" aria-label="난이도">
          <span className="pr-row-label">
            난이도
            <small>매진 시간</small>
          </span>
          <div className="pr-row-opts">
            {DIFFICULTY_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                className={`pr-level ${key === difficulty ? "on" : ""}`}
                onClick={() => setDifficulty(key)}
                aria-pressed={key === difficulty}
              >
                {DIFFICULTIES[key].label}
                <small>{DIFFICULTIES[key].durationMs / 1000}초</small>
              </button>
            ))}
          </div>
        </div>

        <div className="pr-row" role="group" aria-label="예매처">
          <span className="pr-row-label">예매처</span>
          <div className="pr-row-opts">
            {PRACTICE_VENDORS.map((key) => (
              <button
                key={key}
                type="button"
                className={`pr-level ${key === vendor ? "on" : ""}`}
                onClick={() => setVendor(key)}
                aria-pressed={key === vendor}
              >
                {VENDOR_LABEL[key]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 자리를 늘 차지하게 두면 예매처를 바꿀 때 아래 버튼이 위아래로 흔들리지 않는다 */}
      <p className="pr-vendor-note">{VENDOR_NOTE[vendor]}</p>

      <button
        type="button"
        className="pr-start"
        onClick={() => onStart(vendor, ticketCount, difficulty)}
      >
        연습 시작
      </button>
    </section>
  );
}
