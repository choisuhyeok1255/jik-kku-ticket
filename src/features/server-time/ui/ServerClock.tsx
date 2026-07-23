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
  ...Object.values(VENDORS).map((v) => ({ key: v.key, label: v.shortName })),
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

  return (
    <div className="clock" data-state={state}>
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

      <div className="clock-label">
        <span className={`dot ${state}`} />
        {label}
      </div>

      <div className="clock-time">
        <span>{hh}</span>
        <span className="colon">:</span>
        <span>{mm}</span>
        <span className="colon">:</span>
        <span>{ss}</span>
        <span className="ms">.{ms}</span>
      </div>

      <div className="clock-note">{getNote(state, isStandard)}</div>
    </div>
  );
}
