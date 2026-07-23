/**
 * game_records 쿼리키 팩토리.
 * - useQuery와 무효화가 같은 키를 공유하도록 한곳에서 관리한다. (인라인 배열 금지)
 * - 계층 구조로 상위 키(all/lists)로 하위를 한 번에 무효화할 수 있게 한다.
 */
export const gameKeys = {
  all: ["gameRecords"] as const,
  lists: () => [...gameKeys.all, "list"] as const,
  teamMonth: (teamDbId: number, year: number, month: number) =>
    [...gameKeys.lists(), teamDbId, year, month] as const,
};
