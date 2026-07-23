import axios from "axios";

/**
 * 공통 axios 인스턴스.
 * - 앱의 모든 클라이언트 → 서버 API 호출은 이 인스턴스를 거친다.
 * - 응답 인터셉터를 서버 에러의 공통 처리 지점으로 둔다.
 *   (토스트 라이브러리 도입 시, 여기서 사용자 알림을 한곳에서 붙인다.)
 */
export const apiClient = axios.create({
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 공통 에러 처리 지점 (현재는 정규화 없이 그대로 전달)
    return Promise.reject(error);
  }
);
