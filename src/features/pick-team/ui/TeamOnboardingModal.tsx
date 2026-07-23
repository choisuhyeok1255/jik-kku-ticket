"use client";

import { TEAM_LIST } from "@/entities/team";

/**
 * 첫 방문 시 뜨는 응원 팀 선택 딤 모달.
 * - 캘린더 위에 딤(어두운 배경)과 함께 올라와 팀 선택을 부드럽게 유도한다.
 * - 팀을 고르면 기본 응원팀으로 설정되고(onPick), 안 고르고 넘어갈 수도 있다(onSkip).
 * - 딤 영역 클릭이나 "나중에 할게요"로 스킵한다.
 */

interface Props {
  onPick: (teamId: string) => void;
  onSkip: () => void;
}

export default function TeamOnboardingModal({ onPick, onSkip }: Props) {
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
        <h2 className="modal-title">응원 팀을 골라주세요</h2>
        <p className="modal-sub">
          고른 팀은 <b>기본 응원팀</b>으로 저장돼, 캘린더·예매처·서버시간이 그 팀
          기준으로 맞춰져요. 지금 안 골라도 둘러볼 수 있어요.
        </p>

        <div className="modal-team-grid">
          {TEAM_LIST.map((t) => (
            <button
              key={t.id}
              type="button"
              className="modal-team-cell"
              style={{ ["--team" as string]: t.color }}
              onClick={() => onPick(t.id)}
            >
              {t.short}
            </button>
          ))}
        </div>

        <button type="button" className="modal-skip" onClick={onSkip}>
          나중에 할게요
        </button>
      </div>
    </div>
  );
}
