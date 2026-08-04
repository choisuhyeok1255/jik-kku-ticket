"use client";

import { useState } from "react";
import {
  DEFAULT_DIFFICULTY,
  DEFAULT_TICKET_COUNT,
  DIFFICULTIES,
  DIFFICULTY_KEYS,
  TICKET_COUNT_OPTIONS,
} from "../config/practice";
import { PracticeDifficulty } from "../model/types";

/**
 * 연습 시작 화면.
 *
 * 몇 장을 예매할지, 좌석이 얼마나 빨리 나갈지를 정하고 시작한다.
 *
 * 질문을 왼쪽 라벨 한 단어로 줄이고 선택지를 그 오른쪽에 나란히 둔다. 두 줄이 같은
 * 위치에서 시작해, 무엇을 고르는 화면인지 한눈에 잡힌다.
 */

interface Props {
  onStart: (ticketCount: number, difficulty: PracticeDifficulty) => void;
}

export default function PracticeSetup({ onStart }: Props) {
  const [ticketCount, setTicketCount] = useState(DEFAULT_TICKET_COUNT);
  const [difficulty, setDifficulty] =
    useState<PracticeDifficulty>(DEFAULT_DIFFICULTY);

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
      </div>

      <button
        type="button"
        className="pr-start"
        onClick={() => onStart(ticketCount, difficulty)}
      >
        연습 시작
      </button>
    </section>
  );
}
