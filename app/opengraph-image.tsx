import { ImageResponse } from "next/og";

/**
 * 동적 Open Graph 이미지 (공유 시 썸네일).
 * - Google Fonts에서 Noto Sans KR(700)을 필요한 글자만 서브셋으로 받아 한글을 렌더한다.
 * - 폰트 로드 실패 시에도 이미지 생성은 되도록 try/catch로 폴백한다.
 * - 앱 다크 테마 색을 반영한 서버시계 모티프.
 */

export const alt = "직꾸 티켓 · KBO 예매 서버시계";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Google Fonts에서 지정 글자(text)만 담은 Noto Sans KR 폰트 바이너리를 받아온다. */
async function loadNotoSansKR(text: string): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&text=${encodeURIComponent(
      text
    )}`;
    const css = await (await fetch(url)).text();
    const src = css.match(
      /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/
    );
    if (!src) return null;
    return await (await fetch(src[1])).arrayBuffer();
  } catch {
    return null;
  }
}

export default async function Image() {
  const eyebrow = "KBO 티켓팅";
  const title = "직꾸 티켓";
  const clock = "18:30:00";
  const tagline = "구단별 예매처 바로가기 · 예매처 서버시간";

  const fontData = await loadNotoSansKR(
    `${eyebrow}${title}${clock}${tagline}0123456789:· `
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0f14",
          color: "#eef1f6",
          fontFamily: "NotoSansKR, sans-serif",
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
            color: "#4f8cff",
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
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: "NotoSansKR", data: fontData, style: "normal", weight: 700 }]
        : undefined,
    }
  );
}
