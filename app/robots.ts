import type { MetadataRoute } from "next";
import { SITE_URL } from "@/shared/config/site";

/**
 * robots.txt 생성.
 * - 전체 공개 허용, 내부 API 경로(/api/)만 크롤 제외.
 *   (AI 크롤러도 따로 막지 않는다 — AI 답변에 이 사이트가 인용되길 원하기 때문)
 * - 사이트맵 위치를 안내한다.
 *   (llms.txt는 여기서 안내하지 않는다 — MetadataRoute.Robots가 rules·sitemap·host만
 *    받아 임의 줄을 넣을 수 없다. 크롤러도 루트 경로에서 관례적으로 찾는다)
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
