"use client";

import { useEffect, useState } from "react";
import { DEFAULT_THEME, THEME_STORAGE_KEY, Theme } from "../config/theme";

/**
 * 화면 밝기 테마를 읽고 바꾸는 훅.
 *
 * 실제 적용은 `<html data-theme>` 한 곳에서만 일어나고 CSS가 그 값을 보고 색을 고른다.
 * 첫 값은 서버에서 알 수 없으므로 기본값으로 시작한 뒤, 마운트 후 `<html>`에 이미 박혀 있는
 * 값(첫 페인트 전 인라인 스크립트가 넣어둔 것)을 읽어 맞춘다. 그래서 하이드레이션이 어긋나지 않는다.
 */

interface UseThemeResult {
  theme: Theme;
  /** 저장된 값을 읽어 반영했는지. 읽기 전에는 토글 상태를 단정하지 않는다 */
  loaded: boolean;
  toggleTheme: () => void;
}

const isTheme = (value: unknown): value is Theme =>
  value === "light" || value === "dark";

export function useTheme(): UseThemeResult {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const syncFromDocument = () => {
      const applied = document.documentElement.dataset.theme;
      if (isTheme(applied)) setTheme(applied);
      setLoaded(true);
    };
    syncFromDocument();
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // 저장에 실패해도 이번 방문 동안은 바뀐 테마로 볼 수 있다
    }
  };

  return { theme, loaded, toggleTheme };
}
