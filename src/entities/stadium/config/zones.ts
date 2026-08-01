import { Zone, ZoneKind } from "../model/types";

/**
 * 좌석 구역 목록.
 *
 * 구단별 실제 구역명(잠실 테이블석, 사직 나눔석 등)은 구장마다 다르고 시즌마다 바뀌므로,
 * 어느 구장에나 공통으로 있는 대표 유형 네 가지로 둔다. 연습의 목적은 구역명 암기가 아니라
 * '구역을 고르고 그 안에서 빈자리를 빠르게 찾는' 동작을 익히는 것이다.
 *
 * soldOutRate는 '빈자리 밀도'를 정한다. 인기 구역일수록 높게 잡되, 빈자리가 20석 아래로
 * 내려가지 않게 한다 — 남은 자리가 너무 적으면 매진까지 걸리는 시간이 판마다 크게 흔들려
 * 고른 난이도(쉬움/보통/어려움)가 무의미해지기 때문이다.
 */
export const ZONES: Record<ZoneKind, Zone> = {
  table: {
    id: "table",
    name: "테이블석",
    description: "가장 먼저 매진되는 인기석",
    rows: 10,
    cols: 18,
    soldOutRate: 0.85,
  },
  infield: {
    id: "infield",
    name: "내야 지정석",
    description: "경기가 잘 보이는 기본 좌석",
    rows: 14,
    cols: 28,
    soldOutRate: 0.75,
  },
  cheer: {
    id: "cheer",
    name: "응원 지정석",
    description: "응원단상 근처, 열기가 뜨거운 자리",
    rows: 12,
    cols: 22,
    soldOutRate: 0.85,
  },
  outfield: {
    id: "outfield",
    name: "외야 지정석",
    description: "여유 있게 볼 수 있는 자리",
    rows: 12,
    cols: 32,
    soldOutRate: 0.55,
  },
};

export const ZONE_LIST: Zone[] = [
  ZONES.table,
  ZONES.infield,
  ZONES.cheer,
  ZONES.outfield,
];
