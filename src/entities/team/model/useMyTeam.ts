"use client";

import { useEffect, useState } from "react";

/**
 * 응원 팀(My Team)을 localStorage에 저장/조회하는 훅.
 *
 * - 저장된 팀 id를 반환하고, 변경 시 localStorage에 영속화한다.
 * - SSR/첫 렌더에는 localStorage에 접근할 수 없으므로 loaded=false로 시작하고,
 *   클라이언트 마운트 후 값을 읽어 반영한다. (하이드레이션 불일치 방지)
 */

const STORAGE_KEY = "jikku:myTeam";

interface UseMyTeamResult {
  team: string | null; // 저장된 팀 id (없으면 null)
  loaded: boolean; // localStorage를 읽어 반영했는지
  setTeam: (teamId: string) => void;
  clearTeam: () => void;
}

export function useMyTeam(): UseMyTeamResult {
  const [team, setTeamState] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadSavedTeam = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setTeamState(saved);
      setLoaded(true);
    };
    loadSavedTeam();
  }, []);

  const setTeam = (teamId: string) => {
    setTeamState(teamId);
    localStorage.setItem(STORAGE_KEY, teamId);
  };

  const clearTeam = () => {
    setTeamState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { team, loaded, setTeam, clearTeam };
}
