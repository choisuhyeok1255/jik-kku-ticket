"use client";

import { TEAM_LIST } from "@/entities/team";

/**
 * 인라인 팀 선택 그리드.
 * - 메인 화면에서 서버시계 옆에 배치되어, 별도 화면 전환 없이 응원 팀을 바로 바꾼다.
 * - 짧은 팀 이름을 5열 × 2줄 그리드로 배치하고, 현재 팀을 팀 색으로 하이라이트한다.
 */

interface Props {
  currentTeam: string;
  onPick: (teamId: string) => void;
}

export default function TeamPicker({ currentTeam, onPick }: Props) {
  return (
    <div className="team-picker">
      <div className="team-picker-grid">
        {TEAM_LIST.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`team-picker-cell ${t.id === currentTeam ? "on" : ""}`}
            style={{ ["--team" as string]: t.color }}
            onClick={() => onPick(t.id)}
          >
            {t.short}
          </button>
        ))}
      </div>
    </div>
  );
}
