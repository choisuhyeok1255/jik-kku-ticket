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
 */
export interface Team {
  id: string;
  name: string; // 정식 명칭
  short: string; // 짧은 이름 (엠블럼 대체 텍스트)
  color: string; // 구단 대표 색
  vendors: TeamVendor[]; // 홈경기 예매처 목록
}
