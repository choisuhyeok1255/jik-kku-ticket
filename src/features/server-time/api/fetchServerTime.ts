import { apiClient } from "@/shared/api/apiClient";

/**
 * 서버시간 API 호출 함수. (react-query의 queryFn에서 사용)
 * - 표준시 또는 예매처 서버시간을 받아온다.
 * - 왕복 지연을 보정한 오프셋(소스시각 - 브라우저시각)까지 계산해 함께 반환한다.
 */

// 예매처를 새로 측정하는 응답은 수 초 걸릴 수 있어 넉넉히 잡되, 무한정 기다리지는 않는다
const REQUEST_TIMEOUT_MS = 15_000;

export interface ServerTimeResponse {
  ok: boolean;
  source: string; // "standard" 또는 예매처 key
  receivedAt: number; // 서버가 요청을 받은 시각(소스 시각 기준, ms)
  respondedAt: number; // 서버가 응답을 만든 시각(소스 시각 기준, ms)
  precisionMs: number; // 소스 시각 추정의 오차 폭(±ms)
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
  const t0 = Date.now(); // 요청 보낸 시각 (브라우저)
  const { data } = await apiClient.get<ServerTimeResponse>("/api/server-time", {
    params: vendor ? { vendor } : undefined,
    timeout: REQUEST_TIMEOUT_MS,
  });
  const t3 = Date.now(); // 응답 받은 시각 (브라우저)

  return {
    ...data,
    offset: calcOffset(t0, data.receivedAt, data.respondedAt, t3),
  };
}

/**
 * NTP 방식으로 오프셋(소스시각 - 브라우저시각)을 구한다.
 *
 * 가는 편도 지연은 (t1 - t0), 오는 편도 지연은 (t3 - t2)이고
 * 둘의 차이를 반으로 나눈 값이 시계 차이가 된다. 서버가 측정하느라 붙잡고 있던
 * 시간(t1~t2)은 양쪽 어디에도 들어가지 않으므로, 응답이 수 초 걸려도 결과가 흔들리지 않는다.
 *
 * @param t0 브라우저가 요청을 보낸 시각
 * @param t1 서버가 요청을 받은 시각 (소스 시각 기준)
 * @param t2 서버가 응답을 만든 시각 (소스 시각 기준)
 * @param t3 브라우저가 응답을 받은 시각
 */
function calcOffset(t0: number, t1: number, t2: number, t3: number): number {
  return (t1 - t0 + (t2 - t3)) / 2;
}
