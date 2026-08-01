"use client";

import { ZONE_LIST, ZoneKind } from "@/entities/stadium";

/**
 * 좌석 구역을 고르는 화면.
 * 구역마다 매진율이 달라, 인기 구역을 고르면 빈자리를 찾기가 그만큼 어려워진다.
 */

interface Props {
  onPickZone: (zoneId: ZoneKind) => void;
}

export default function ZonePicker({ onPickZone }: Props) {
  return (
    <section className="pr-card">
      <h2 className="pr-title">구역을 선택하세요</h2>
      <p className="pr-sub">인기 구역일수록 남은 자리가 적어요.</p>

      <div className="pr-zone-grid">
        {ZONE_LIST.map((zone) => (
          <button
            key={zone.id}
            type="button"
            className="pr-zone-card"
            onClick={() => onPickZone(zone.id)}
          >
            <b className="pr-zone-name">{zone.name}</b>
            <span className="pr-zone-desc">{zone.description}</span>
            <span className="pr-zone-left">
              잔여 {Math.round((1 - zone.soldOutRate) * 100)}%
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
