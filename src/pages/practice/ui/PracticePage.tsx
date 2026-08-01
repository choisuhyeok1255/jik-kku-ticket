"use client";

import { useState } from "react";
import { SiteHeader } from "@/widgets/site-header";
import {
  CaptchaInput,
  ResultSummary,
  SeatBoard,
  SoldOutSummary,
  usePracticeRun,
  useBestRecord,
  VendorPicker,
  WaitingRoom,
  ZonePicker,
} from "@/features/ticket-practice";

/**
 * 티켓팅 연습 화면.
 * - 실제 예매 절차대로 단계를 넘긴다: 예매처·장수 선택 → 오픈 대기 → 구역 → 보안문자 → 좌석 → 결과.
 *   (보안문자를 통과해야 좌석 배치도가 열리므로 포도알 고르기가 마지막이다)
 * - 고른 장수를 다 잡으면 성공, 그 전에 자리가 다 나가면 매진 실패로 끝난다.
 * - 진행 상태는 훅이 sessionStorage에 들고 있어, 티켓링크 연습에서 새로고침해도 이어진다.
 */

export default function PracticePage() {
  const {
    loaded,
    pageLoadedAt,
    session,
    result,
    start,
    enter,
    pickZone,
    passCaptcha,
    pickSeat,
    failSoldOut,
    addMissClick,
    reset,
  } = usePracticeRun();
  const { best, submitRecord } = useBestRecord();
  const [isNewBest, setIsNewBest] = useState(false);

  // 난이도가 다르면 기록을 견줄 수 없으므로 예매처·난이도별로 따로 남긴다
  const recordKey = session ? `${session.vendor}:${session.difficulty}` : "";

  // 고른 장수를 다 잡으면 예매 성공 — 그때의 총 소요 시간으로 기록을 갱신한다
  const handleSeatsComplete = () => {
    const finishedAt = pickSeat();
    if (!session || finishedAt === null) return;
    // 화면에 보이는 소요 시간과 같은 값으로 기록한다 (시각을 다시 재지 않는다)
    setIsNewBest(submitRecord(recordKey, finishedAt - session.marks.openAt));
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

  const isFinished = session?.phase === "done" || session?.phase === "soldout";

  return (
    <main className="wrap">
      <SiteHeader />

      <div className="pr-intro">
        <h1 className="pr-heading">포도알 연습</h1>
        <p className="pr-lead">
          예매 오픈부터 좌석 잡기까지, 실제 절차 그대로 연습해요.
        </p>
      </div>

      {/* 이전 연습을 이어받을지 확인하는 동안에는 화면 골격만 유지한다 (헤더가 늦게 끼어들지 않도록) */}
      {!loaded && <p className="loading-line">불러오는 중…</p>}

      {loaded && !session && <VendorPicker onStart={start} />}

      {session?.phase === "waiting" && (
        <WaitingRoom
          vendor={session.vendor}
          openAt={session.marks.openAt}
          pageLoadedAt={pageLoadedAt}
          ticketCount={session.ticketCount}
          difficulty={session.difficulty}
          onEnter={enter}
        />
      )}

      {session?.phase === "zone" && <ZonePicker onPickZone={pickZone} />}

      {session?.phase === "captcha" && <CaptchaInput onSolved={passCaptcha} />}

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

      {session?.phase === "done" && result && (
        <ResultSummary
          vendor={session.vendor}
          result={result}
          ticketCount={session.ticketCount}
          bestMs={best[recordKey]}
          isNewBest={isNewBest}
          onRetry={handleRetry}
        />
      )}

      {session?.phase === "soldout" && (
        <SoldOutSummary
          ticketCount={session.ticketCount}
          elapsedMs={(session.marks.finishedAt ?? 0) - session.marks.openAt}
          missClicks={session.missClicks}
          onRetry={handleRetry}
        />
      )}

      {session && !isFinished && (
        <button type="button" className="pr-quit" onClick={handleRetry}>
          연습 그만두기
        </button>
      )}
    </main>
  );
}
