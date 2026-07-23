/**
 * Supabase 클라이언트 팩토리 (브라우저·서버 공용, anon 키).
 * - 인증 없이 읽기 위주로 쓰는 프로젝트라 anon(공개) 키로 클라이언트를 만든다.
 * - 생성된 Database 타입을 제네릭으로 붙여 .from().select() 결과가 타입 추론된다.
 */
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Database } from "../supabase.types";

export function createClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
