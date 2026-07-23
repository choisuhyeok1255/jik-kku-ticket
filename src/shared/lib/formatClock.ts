/**
 * 서버 시각(ms)을 KST(Asia/Seoul) 기준 시:분:초.밀리초 조각으로 포맷한다.
 * 밀리초는 2자리(1/100초)로 표시한다.
 *
 * @param serverNow 표시할 시각(ms). null이면(마운트 전 등) 모두 "--" 플레이스홀더.
 */

const kstFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export interface ClockParts {
  hh: string;
  mm: string;
  ss: string;
  ms: string;
}

export function formatClock(serverNow: number | null): ClockParts {
  if (serverNow === null) return { hh: "--", mm: "--", ss: "--", ms: "--" };

  const parts = kstFormatter.formatToParts(new Date(serverNow));
  const pick = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "--";

  return {
    hh: pick("hour"),
    mm: pick("minute"),
    ss: pick("second"),
    ms: String(Math.floor((serverNow % 1000) / 10)).padStart(2, "0"),
  };
}
