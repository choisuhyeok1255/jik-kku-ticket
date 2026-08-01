"use client";

import { TEAM_LIST, teamColorVars } from "@/entities/team";

/**
 * 응원 팀 선택/변경 딤 모달.
 * - 첫 방문 시 팀 선택을 유도하고(currentTeam 없음), 이후 팀 변경에도 재사용한다(currentTeam 있음).
 * - 캘린더 위에 딤과 함께 올라와, 팀을 고르면 기본 응원팀으로 설정된다(onPick).
 * - 딤 영역 클릭이나 하단 버튼으로 닫는다(onSkip).
 */

interface Props {
  currentTeam?: string; // 있으면 변경 모드 (현재 팀 하이라이트)
  onPick: (teamId: string) => void;
  onSkip: () => void;
}

export default function TeamOnboardingModal({
  currentTeam,
  onPick,
  onSkip,
}: Props) {
  const isChanging = Boolean(currentTeam);

  return (
    <div
      className="modal-dim"
      role="dialog"
      aria-modal="true"
      aria-label="응원 팀 선택"
      onClick={onSkip}
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <p className="modal-eyebrow">⚾ 야구 예매, 여기서 시작</p>
        <h2 className="modal-title">
          {isChanging ? "응원 팀 변경" : "응원 팀을 골라주세요"}
        </h2>
        <p className="modal-sub">
          {isChanging
            ? "바꿀 팀을 골라주세요. 캘린더가 그 팀 기준으로 맞춰져요."
            : "고른 팀은 기본 응원팀으로 저장돼, 캘린더가 그 팀 기준으로 맞춰져요. 지금 안 골라도 둘러볼 수 있어요."}
        </p>

        <div className="modal-team-grid">
          {TEAM_LIST.map((t) => (
            /* 각 칸이 자기 구단 색 점을 갖는다 — 목록에서 팀을 색으로도 구분하게 */
            <button
              key={t.id}
              type="button"
              className={`modal-team-cell themed ${
                t.id === currentTeam ? "on" : ""
              }`}
              style={teamColorVars(t)}
              onClick={() => onPick(t.id)}
            >
              {t.name}
            </button>
          ))}
        </div>

        <button type="button" className="modal-skip" onClick={onSkip}>
          {isChanging ? "취소" : "나중에 할게요"}
        </button>
      </div>
    </div>
  );
}
