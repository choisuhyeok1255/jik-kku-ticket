/**
 * 예매처 식별 키(계약).
 * - team·vendor·server-time 여러 슬라이스가 공유하는 앱 전역 식별자라 shared에 둔다.
 * - 이 키로 VENDORS 매핑과 서버시계 소스를 구분한다.
 */
export type VendorKey = "ticketlink" | "nol" | "ssg" | "nc" | "lotte";
