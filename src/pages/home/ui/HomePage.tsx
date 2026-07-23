"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TEAMS, TEAM_LIST, useMyTeam } from "@/entities/team";
import { VendorKey } from "@/shared/config/vendor-keys";
import { ServerClock, type ClockSource } from "@/features/server-time";
import { TeamPicker, TeamOnboardingModal } from "@/features/pick-team";
import { TeamCalendar } from "@/widgets/team-calendar";

/**
 * 메인 화면.
 * - 진입하면 바로 캘린더를 보여준다(응원팀 설정은 선택사항).
 * - 첫 방문(팀 미설정 & 온보딩 미열람)이면 딤 모달로 팀 선택을 유도한다.
 *   고르면 기본 응원팀으로 저장 + 토스트 안내, 스킵하면 미설정으로 둘러본다.
 * - 미설정 상태: 캘린더는 첫 번째 팀 기준으로 보인다.
 * - 시계 기본값은 표준시. 캘린더 예매처 버튼을 누르면 그 예매처 서버시간으로 전환된다.
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

  // 캘린더 예매처 버튼 → 그 예매처 서버시간으로 시계 전환
  const handlePickVendor = (vendor: VendorKey) => setActiveSource(vendor);

  // 오른쪽 그리드에서의 팀 변경 (조용히 반영)
  const handlePickTeam = (teamId: string) => setTeam(teamId);

  // 모달에서의 팀 선택 (기본 응원팀 설정 + 토스트 안내)
  const handlePickTeamFromModal = (teamId: string) => {
    setTeam(teamId);
    markOnboardingSeen();
    setIsModalOpen(false);
    toast.success(`${TEAMS[teamId].name}을 기본 응원팀으로 설정했어요`);
  };

  const handleSkipModal = () => {
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

  return (
    <main className="wrap">
      <div className="clock-row">
        <ServerClock
          activeSource={activeSource}
          onSourceChange={handleSourceChange}
        />
        <TeamPicker currentTeam={team ?? ""} onPick={handlePickTeam} />
      </div>

      {isUnset && (
        <p className="unset-hint">
          응원팀 미설정 · <b>{TEAMS[displayTeamId].name}</b> 기준으로 보고 있어요.
          오른쪽에서 팀을 고르면 기본 응원팀이 됩니다.
        </p>
      )}

      <TeamCalendar teamId={displayTeamId} onPickVendor={handlePickVendor} />

      {isModalOpen && (
        <TeamOnboardingModal
          onPick={handlePickTeamFromModal}
          onSkip={handleSkipModal}
        />
      )}
    </main>
  );
}
