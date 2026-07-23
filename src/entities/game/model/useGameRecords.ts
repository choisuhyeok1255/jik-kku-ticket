"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTeamGameRecordsInMonth } from "../api/gameRecordsApi";
import { gameKeys } from "./gameKeys";

/**
 * 특정 팀(DB id)의 특정 연·월 경기 일정을 조회하는 훅.
 * - 월을 넘길 때 keepPreviousData로 이전 달 데이터를 유지해 깜빡임을 줄인다.
 *
 * @param teamDbId Supabase teams.id
 * @param year 연도
 * @param month 0-based 월 (JS Date 기준)
 */
export function useTeamGameRecordsInMonth(
  teamDbId: number,
  year: number,
  month: number
) {
  const {
    data: gameRecords,
    isPending: isGameRecordsPending,
    isError: isGameRecordsError,
  } = useQuery({
    queryKey: gameKeys.teamMonth(teamDbId, year, month),
    queryFn: () => getTeamGameRecordsInMonth(teamDbId, year, month),
    placeholderData: keepPreviousData,
  });

  return { gameRecords, isGameRecordsPending, isGameRecordsError };
}
