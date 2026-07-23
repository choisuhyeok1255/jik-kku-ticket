// 서버시계 기능 public API (클라이언트용)
// ※ 서버 전용 로직 getVendorServerTime(./api/vendorServerTime)은 서버/클라 번들 경계 때문에
//   여기서 노출하지 않고, 라우트 핸들러가 직접 import한다.
export { default as ServerClock } from "./ui/ServerClock";
export type { ClockSource } from "./ui/ServerClock";
