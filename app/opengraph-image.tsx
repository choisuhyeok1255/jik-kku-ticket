import { ImageResponse } from "next/og";
import { loadOgFont, OG_FONT_FAMILY } from "./_og/font";

/**
 * 동적 Open Graph 이미지 (공유 시 썸네일).
 * - 앱 다크 테마 색을 반영한 서버시계 모티프.
 */

export const alt = "KBO 예매 서버시계 | 직꾸 티켓";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const eyebrow = "KBO 티켓팅";
  const title = "직꾸 티켓";
  const clock = "18:30:00";
  const tagline = "구단별 예매처 바로가기 · 예매처 서버시간";

  const fontData = await loadOgFont();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        color: "#ffffff",
        fontFamily: `${OG_FONT_FAMILY}, sans-serif`,
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 30,
          letterSpacing: 8,
          color: "#99a2b2",
          marginBottom: 20,
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 118,
          fontWeight: 700,
          letterSpacing: -2,
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 72,
          fontWeight: 700,
          color: "#c6e900",
          marginTop: 14,
          letterSpacing: 2,
        }}
      >
        {clock}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 30,
          color: "#99a2b2",
          marginTop: 28,
        }}
      >
        {tagline}
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: OG_FONT_FAMILY, data: fontData, style: "normal", weight: 700 },
      ],
    }
  );
}
