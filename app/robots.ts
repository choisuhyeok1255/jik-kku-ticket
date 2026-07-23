import type { MetadataRoute } from "next";
import { SITE_URL } from "@/shared/config/site";

/**
 * robots.txt 생성.
 * - 전체 공개 허용, 내부 API 경로(/api/)만 크롤 제외.
 * - 사이트맵 위치를 안내한다.
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
