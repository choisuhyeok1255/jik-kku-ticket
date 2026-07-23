/**
 * 화면 팀 키 ↔ Supabase teams.id 매핑.
 * - DB의 game_records는 팀을 숫자 id(home_team_id 등)로 참조하고,
 *   화면 TEAMS는 문자열 키("LG" 등)로 참조하므로 둘을 잇는 매핑이 필요하다.
 * - Supabase teams 테이블(10개 구단, 고정)을 기준으로 만든 상수다.
 */

/** 화면 팀 키 → DB teams.id */
export const TEAM_DB_ID_BY_KEY: Record<string, number> = {
  SAMSUNG: 1,
  LG: 2,
  HANWHA: 3,
  NC: 4,
  KT: 5,
  LOTTE: 6,
  KIA: 7,
  DOOSAN: 8,
  KIWOOM: 9,
  SSG: 10,
};

/** DB teams.id → 화면 팀 키 */
export const TEAM_KEY_BY_DB_ID: Record<number, string> = {
  1: "SAMSUNG",
  2: "LG",
  3: "HANWHA",
  4: "NC",
  5: "KT",
  6: "LOTTE",
  7: "KIA",
  8: "DOOSAN",
  9: "KIWOOM",
  10: "SSG",
};
