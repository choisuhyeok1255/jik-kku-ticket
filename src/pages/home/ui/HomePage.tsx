"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TEAMS, TEAM_LIST, useMyTeam } from "@/entities/team";
import { VendorKey } from "@/shared/config/vendor-keys";
import { ServerClock, type ClockSource } from "@/features/server-time";
import { TeamOnboardingModal } from "@/features/pick-team";
import { TeamCalendar } from "@/widgets/team-calendar";
import { SiteHeader } from "@/widgets/site-header";
import { AppPromo } from "@/widgets/app-promo";
import { PracticePromo } from "@/widgets/practice-promo";

/**
 * 메인 화면.
 * - 진입하면 바로 캘린더를 보여준다(응원팀 설정은 선택사항).
 * - 첫 방문(팀 미설정 & 온보딩 미열람)이면 딤 모달로 팀 선택을 유도한다.
 * - 팀 변경은 캘린더 헤더의 버튼으로 열고, 같은 모달을 재사용한다(변경 모드).
 * - 서버시계는 전폭, 기본값은 표준시. 캘린더 예매처 버튼으로 예매처 시계로 전환.
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

  const displayTeamId = team ?? TEAM_LIST[0].id; // 미설정이면 첫 팀 기준으로 표시
  const isUnset = !team;

  return (
    <div className="page-layout">
      <main className="wrap">
        <SiteHeader />

        {/* 저장된 응원팀을 읽는 동안에도 레이아웃 골격은 그대로 둔다
            (로딩 중에만 다른 구조를 쓰면 로드되는 순간 본문이 옆으로 튄다) */}
        {!loaded && <p className="loading-line">불러오는 중…</p>}

        {loaded && (
          <>
            <ServerClock
              activeSource={activeSource}
              onSourceChange={handleSourceChange}
            />

            <TeamCalendar
              teamId={displayTeamId}
              onPickVendor={handlePickVendor}
              onChangeTeam={() => setIsModalOpen(true)}
              isUnset={isUnset}
            />
          </>
        )}

        {/* 모바일: 광고 섹션을 main 내부(콘텐츠 흐름) 하단에 둔다 */}
        <div className="promo-inline">
          <AppPromo />
          <PracticePromo />
        </div>
      </main>

      {/* 데스크탑: 광고 섹션을 콘텐츠 옆 사이드에 둔다 */}
      <aside className="promo-aside">
        <AppPromo />
        <PracticePromo />
      </aside>

      {isModalOpen && (
        <TeamOnboardingModal
          currentTeam={team ?? undefined}
          onPick={handlePickTeamFromModal}
          onSkip={handleCloseModal}
        />
      )}
    </div>
  );
}
