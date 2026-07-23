import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_DESCRIPTION } from "@/shared/config/site";

/**
 * 웹 앱 매니페스트 (PWA/모바일 홈 화면 추가용).
 * - 다크 테마 색으로 배경·테마 색을 맞춘다.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} | KBO 예매 서버시계`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
