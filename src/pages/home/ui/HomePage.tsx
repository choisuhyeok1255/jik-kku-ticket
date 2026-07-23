"use client";

import { useEffect, useState } from "react";
import { TEAMS, useMyTeam } from "@/entities/team";
import { ServerClock, type ClockSource } from "@/features/server-time";
import { Onboarding, TeamPicker } from "@/features/pick-team";
import { TeamCalendar } from "@/widgets/team-calendar";

/**
 * 메인 화면.
 * - 응원 팀(localStorage)이 없으면 온보딩을, 있으면 개인화 화면을 보여준다.
 * - 개인화 화면 = [서버시계 | 팀 선택 좌우 2단] + [팀 월간 캘린더].
 * - 팀 변경은 별도 화면 없이 서버시계 옆 팀 선택 그리드에서 즉시 이뤄진다.
 * - 내 팀이 정해지면 시계 초기 탭이 그 팀 첫 홈 예매처로 세팅된다.
 * - 캘린더 경기 셀의 예매처 링크로 각 예매 사이트에 바로 이동한다.
 */

export default function HomePage() {
  const { team, loaded, setTeam } = useMyTeam();
  const [activeSource, setActiveSource] = useState<ClockSource>("standard");

  // 내 팀이 정해지면 시계 초기 탭을 그 팀 첫 홈 예매처로 맞춘다
  useEffect(() => {
    const initClockToHomeVendor = () => {
      if (team) setActiveSource(TEAMS[team].vendors[0].key);
    };
    initClockToHomeVendor();
  }, [team]);

  const handleSourceChange = (source: ClockSource) => setActiveSource(source);
  const handlePickTeam = (teamId: string) => setTeam(teamId);

  if (!loaded) {
    return (
      <main className="wrap">
        <p className="loading-line">불러오는 중…</p>
      </main>
    );
  }

  if (!team) {
    return <Onboarding onPick={handlePickTeam} />;
  }

  return (
    <main className="wrap">
      <div className="clock-row">
        <ServerClock
          activeSource={activeSource}
          onSourceChange={handleSourceChange}
        />
        <TeamPicker currentTeam={team} onPick={handlePickTeam} />
      </div>

      <TeamCalendar teamId={team} />
    </main>
  );
}
