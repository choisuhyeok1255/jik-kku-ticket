"use client";

import { useState } from "react";
import {
  TEAMS,
  TEAM_DB_ID_BY_KEY,
  TEAM_KEY_BY_DB_ID,
} from "@/entities/team";
import { VENDORS } from "@/entities/vendor";
import { GameRecordRow, useTeamGameRecordsInMonth } from "@/entities/game";
import { VendorKey } from "@/shared/config/vendor-keys";

/**
 * 팀별 월간 경기 그리드 달력.
 * - Supabase game_records에서 선택된 팀이 홈/원정으로 뛰는 경기를 조회해 달력 칸에 표시한다.
 * - 각 경기 셀에는 상대팀(홈/원정)과 홈팀 예매처 링크들을 함께 보여준다.
 * - 예매처 버튼을 누르면 시계가 그 예매처 서버시간으로 전환되고, 예매 링크가 있으면
 *   예매 사이트도 새 탭으로 함께 연다.
 * - 경기 시작 시각/예매 오픈 시각은 DB에 없어 표시하지 않는다.
 */

interface Props {
  teamId: string;
  onPickVendor: (vendor: VendorKey) => void;
  onChangeTeam: () => void;
  isUnset?: boolean;
}

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

export default function TeamCalendar({
  teamId,
  onPickVendor,
  onChangeTeam,
  isUnset,
}: Props) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const { year, month } = cursor;
  const teamDbId = TEAM_DB_ID_BY_KEY[teamId];
  const { gameRecords, isGameRecordsPending, isGameRecordsError } =
    useTeamGameRecordsInMonth(teamDbId, year, month);

  const gamesByDay = new Map<number, GameRecordRow>();
  (gameRecords ?? []).forEach((g) => {
    const day = new Date(g.match_date + "T00:00:00+09:00").getDate();
    gamesByDay.set(day, g);
  });

  const now = new Date();
  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth();
  const todayDate = now.getDate();

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const goPrev = () => {
    if (isCurrentMonth) return; // 예매 캘린더라 지난 달로는 이동하지 않음
    setCursor(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    );
  };
  const goNext = () =>
    setCursor(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    );

  const myTeam = TEAMS[teamId];

  return (
    <section className="cal">
      <div className="cal-head">
        <button
          className="cal-nav"
          type="button"
          onClick={goPrev}
          disabled={isCurrentMonth}
          aria-label="이전 달"
        >
          ◀
        </button>
        <div className="cal-title-group">
          <span className="cal-title">
            {year}년 {month + 1}월 · {myTeam.name}
            {isUnset && <span className="cal-unset"> (미설정)</span>}
          </span>
          <button type="button" className="cal-change" onClick={onChangeTeam}>
            {isUnset ? "응원팀 선택" : "변경"}
          </button>
        </div>
        <button className="cal-nav" type="button" onClick={goNext} aria-label="다음 달">
          ▶
        </button>
      </div>

      <div className="cal-dow">
        {DOW.map((d, i) => (
          <span key={d} className={i === 0 ? "sun" : i === 6 ? "sat" : ""}>
            {d}
          </span>
        ))}
      </div>

      <div className="cal-grid">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`e${idx}`} className="cal-cell empty" />;

          const isToday = isCurrentMonth && day === todayDate;
          const isPast = isCurrentMonth && day < todayDate; // 오늘 이전 = 지난 경기
          const game = gamesByDay.get(day);
          if (!game) {
            return (
              <div
                key={day}
                className={`cal-cell ${isToday ? "today" : ""} ${
                  isPast ? "past" : ""
                }`}
              >
                <span className="cal-day">{day}</span>
              </div>
            );
          }

          const isHome = game.home_team_id === teamDbId; // 내 팀이 홈경기인지
          const homeTeam = TEAMS[TEAM_KEY_BY_DB_ID[game.home_team_id]];
          const opponent =
            TEAMS[TEAM_KEY_BY_DB_ID[isHome ? game.away_team_id : game.home_team_id]];

          return (
            <div
              key={day}
              className={`cal-cell has-game ${isToday ? "today" : ""} ${
                isPast ? "past" : ""
              }`}
            >
              <span className="cal-day">{day}</span>
              <span
                className={`cal-flag ${isHome ? "home" : "away"}`}
                style={{ background: homeTeam.color }}
              >
                {isHome ? "홈" : "원정"}
              </span>
              <span className="cal-opp-big">{opponent.short}</span>
              {!isPast && (
                <div className="cal-books">
                {homeTeam.vendors.map((tv) => {
                  const vendor = VENDORS[tv.key];

                  // 예매 링크가 있으면: 예매 사이트 이동(새 탭) + 시계 전환
                  if (tv.bookingUrl) {
                    return (
                      <a
                        key={tv.key}
                        className="cal-book-link"
                        style={{ ["--book" as string]: homeTeam.color }}
                        href={tv.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={
                          vendor.noClock
                            ? `${homeTeam.name} · ${vendor.name} 예매`
                            : `${homeTeam.name} · ${vendor.name} 예매 (시계도 전환)`
                        }
                        onClick={
                          vendor.noClock
                            ? undefined
                            : () => onPickVendor(tv.key)
                        }
                      >
                        {vendor.shortName}
                      </a>
                    );
                  }

                  // 예매 링크가 아직 없으면: 시계 전환만
                  return (
                    <button
                      key={tv.key}
                      type="button"
                      className="cal-book-link"
                      style={{ ["--book" as string]: homeTeam.color }}
                      title={`${vendor.name} 서버시간 보기`}
                      onClick={() => onPickVendor(tv.key)}
                    >
                      {vendor.shortName}
                    </button>
                  );
                })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isGameRecordsPending && (
        <p className="cal-empty">경기 일정을 불러오는 중…</p>
      )}
      {isGameRecordsError && (
        <p className="cal-empty">경기 일정을 불러오지 못했어요.</p>
      )}
      {!isGameRecordsPending &&
        !isGameRecordsError &&
        (gameRecords?.length ?? 0) === 0 && (
          <p className="cal-empty">이 달 {myTeam.name} 경기가 없어요.</p>
        )}
    </section>
  );
}
