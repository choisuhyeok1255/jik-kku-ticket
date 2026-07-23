"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TEAMS, TEAM_LIST, useMyTeam } from "@/entities/team";
import { VENDORS } from "@/entities/vendor";
import { VendorKey } from "@/shared/config/vendor-keys";
import { ServerClock, type ClockSource } from "@/features/server-time";
import { TeamOnboardingModal } from "@/features/pick-team";
import { TeamCalendar } from "@/widgets/team-calendar";
import { SiteHeader } from "@/widgets/site-header";

/**
 * 메인 화면.
 * - 진입하면 바로 캘린더를 보여준다(응원팀 설정은 선택사항).
 * - 첫 방문(팀 미설정 & 온보딩 미열람)이면 딤 모달로 팀 선택을 유도한다.
 * - 상단 팀 바에 현재 응원팀과 "팀 변경" 버튼을 두고, 변경 시 같은 모달을 재사용한다.
 * - 서버시계는 전폭으로 크게, 시계 기본값은 표준시. 캘린더 예매처 버튼으로 예매처 시계로 전환.
 */

export default function HomePage() {
  const { team, loaded, hasSeenOnboarding, setTeam, markOnboardingSeen } =
    useMyTeam();
  const [activeSource, setActiveSource] = useState<ClockSource>("standard");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 첫 방문(팀 미설정 & 온보딩 미열람)이면 팀 선택 모달을 연다
  useEffect(() => {
    const openModalOnFirstVisit = () => {
      if (loaded && !team && !hasSeenOnboarding) setIsModalOpen(true);
    };
    openModalOnFirstVisit();
  }, [loaded, team, hasSeenOnboarding]);

  const handleSourceChange = (source: ClockSource) => setActiveSource(source);
  const handlePickVendor = (vendor: VendorKey) => setActiveSource(vendor);

  // 모달에서 팀 선택/변경 (기본 응원팀 설정 + 토스트)
  const handlePickTeamFromModal = (teamId: string) => {
    setTeam(teamId);
    markOnboardingSeen();
    setIsModalOpen(false);
    toast.success(`${TEAMS[teamId].name}을 기본 응원팀으로 설정했어요`);
  };

  const handleCloseModal = () => {
    markOnboardingSeen();
    setIsModalOpen(false);
  };

  if (!loaded) {
    return (
      <main className="wrap">
        <p className="loading-line">불러오는 중…</p>
      </main>
    );
  }

  const displayTeamId = team ?? TEAM_LIST[0].id; // 미설정이면 첫 팀 기준으로 표시
  const isUnset = !team;
  const displayTeam = TEAMS[displayTeamId];
  const homeVendor = VENDORS[displayTeam.vendors[0].key];

  return (
    <main className="wrap">
      <SiteHeader />

      <div className="team-bar">
        <div className="team-bar-info">
          <span
            className="team-bar-dot"
            style={{ background: displayTeam.color }}
          />
          <span className="team-bar-name">
            {isUnset ? "응원팀 미설정" : displayTeam.name}
          </span>
          <span className="team-bar-vendor">
            {isUnset ? `${displayTeam.name} 기준` : `예매 ${homeVendor.shortName}`}
          </span>
        </div>
        <button
          type="button"
          className="team-bar-change"
          onClick={() => setIsModalOpen(true)}
        >
          {isUnset ? "응원팀 선택" : "팀 변경"}
        </button>
      </div>

      <ServerClock
        activeSource={activeSource}
        onSourceChange={handleSourceChange}
      />

      <TeamCalendar teamId={displayTeamId} onPickVendor={handlePickVendor} />

      {isModalOpen && (
        <TeamOnboardingModal
          currentTeam={team ?? undefined}
          onPick={handlePickTeamFromModal}
          onSkip={handleCloseModal}
        />
      )}
    </main>
  );
}
