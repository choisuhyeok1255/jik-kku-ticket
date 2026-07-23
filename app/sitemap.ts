import type { MetadataRoute } from "next";
import { SITE_URL } from "@/shared/config/site";

/**
 * 사이트맵 생성.
 * - 단일 페이지 앱이라 홈(/) 하나. 경기 일정이 매일 갱신되므로 changeFrequency는 daily.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
