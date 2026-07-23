/**
 * 전역 Supabase 인스턴스.
 * - 앱 어디서든 `import { supabase } from "@/shared/api/supabase"` 로 가져다 쓴다.
 * - 환경변수(URL·anon 키)가 없으면 초기화 시점에 즉시 에러를 던져 원인을 빨리 드러낸다.
 */
import { createClient } from "./supabase/client";

if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient();
