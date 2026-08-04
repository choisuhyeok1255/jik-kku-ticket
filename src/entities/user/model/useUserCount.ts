"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserCount } from "../api/userCountApi";
import { userKeys } from "./userKeys";

/**
 * 가입한 회원 수를 조회하는 훅.
 *
 * 홍보 문구에 쓰는 값이라 화면을 열 때 한 번만 가져오면 충분하다.
 * 켜둔 채로 갱신하지 않으므로 주기적 재조회는 두지 않았다.
 */
export function useUserCount() {
  const {
    data: userCount,
    isPending: isUserCountPending,
    isError: isUserCountError,
  } = useQuery({
    queryKey: userKeys.count(),
    queryFn: getUserCount,
    /*
     * 실패하면 곧장 포기한다. 기본 재시도(3회, 지수 백오프)를 그대로 두면
     * 실패가 확정되기까지 15초가 걸려, 그동안 배너가 숫자 없는 문구로 남는다.
     * 홍보 문구에 쓰는 값이라 빨리 기본값으로 넘어가는 편이 낫다.
     */
    retry: false,
  });

  return { userCount, isUserCountPending, isUserCountError };
}
