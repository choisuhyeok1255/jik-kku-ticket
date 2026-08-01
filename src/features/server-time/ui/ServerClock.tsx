"use client";

import { VENDORS } from "@/entities/vendor";
import { VendorKey } from "@/shared/config/vendor-keys";
import { formatClock } from "@/shared/lib/formatClock";
import { useServerClock, ClockState } from "../model/useServerClock";

/**
 * 전환형 서버시계.
 * - 표준시 + 예매처(티켓링크·NOL·SSG·NC·롯데) 소스를 그리드 버튼으로 제공한다.
 * - 예매처 소스는 그 예매처의 실제 서버시간(밀리초 정밀)을 표시한다.
 * - 활성 소스는 부모가 제어한다.
 */

export type ClockSource = "standard" | VendorKey;

interface Props {
  activeSource: ClockSource;
  onSourceChange: (source: ClockSource) => void;
}

const TABS: { key: ClockSource; label: string }[] = [
  { key: "standard", label: "표준시" },
  // noClock 예매처(서버시간 관측 불가)는 시계 소스에서 제외한다
  ...Object.values(VENDORS)
    .filter((v) => !v.noClock)
    .map((v) => ({ key: v.key, label: v.shortName })),
];

const getNote = (state: ClockState, isStandard: boolean): string => {
  if (state === "loading") return "동기화 중…";
  if (state === "error") return "동기화 실패 — 내 PC 시간 표시 중";
  return isStandard ? "서버 시각과 동기화됨" : "예매처 서버와 동기화됨";
};

export default function ServerClock({ activeSource, onSourceChange }: Props) {
  const isStandard = activeSource === "standard";
  const { serverNow, state } = useServerClock(
    isStandard ? undefined : activeSource
  );
  const { hh, mm, ss, ms } = formatClock(serverNow);

  const label = isStandard
    ? "현재 시각 (표준시)"
    : `${VENDORS[activeSource].name} 서버시간`;
  // 예매처 소스일 때, 서버시간을 읽어오는 서버 도메인을 표시한다
  const host = isStandard
    ? null
    : new URL(VENDORS[activeSource].pingUrl).hostname;

  return (
    /* 라벨 → 시각 → 상태 → 소스 순으로 둔다. 숫자를 화면 가운데 두고
       나머지를 위아래로 흩어, 시각이 가장 먼저 눈에 들어오게 하기 위함 */
    <div className="clock" data-state={state}>
      <div className="clock-label">
        <span>{label}</span>
        {host && <span className="clock-host">· {host}</span>}
      </div>

      {/* 시·분·초를 각각 고정폭 칸(seg)에 넣는다. 본문 폰트가 등폭 숫자를 지원하지 않아
          칸을 안 잡아두면 숫자가 바뀔 때마다 시계 전체가 좌우로 흔들린다 */}
      <div className="clock-time">
        <span className="seg">{hh}</span>
        <span className="colon">:</span>
        <span className="seg">{mm}</span>
        <span className="colon">:</span>
        <span className="seg">{ss}</span>
        <span className="ms">.{ms}</span>
      </div>

      <div className="clock-note">
        <span className={`dot ${state}`} />
        {getNote(state, isStandard)}
      </div>

      <div className="clock-sources">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`clock-source ${tab.key === activeSource ? "on" : ""}`}
            onClick={() => onSourceChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
