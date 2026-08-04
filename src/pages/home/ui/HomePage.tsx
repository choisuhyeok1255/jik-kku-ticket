"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TEAMS, TEAM_LIST, useMyTeam, teamColorVars } from "@/entities/team";
import { VendorKey } from "@/shared/config/vendor-keys";
import { ServerClock, type ClockSource } from "@/features/server-time";
import { TeamOnboardingModal } from "@/features/pick-team";
import { TeamCalendar } from "@/widgets/team-calendar";
import { VendorDirectory } from "@/widgets/vendor-directory";
import { SiteHeader } from "@/widgets/site-header";
import { AppPromo } from "@/widgets/app-promo";
import { PracticePromo } from "@/widgets/practice-promo";

/**
 * 메인 화면.
 * - 진입하면 바로 캘린더를 보여준다(응원팀 설정은 선택사항).
 * - 첫 방문(팀 미설정 & 온보딩 미열람)이면 딤 모달로 팀 선택을 유도한다.
 * - 팀 변경은 캘린더 헤더의 버튼으로 열고, 같은 모달을 재사용한다(변경 모드).
 * - 서버시계는 전폭, 기본값은 표준시. 캘린더 예매처 버튼으로 예매처 시계로 전환.
 *
 * 응원팀에 따라 달라지는 것(캘린더)만 저장값을 읽은 뒤에 그리고, 팀과 무관한 것(서버시계)은
 * 기다리지 않고 바로 그린다. 검색·AI 크롤러는 브라우저에서 저장값을 읽기 전의 HTML을 보고
 * 가는데, 그때 화면이 통째로 비어 있으면 이 사이트가 무엇을 하는 곳인지 알 수 없기 때문이다.
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
    /* 응원팀 색을 화면 전체에 흘려보낸다. 점·밑줄·좌석 같은 곳이 이 값을 받아 쓴다 */
    <div
      className="page-layout themed"
      style={teamColorVars(TEAMS[displayTeamId])}
    >
      <main className="wrap">
        <SiteHeader />

        {/* 문서의 제목. 화면에는 헤더 브랜드와 시계가 이미 그 역할을 하고 있어 겹쳐 보이므로,
            눈에는 감추고 검색엔진·읽어주는 도구에만 남긴다 */}
        <h1 className="sr-only">
          KBO 구단별 예매처 바로가기와 예매처 서버시간
        </h1>

        {/* 좁은 화면에서는 사이드가 없어 배너가 갈 데가 없다. 본문 맨 아래로 내리면
            스크롤을 끝까지 해야 닿으므로, 헤더 바로 아래로 올려 첫 화면에 둔다 */}
        <div className="promo-inline">
          <PracticePromo />
          <AppPromo />
        </div>

        {/* 시계는 응원팀과 무관하므로 저장값을 기다리지 않는다 */}
        <ServerClock
          activeSource={activeSource}
          onSourceChange={handleSourceChange}
        />

        {/* 캘린더는 어느 팀 경기를 보여줄지가 저장값에 달려 있어 읽은 뒤에 그린다.
            읽는 동안에도 자리를 비워두지 않아야 로드되는 순간 본문이 튀지 않는다 */}
        {!loaded && <p className="loading-line">불러오는 중…</p>}

        {loaded && (
          <TeamCalendar
            teamId={displayTeamId}
            onPickVendor={handlePickVendor}
            onChangeTeam={() => setIsModalOpen(true)}
            isUnset={isUnset}
          />
        )}

        {/* 캘린더가 "언제"를 답한다면 이 목록은 "어디서"를 답한다.
            날짜와 무관하게 예매처만 찾아 들어온 사람의 출구이자,
            저장값을 못 읽는 크롤러에게 이 사이트의 내용을 보여주는 유일한 본문이기도 하다 */}
        <VendorDirectory onPickVendor={handlePickVendor} />
      </main>

      {/* 데스크탑: 배너를 콘텐츠 옆 사이드에 고정한다 */}
      <aside className="promo-aside">
        <PracticePromo />
        <AppPromo />
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
