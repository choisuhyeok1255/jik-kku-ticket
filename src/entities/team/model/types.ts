import { VendorKey } from "@/shared/config/vendor-keys";

/**
 * 팀의 예매처 항목 — 예매처 키 + 그 팀 전용 예매 링크.
 * - 같은 예매처(예: 티켓링크)라도 구단별로 예매 페이지가 달라 링크를 팀에 둔다.
 */
interface TeamVendor {
  key: VendorKey;
  bookingUrl: string; // 이 팀의 이 예매처 예매 링크 (없으면 빈 문자열)
}

/**
 * KBO 구단 엔티티 타입.
 * - vendors: 홈경기 예매처 목록(구단마다 여러 예매처를 가질 수 있음).
 * - color / colorDark: 밝은 화면용과 어두운 화면용 구단 색.
 */
export interface Team {
  id: string;
  name: string; // 정식 명칭
  short: string; // 짧은 이름 (엠블럼 대체 텍스트)
  color: string; // 구단 대표 색 (밝은 배경용)
  /**
   * 어두운 배경용 구단 색.
   *
   * 검정·감색 계열 구단은 원본 그대로 쓰면 어두운 배경과 밝기가 같아 점·선이 보이지 않는다.
   * 그래서 색상과 채도는 유지한 채 밝기만 올려 배경과 3:1 이상 벌어지게 맞춘 값을 따로 둔다.
   * 이미 충분히 밝은 구단(LG·SSG·KIA·한화)은 원본과 같은 값이다.
   */
  colorDark: string;
  vendors: TeamVendor[]; // 홈경기 예매처 목록
}
