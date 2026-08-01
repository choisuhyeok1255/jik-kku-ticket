/**
 * 야구장 좌석 구역 도메인 타입.
 * 구단별 실제 구역명은 시즌마다 바뀌고 구장마다 달라, 어느 구장에나 있는 '대표 구역 유형'으로 다룬다.
 */

export type ZoneKind = "table" | "infield" | "cheer" | "outfield";

export interface Zone {
  id: ZoneKind;
  /** 화면에 보여줄 구역 이름 */
  name: string;
  /** 구역 성격을 한 줄로 설명 (어떤 자리인지) */
  description: string;
  /** 좌석 배치 크기 */
  rows: number;
  cols: number;
  /** 이미 팔린 좌석 비율(0~1). 높을수록 빈자리를 찾기 어렵다 */
  soldOutRate: number;
}
