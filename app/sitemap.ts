import type { MetadataRoute } from "next";
import { SITE_URL } from "@/shared/config/site";

/**
 * 사이트맵 생성.
 * - 홈(/): 경기 일정이 매일 갱신되므로 changeFrequency는 daily.
 * - 연습(/practice): 내용이 고정된 기능 페이지라 monthly.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/practice`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
