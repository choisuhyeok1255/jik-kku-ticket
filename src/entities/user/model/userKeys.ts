/**
 * 회원 도메인 쿼리키 팩토리.
 *
 * 조회가 하나뿐이어도 팩토리로 둔다. 인라인 배열로 시작하면 나중에 무효화하는 곳이
 * 생길 때 키가 어긋나기 쉽다.
 */
export const userKeys = {
  all: ["users"] as const,
  count: () => [...userKeys.all, "count"] as const,
};
