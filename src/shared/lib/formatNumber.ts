/**
 * 사람이 읽는 수에 천 단위 구분을 넣는다.
 *
 * 화면에서 `toLocaleString()`을 직접 부르지 않고 이 함수를 거친다.
 * 콤마를 빼먹는 실수를 막고, 로케일 정책이 바뀌어도 한 곳만 고치면 되게 하기 위함이다.
 *
 * 식별자·연도·페이지 번호처럼 콤마가 들어가면 오히려 틀려 보이는 수에는 쓰지 않는다.
 */
export const formatNumber = (value: number): string =>
  value.toLocaleString("ko-KR");
