import { NextResponse } from "next/server";

/**
 * 캐시되면 안 되는 JSON 응답을 만드는 라우트 핸들러용 헬퍼.
 * 시각처럼 한 순간에만 유효한 값은 브라우저·CDN 어디에도 남으면 안 되므로 `no-store`를 붙인다.
 *
 * @param body 응답 본문
 * @param status HTTP 상태 코드 (기본 200)
 */
export function jsonNoStore(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
