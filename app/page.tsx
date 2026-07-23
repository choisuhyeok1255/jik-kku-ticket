import { HomePage } from "@/pages/home";

/**
 * 루트 라우트(/) 진입점.
 * - Next.js App Router의 얇은 라우팅 파일. 실제 화면은 FSD pages 레이어의 HomePage가 담당한다.
 */
export default function Page() {
  return <HomePage />;
}
