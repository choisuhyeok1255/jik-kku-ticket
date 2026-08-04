"use client";

import { useState } from "react";
import { TEAMS, useMyTeam, teamColorVars } from "@/entities/team";
import { SiteHeader } from "@/widgets/site-header";
import { AppPromo } from "@/widgets/app-promo";
import {
  CaptchaInput,
  PracticeSetup,
  ResultSummary,
  SeatBoard,
  SoldOutSummary,
  usePracticeRun,
  useBestRecord,
  ZonePicker,
} from "@/features/ticket-practice";

/**
 * 티켓팅 연습 화면.
 * - 실제 예매 절차대로 단계를 넘긴다: 장수·난이도 선택 → 구역 → 보안문자 → 좌석 → 결과.
 *   (보안문자를 통과해야 좌석 배치도가 열리므로 포도알 고르기가 마지막이다)
 * - 고른 장수를 다 잡으면 성공, 그 전에 자리가 다 나가면 매진 실패로 끝난다.
 * - 재는 것은 오픈 순간의 반응 속도가 아니라 시작 버튼을 누른 뒤의 조작 속도다.
 */

export default function PracticePage() {
  const {
    session,
    result,
    start,
    pickZone,
    passCaptcha,
    pickSeat,
    failSoldOut,
    addMissClick,
    reset,
  } = usePracticeRun();
  const { getBest, submitRecord } = useBestRecord();
  const { team } = useMyTeam();
  const [isNewBest, setIsNewBest] = useState(false);

  // 고른 장수를 다 잡으면 예매 성공 — 그때의 총 소요 시간으로 기록을 갱신한다
  const handleSeatsComplete = () => {
    const finishedAt = pickSeat();
    if (!session || finishedAt === null) return;
    // 화면에 보이는 소요 시간과 같은 값으로 기록한다 (시각을 다시 재지 않는다)
    setIsNewBest(
      submitRecord(session.difficulty, finishedAt - session.marks.startedAt)
    );
  };

  const handleRetry = () => {
    setIsNewBest(false);
    reset();
  };

  // 실제 예매창은 이때 브라우저 alert을 띄운다. 닫는 데 걸리는 시간까지 실전과 같도록 그대로 쓴다
  const handleMissClick = () => {
    addMissClick();
    window.alert("이미 선택된 좌석입니다");
  };

  // 결과·실패 화면이 실제로 그려지는 상태인지.
  // 렌더 조건과 '그만두기' 버튼 조건이 같은 값을 보게 해, 한쪽만 바뀌어 어긋나는 일을 막는다
  const showsResult = session?.phase === "done" && result !== null;
  const showsSummary = showsResult || session?.phase === "soldout";

  return (
    /* 메인과 같은 응원팀 색을 쓴다 — 두 화면을 오가도 같은 서비스로 읽히게 */
    <div
      className="page-layout themed"
      style={teamColorVars(team ? TEAMS[team] : undefined)}
    >
      <main className="wrap">
        <SiteHeader />

        {/* 홈으로 가는 길은 헤더의 브랜드 하나로 모았다.
          아래 '연습 그만두기'는 이 판을 처음으로 되돌릴 뿐 페이지를 벗어나지 않는다 */}
        <div className="pr-intro">
          <h1 className="pr-heading">포도알 연습</h1>
          <p className="pr-lead">
            구역 고르기부터 좌석 잡기까지, 실제 절차 그대로 연습해요.
          </p>
        </div>

        {!session && <PracticeSetup onStart={start} />}

        {session?.phase === "zone" && <ZonePicker onPickZone={pickZone} />}

        {session?.phase === "captcha" && (
          <CaptchaInput onSolved={passCaptcha} />
        )}

        {session?.phase === "seat" && session.zoneId && (
          <SeatBoard
            key={session.zoneId} // 구역이 바뀌면 좌석 배치를 새로 만든다
            zoneId={session.zoneId}
            ticketCount={session.ticketCount}
            difficulty={session.difficulty}
            onComplete={handleSeatsComplete}
            onMissClick={handleMissClick}
            onSoldOut={failSoldOut}
          />
        )}

        {showsResult && (
          <ResultSummary
            result={result}
            ticketCount={session.ticketCount}
            bestMs={getBest(session.difficulty)}
            isNewBest={isNewBest}
            onRetry={handleRetry}
          />
        )}

        {session?.phase === "soldout" && (
          <SoldOutSummary
            ticketCount={session.ticketCount}
            elapsedMs={
              (session.marks.finishedAt ?? 0) - session.marks.startedAt
            }
            missClicks={session.missClicks}
            onRetry={handleRetry}
          />
        )}

        {/* 결과 화면에는 '다시 연습하기'가 있으니 그때만 감춘다.
          끝난 상태인데 결과를 못 그리는 경우에도 빠져나갈 길은 남겨둔다 */}
        {session && !showsSummary && (
          <button type="button" className="pr-quit" onClick={handleRetry}>
            연습 그만두기
          </button>
        )}

        {/* 좁은 화면에서는 본문 맨 아래에 둔다. 메인처럼 위에 올리면 좌석을 다급히
            누르는 동안 화면을 차지하고, 급한 손이 외부 링크를 눌러 연습을 벗어날 수 있다 */}
        <div className="promo-inline promo-tail">
          <AppPromo />
        </div>
      </main>

      {/* 데스크탑: 본문 옆 사이드라 연습을 가리지 않는다 */}
      <aside className="promo-aside">
        <AppPromo />
      </aside>
    </div>
  );
}
