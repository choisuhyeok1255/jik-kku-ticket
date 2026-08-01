"use client";

import { useState } from "react";
import {
  DEFAULT_DIFFICULTY,
  DEFAULT_TICKET_COUNT,
  DIFFICULTIES,
  TICKET_COUNT_OPTIONS,
} from "../config/practice";
import { PracticeDifficulty, PracticeVendor } from "../model/types";

/**
 * 연습 시작 화면.
 * - 몇 장을 예매할지, 좌석이 얼마나 빨리 나갈지(난이도)를 먼저 정한다.
 * - 예매처를 고르면 그 방식으로 연습이 시작된다. 두 예매처는 예매창 진입 방법이 다르다.
 */

interface Props {
  onStart: (
    vendor: PracticeVendor,
    ticketCount: number,
    difficulty: PracticeDifficulty
  ) => void;
}

const DIFFICULTY_KEYS = Object.keys(DIFFICULTIES) as PracticeDifficulty[];

const VENDOR_GUIDE: {
  key: PracticeVendor;
  name: string;
  point: string;
  detail: string;
}[] = [
  {
    key: "ticketlink",
    name: "티켓링크",
    point: "새로고침이 관건",
    detail:
      "시간이 돼도 예매 버튼이 저절로 살아나지 않아요. 오픈 시각에 맞춰 새로고침해야 열립니다.",
  },
  {
    key: "nol",
    name: "NOL 티켓",
    point: "버튼 반응이 관건",
    detail:
      "오픈 시각이 되면 예매 버튼이 저절로 활성화돼요. 살아나는 순간 바로 누르세요.",
  },
];

export default function VendorPicker({ onStart }: Props) {
  const [ticketCount, setTicketCount] = useState(DEFAULT_TICKET_COUNT);
  const [difficulty, setDifficulty] =
    useState<PracticeDifficulty>(DEFAULT_DIFFICULTY);

  return (
    <section className="pr-card">
      <h2 className="pr-title">몇 장 예매하세요?</h2>
      <p className="pr-sub">고른 장수를 다 잡아야 예매 성공이에요.</p>

      <div className="pr-count-group" role="group" aria-label="예매 장수">
        {TICKET_COUNT_OPTIONS.map((count) => (
          <button
            key={count}
            type="button"
            className={`pr-count ${count === ticketCount ? "on" : ""}`}
            onClick={() => setTicketCount(count)}
            aria-pressed={count === ticketCount}
          >
            {count}장
          </button>
        ))}
      </div>

      <h2 className="pr-title pr-title-gap">좌석이 얼마나 빨리 나갈까요?</h2>
      <p className="pr-sub">
        고민하는 사이 다른 사람들이 자리를 채가요. 다 나가면 예매 실패입니다.
      </p>

      <div className="pr-level-group" role="group" aria-label="난이도">
        {DIFFICULTY_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={`pr-level ${key === difficulty ? "on" : ""}`}
            onClick={() => setDifficulty(key)}
            aria-pressed={key === difficulty}
          >
            <b>{DIFFICULTIES[key].label}</b>
            <span>{DIFFICULTIES[key].hint}</span>
            <small>약 {DIFFICULTIES[key].durationMs / 1000}초면 매진</small>
          </button>
        ))}
      </div>

      <h2 className="pr-title pr-title-gap">어디에서 예매하나요?</h2>
      <p className="pr-sub">
        예매처마다 예매창에 들어가는 방법이 달라요. 실제와 같은 방식으로
        연습합니다.
      </p>

      <div className="pr-vendor-grid">
        {VENDOR_GUIDE.map((vendor) => (
          <button
            key={vendor.key}
            type="button"
            className="pr-vendor-card"
            onClick={() => onStart(vendor.key, ticketCount, difficulty)}
          >
            <b className="pr-vendor-name">{vendor.name}</b>
            <span className="pr-vendor-point">{vendor.point}</span>
            <span className="pr-vendor-detail">{vendor.detail}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
