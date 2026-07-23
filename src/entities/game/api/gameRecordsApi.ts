import { supabase } from "@/shared/api/supabase";
import { Database } from "@/shared/api/supabase.types";

/**
 * Supabase game_records 조회 함수. (react-query queryFn에서 사용)
 * - 팀 id는 DB 숫자 id 기준이며, 화면 팀 키 매핑은 상위 레이어가 담당한다.
 * - RLS가 public read라 anon 키로 조회 가능하다.
 */

/** game_records 테이블 한 행(원본 DB 형태). */
export type GameRecordRow = Database["public"]["Tables"]["game_records"]["Row"];

/**
 * 특정 팀(DB id)이 홈 또는 원정으로 참여하는 특정 연·월 경기를 조회한다.
 * @param teamDbId Supabase teams.id
 * @param year 연도
 * @param month 0-based 월 (JS Date 기준)
 */
export async function getTeamGameRecordsInMonth(
  teamDbId: number,
  year: number,
  month: number
): Promise<GameRecordRow[]> {
  const mm = String(month + 1).padStart(2, "0");
  const start = `${year}-${mm}-01`;
  const end = `${year}-${mm}-31`; // match_date는 텍스트라 문자열 비교; "-31"을 상한으로 그 달 전체 포함

  const { data, error } = await supabase
    .from("game_records")
    .select("*")
    .or(`home_team_id.eq.${teamDbId},away_team_id.eq.${teamDbId}`)
    .gte("match_date", start)
    .lte("match_date", end)
    .order("match_date", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
