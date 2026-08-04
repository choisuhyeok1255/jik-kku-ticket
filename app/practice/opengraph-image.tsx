import { ImageResponse } from "next/og";
import { loadOgFont, OG_FONT_FAMILY } from "../_og/font";

/**
 * 연습 페이지 전용 Open Graph 이미지 (공유 시 썸네일).
 *
 * 루트의 OG 이미지는 이 페이지가 자체 openGraph 메타를 정의하면서 딸려오지 않아,
 * 연습 페이지 링크를 공유하면 썸네일이 아예 뜨지 않았다. 그래서 따로 둔다.
 *
 * 서버시계 모티프인 루트 이미지와 달리, 좌석표(포도알)를 그려 무슨 페이지인지 바로 보이게 한다.
 */

export const alt = "포도알 연습 | 직꾸 티켓";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** 화면의 좌석 색과 같은 값 (globals.css의 --seat-open / --seat-taken) */
const SEAT_OPEN = "#592fd1";
const SEAT_TAKEN = "#cabff3";

/**
 * 좌석표 한 줄. 실제 화면처럼 일부는 이미 팔린 자리로 섞는다.
 * (규칙적인 패턴으로 만들어 렌더할 때마다 그림이 달라지지 않게 한다)
 */
function seatRow(rowIndex: number, columns: number) {
  return Array.from({ length: columns }, (_, col) => {
    const isTaken = (rowIndex * 7 + col * 3) % 5 < 3;
    return (
      <div
        key={col}
        style={{
          width: 26,
          height: 26,
          background: isTaken ? SEAT_TAKEN : SEAT_OPEN,
        }}
      />
    );
  });
}

export default async function Image() {
  const eyebrow = "KBO 티켓팅 연습";
  const title = "포도알 연습";
  const tagline = "구역 선택 · 보안문자 · 좌석 잡기까지 실전 그대로";

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
          fontSize: 110,
          fontWeight: 700,
          letterSpacing: -2,
        }}
      >
        {title}
      </div>

      {/* 좌석표 — 무슨 페이지인지 글자보다 먼저 알아보게 한다 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          marginTop: 34,
        }}
      >
        {Array.from({ length: 4 }, (_, row) => (
          <div key={row} style={{ display: "flex", gap: 4 }}>
            {seatRow(row, 20)}
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          fontSize: 28,
          color: "#99a2b2",
          marginTop: 34,
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
