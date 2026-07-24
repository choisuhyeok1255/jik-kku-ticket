import { VendorKey } from "@/shared/config/vendor-keys";

/**
 * 예매처 엔티티 타입.
 * - name: 정식 표시명, shortName: 좁은 영역(시계 탭·달력 셀)용 약칭.
 * - pingUrl: 서버시간을 읽어올 대상 도메인(HTTP Date 헤더 관측 대상).
 * - 실제 예매 링크(bookingUrl)는 구단별로 달라, 예매처가 아니라 팀(Team.vendors)에 둔다.
 */
export interface Vendor {
  key: VendorKey;
  name: string;
  shortName: string;
  pingUrl: string;
  noClock?: boolean; // true면 시계 소스에서 제외 (예매 링크 전용 예매처)
}
