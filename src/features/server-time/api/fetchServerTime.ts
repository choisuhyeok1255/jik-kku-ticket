import { apiClient } from "@/shared/api/apiClient";

/**
 * 서버시간 API 호출 함수. (react-query의 queryFn에서 사용)
 * - 표준시 또는 예매처 서버시간을 받아온다.
 * - 왕복 지연을 보정한 오프셋(소스시각 - 브라우저시각)까지 계산해 함께 반환한다.
 */

export interface ServerTimeResponse {
  ok: boolean;
  source: string; // "standard" 또는 예매처 key
  serverTime: number; // 소스의 현재 시각(ms)
  fetchedAt: number;
  precise: boolean;
}

export interface ServerTimeSample extends ServerTimeResponse {
  offset: number; // 소스시각 - 브라우저시각(ms), 왕복 보정 적용
}

/**
 * @param vendor 예매처 key. 비우면 표준시(우리 서버 시각)를 받는다.
 */
export async function fetchServerTime(
  vendor?: string
): Promise<ServerTimeSample> {
  const t0 = Date.now();
  const { data } = await apiClient.get<ServerTimeResponse>("/api/server-time", {
    params: vendor ? { vendor } : undefined,
  });
  const t1 = Date.now();

  // 요청을 보낸 시점과 받은 시점의 중간을 기준으로 오프셋 계산 (NTP 방식)
  const mid = (t0 + t1) / 2;
  return { ...data, offset: data.serverTime - mid };
}
