/**
 * 서버시계 기능의 **서버 전용** public API.
 *
 * 클라이언트용 `index.ts`와 분리한 이유: `getVendorServerTime`은 서버에서만 도는 로직인데,
 * 클라이언트 컴포넌트(ServerClock)를 함께 내보내는 `index.ts`에 얹으면 서버/클라 번들 경계가
 * 섞인다. 진입점을 둘로 나눠 public API 규칙(슬라이스는 index로만 접근)을 지키면서
 * 번들 경계도 유지한다.
 *
 * 서버 컴포넌트·라우트 핸들러에서만 import한다.
 */
export {
  getVendorServerTime,
  type ServerTimeResult,
} from "./api/vendorServerTime";
