import { supabase } from "@/shared/api/supabase";

/**
 * Supabase users 조회 함수. (react-query queryFn에서 사용)
 * - RLS가 public read라 anon 키로 조회 가능하다.
 */

/**
 * 가입한 회원 수를 센다.
 *
 * `head: true`라 행은 하나도 받지 않고 개수만 가져온다. 회원 정보가 브라우저로
 * 내려오지 않으므로, 홍보 문구에 쓰는 숫자 하나를 위해 회원 목록을 노출하지 않는다.
 */
export async function getUserCount(): Promise<number> {
  const { count, error } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  return count ?? 0;
}
