"use client";

import { TEAM_LIST } from "@/entities/team";
import { VENDORS } from "@/entities/vendor";

/**
 * 응원 팀 선택 온보딩 화면.
 * - 첫 방문(팀 미설정) 또는 팀 변경 시 표시한다.
 * - 팀을 고르면 그 팀 기준으로 캘린더·예매처·서버시간이 세팅된다고 안내한다.
 */

interface Props {
  onPick: (teamId: string) => void;
  currentTeam?: string; // 변경 모드일 때 현재 팀 (하이라이트)
  onClose?: () => void; // 변경 모드 취소
}

export default function Onboarding({ onPick, currentTeam, onClose }: Props) {
  const isChanging = Boolean(currentTeam);

  return (
    <div className="onb">
      <div className="onb-inner">
        <p className="onb-eyebrow">⚾ 야구 예매, 여기서 시작</p>
        <h1 className="onb-title">
          {isChanging ? "응원 팀 변경" : "응원 팀을 골라주세요"}
        </h1>
        <p className="onb-sub">
          고른 팀을 기준으로 <b>월간 경기 캘린더</b>, <b>예매처 바로가기</b>, 그리고{" "}
          <b>그 예매처의 서버시간</b>이 기본으로 세팅돼요.
        </p>

        <div className="onb-grid">
          {TEAM_LIST.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`onb-team ${t.id === currentTeam ? "on" : ""}`}
              style={{ ["--team" as string]: t.color }}
              onClick={() => onPick(t.id)}
            >
              <span className="onb-team-name">{t.name}</span>
              <span className="onb-team-vendor">
                예매: {t.vendors.map((tv) => VENDORS[tv.key].shortName).join(", ")}
              </span>
            </button>
          ))}
        </div>

        {isChanging && onClose && (
          <button type="button" className="onb-cancel" onClick={onClose}>
            취소
          </button>
        )}
      </div>
    </div>
  );
}
