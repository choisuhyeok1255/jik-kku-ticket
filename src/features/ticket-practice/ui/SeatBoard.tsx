"use client";

import { useEffect, useState } from "react";
import { ZONES, ZoneKind } from "@/entities/stadium";
import { DIFFICULTIES, SELLOUT_INTERVAL_MS } from "../config/practice";
import {
  countSelectable,
  generateSeats,
  reserveSomeSeats,
  Seat,
} from "../lib/generateSeats";
import { PracticeDifficulty } from "../model/types";

/**
 * 좌석(포도알) 격자 화면.
 *
 * 실제 예매창처럼 대부분은 이미 팔려 있고 일부만 빈자리다. 그중 **잡아야 할 매수만큼**
 * 빠르게 골라야 예매가 끝난다. 붙어 있는 자리인지는 따지지 않는다 — 다만 좌석표에는
 * 붙은 자리를 고를 선택지가 늘 있도록 배치가 보장된다(generateSeats 참고).
 *
 * 좌석표를 보는 동안에도 남들이 계속 자리를 채가는데, **내 화면은 그대로다.**
 * 빈자리로 보여서 눌렀는데 그제서야 이미 나간 자리임을 알게 되는 것 —
 * 그 함정이 티켓팅에서 시간을 가장 많이 잡아먹는 지점이라 그대로 재현한다.
 * 꾸물거리면 결국 남는 자리가 없어져 예매에 실패한다.
 *
 * 좌석 배치는 마운트할 때 한 번만 만든다. 무작위라 서버 렌더 결과와 어긋날 수 있으나,
 * 이 화면은 보안문자를 통과한 뒤(클라이언트 상호작용 이후)에만 마운트되므로 하이드레이션 대상이 아니다.
 */

interface Props {
  zoneId: ZoneKind;
  /** 잡아야 하는 표 수 */
  ticketCount: number;
  difficulty: PracticeDifficulty;
  onComplete: () => void;
  onMissClick: () => void;
  onSoldOut: () => void;
}

export default function SeatBoard({
  zoneId,
  ticketCount,
  difficulty,
  onComplete,
  onMissClick,
  onSoldOut,
}: Props) {
  const zone = ZONES[zoneId];
  // 처음 빈자리 수를 함께 붙잡아둔다 — 소진 속도를 이 값 기준으로 정해야
  // 구역 크기와 상관없이 난이도가 같아진다
  const [board] = useState(() => {
    const initial = generateSeats(
      zone,
      ticketCount,
      DIFFICULTIES[difficulty].preTakenRate
    );
    return {
      initial,
      openCount: countSelectable(initial),
      startedAt: Date.now(),
    };
  });
  const [seats, setSeats] = useState<Seat[]>(board.initial);

  useEffect(() => {
    const { durationMs } = DIFFICULTIES[difficulty];
    let sold = 0;

    /**
     * 흐른 시간만큼 자리를 채간다.
     *
     * 틱마다 고정된 수를 빼면 `window.alert`이 떠 있는 동안 타이머가 멈춰,
     * 헛클릭을 해도 시간 손해가 없어진다(오히려 알림을 열어두는 게 이득이 된다).
     * 그래서 '지금까지 몇 석이 나갔어야 하는가'를 시각으로 계산해 밀린 만큼 몰아서 뺀다.
     */
    const sellByElapsed = () => {
      const elapsed = Date.now() - board.startedAt;
      const shouldBeSold = Math.min(
        board.openCount,
        (board.openCount * elapsed) / durationMs
      );
      const behind = shouldBeSold - sold;
      if (behind <= 0) return;

      sold = shouldBeSold;
      setSeats((prev) => reserveSomeSeats(prev, behind));
    };

    const timer = setInterval(sellByElapsed, SELLOUT_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [board.openCount, board.startedAt, difficulty]);

  const pickedCount = seats.filter((seat) => seat.picked).length;
  // 남은 자리로는 원하는 매수를 채울 수 없다 = 예매 실패
  const isSoldOut = pickedCount + countSelectable(seats) < ticketCount;

  useEffect(() => {
    if (isSoldOut) onSoldOut();
  }, [isSoldOut, onSoldOut]);

  /** 남이 먼저 잡아간 자리였음을 이제야 화면에 반영한다 */
  const revealTaken = (seatId: string) => {
    setSeats((prev) =>
      prev.map((s) => (s.id === seatId ? { ...s, taken: true } : s))
    );
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.taken) {
      onMissClick();
      return;
    }
    if (seat.reserved) {
      revealTaken(seat.id);
      onMissClick();
      return;
    }
    if (!seat.picked && pickedCount >= ticketCount) return;

    setSeats((prev) =>
      prev.map((s) => (s.id === seat.id ? { ...s, picked: !s.picked } : s))
    );

    const nextCount = seat.picked ? pickedCount - 1 : pickedCount + 1;
    if (nextCount === ticketCount) onComplete();
  };

  // 화면에 보이는 잔여 좌석. 남이 선점한 자리는 아직 여기 포함된다(실제 예매창도 그렇다)
  const remaining = seats.filter((seat) => !seat.taken).length;

  return (
    <section className="pr-card">
      <h2 className="pr-title">{zone.name}</h2>
      {/* 남은 좌석은 0.8초마다 줄어든다. 숫자 칸을 고정하지 않으면 자릿수가 바뀔 때마다
          가운데 정렬된 문장 전체가 좌우로 움직인다 */}
      <p className="pr-sub">
        {ticketCount}자리를 잡으세요 · 남은 좌석{" "}
        <span className="pr-remain">{remaining}</span>석
      </p>

      <div className="pr-pick-status">
        <span className="pr-pick-count">
          {pickedCount} / {ticketCount}
        </span>
        <span className="pr-pick-hint">고른 자리를 다시 누르면 취소돼요</span>
      </div>

      <div
        className="pr-seat-grid"
        style={{ ["--cols" as string]: String(zone.cols) }}
      >
        {seats.map((seat) => (
          <button
            key={seat.id}
            type="button"
            className={`pr-seat ${seat.taken ? "taken" : "open"} ${
              seat.picked ? "picked" : ""
            }`}
            onClick={() => handleSeatClick(seat)}
            aria-label={
              seat.taken
                ? `${seat.row + 1}열 ${seat.col + 1}번 판매완료`
                : `${seat.row + 1}열 ${seat.col + 1}번 ${
                    seat.picked ? "선택됨" : "선택 가능"
                  }`
            }
            aria-pressed={seat.picked}
          />
        ))}
      </div>
    </section>
  );
}
