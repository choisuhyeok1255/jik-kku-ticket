import { NextRequest, NextResponse } from "next/server";
import { VENDORS } from "@/entities/vendor";
import { VendorKey } from "@/shared/config/vendor-keys";
import { getVendorServerTime } from "@/features/server-time/api/vendorServerTime";

// 이 라우트는 항상 런타임에 실행되어야 합니다 (요청 시점의 실제 시각을 내려줘야 하므로)
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * 현재 시각을 밀리초 정밀도로 내려줍니다.
 *
 * - vendor 파라미터 없음 → 우리 서버 시각(표준시). 서버가 표준시(NTP)에 맞춰진 환경에서 정확.
 * - vendor 파라미터 있음 → 그 예매처의 서버시간. 예매처 `Date` 헤더의 '초 경계'를 감지해
 *   밀리초까지 복원한다. (자세한 원리는 features/server-time/api/vendorServerTime.ts 참고)
 *
 * ※ 로컬 개발 시 표준시는 곧 개발 PC 시각과 동일하게 표시됩니다.
 *
 * 응답:
 *   serverTime : 현재 시각(ms)
 *   fetchedAt  : 응답을 만든 시각(ms)
 *   source     : "standard" 또는 예매처 key
 *   precise    : 예매처의 경우, 초 경계로 잡은 정밀 값인지
 */
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("vendor") as VendorKey | null;

  // 표준시 (우리 서버 시각)
  if (!key) {
    const now = Date.now();
    return NextResponse.json({
      ok: true,
      source: "standard",
      serverTime: now,
      fetchedAt: now,
      precise: true,
    });
  }

  const vendor = VENDORS[key];
  if (!vendor) {
    return NextResponse.json(
      { ok: false, error: "unknown vendor" },
      { status: 400 }
    );
  }

  const { serverTime, precise, fallback } = await getVendorServerTime(
    key,
    vendor.pingUrl
  );

  return NextResponse.json({
    ok: !fallback,
    source: key,
    serverTime,
    fetchedAt: Date.now(),
    precise,
  });
}
