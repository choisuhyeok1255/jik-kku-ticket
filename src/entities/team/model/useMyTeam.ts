"use client";

import { useEffect, useState } from "react";

/**
 * 응원 팀(My Team)과 온보딩 노출 이력을 localStorage로 관리하는 훅.
 *
 * - team: 저장된 팀 id (없으면 null = 미설정).
 * - hasSeenOnboarding: 팀 선택 모달을 이미 보거나 스킵했는지(재방문 시 재노출 방지).
 * - SSR/첫 렌더에는 localStorage에 접근할 수 없으므로 loaded=false로 시작하고,
 *   클라이언트 마운트 후 값을 읽어 반영한다. (하이드레이션 불일치 방지)
 */

const STORAGE_KEY = "jikku:myTeam";
const ONBOARDING_KEY = "jikku:onboardingSeen";

interface UseMyTeamResult {
  team: string | null; // 저장된 팀 id (없으면 null)
  loaded: boolean; // localStorage를 읽어 반영했는지
  hasSeenOnboarding: boolean; // 팀 선택 모달을 이미 보았는지
  setTeam: (teamId: string) => void;
  clearTeam: () => void;
  markOnboardingSeen: () => void;
}

export function useMyTeam(): UseMyTeamResult {
  const [team, setTeamState] = useState<string | null>(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadSavedState = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setTeamState(saved);
      setHasSeenOnboarding(localStorage.getItem(ONBOARDING_KEY) === "true");
      setLoaded(true);
    };
    loadSavedState();
  }, []);

  const setTeam = (teamId: string) => {
    setTeamState(teamId);
    localStorage.setItem(STORAGE_KEY, teamId);
  };

  const clearTeam = () => {
    setTeamState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const markOnboardingSeen = () => {
    setHasSeenOnboarding(true);
    localStorage.setItem(ONBOARDING_KEY, "true");
  };

  return {
    team,
    loaded,
    hasSeenOnboarding,
    setTeam,
    clearTeam,
    markOnboardingSeen,
  };
}
