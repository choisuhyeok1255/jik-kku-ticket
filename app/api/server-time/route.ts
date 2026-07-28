import { NextRequest, after } from "next/server";
import { VENDORS } from "@/entities/vendor";
import { VendorKey } from "@/shared/config/vendor-keys";
import { jsonNoStore } from "@/shared/api/jsonNoStore";
import { getVendorServerTime } from "@/features/server-time/index.server";

// 이 라우트는 항상 런타임에 실행되어야 합니다 (요청 시점의 실제 시각을 내려줘야 하므로)
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 예매처를 새로 측정하는 경로는 수 초가 걸리고, after()로 미룬 갱신도 이 예산을 함께 쓴다
export const maxDuration = 30;

/**
 * 현재 시각을 밀리초 정밀도로 내려줍니다.
 *
 * - vendor 파라미터 없음 → 우리 서버 시각(표준시). 서버가 표준시(NTP)에 맞춰진 환경에서 정확.
 * - vendor 파라미터 있음 → 그 예매처의 서버시간.
 *   (측정 원리는 features/server-time/api/vendorServerTime.ts 참고)
 *
 * ※ 로컬 개발 시 표준시는 곧 개발 PC 시각과 동일하게 표시됩니다.
 *
 * 응답에 시각을 둘(수신·응답) 내려주는 이유:
 *   예매처를 새로 측정하는 요청은 응답까지 수 초가 걸린다. 시각을 하나만 주면
 *   클라이언트가 그 측정 시간까지 네트워크 지연으로 오인해 시계가 앞서간다.
 *   두 시각을 주면 서버가 붙잡고 있던 시간을 빼고 왕복 지연만 추정할 수 있다.
 *
 * 응답:
 *   receivedAt  : 요청을 받은 시각 (소스 시각 기준, ms)
 *   respondedAt : 응답을 만든 시각 (소스 시각 기준, ms)
 *   source      : "standard" 또는 예매처 key
 *   precisionMs : 소스 시각 추정의 오차 폭(±ms). 표준시는 0
 */
export async function GET(req: NextRequest) {
  const receivedAt = Date.now();
  const key = req.nextUrl.searchParams.get("vendor") as VendorKey | null;

  // 표준시 (우리 서버 시각)
  if (!key) {
    return jsonNoStore({
      ok: true,
      source: "standard",
      receivedAt,
      respondedAt: Date.now(),
      precisionMs: 0,
    });
  }

  const vendor = VENDORS[key];
  if (!vendor) {
    return jsonNoStore({ ok: false, error: "unknown vendor" }, 400);
  }

  const { offset, precisionMs, fallback, refresh } = await getVendorServerTime(
    key,
    vendor.pingUrl
  );

  // 캐시가 오래됐을 때의 재측정은 응답을 보낸 뒤에 돌린다 (사용자를 기다리게 하지 않음)
  if (refresh) after(refresh);

  return jsonNoStore({
    ok: !fallback,
    source: key,
    receivedAt: receivedAt + offset,
    respondedAt: Date.now() + offset,
    precisionMs,
  });
}
