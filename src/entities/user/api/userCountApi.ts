import { supabase } from "@/shared/api/supabase";

/**
 * 회원 수 조회 함수. (react-query queryFn에서 사용)
 * - users 테이블은 로그인한 사용자만 읽을 수 있어, 비로그인 사이트는 DB 함수로 숫자만 받는다.
 */

/**
 * 가입한 회원 수를 가져온다.
 *
 * DB 함수 `get_user_count`가 회원 수 숫자 하나만 돌려준다. 회원 정보는 브라우저로
 * 내려오지 않으므로, 홍보 문구에 쓰는 숫자 하나를 위해 회원 목록을 노출하지 않는다.
 */
export async function getUserCount(): Promise<number> {
  const { data: userCount, error } = await supabase.rpc("get_user_count");

  if (error) throw error;
  return userCount ?? 0;
}
