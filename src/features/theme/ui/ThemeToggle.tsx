"use client";

import { useTheme } from "../model/useTheme";

/**
 * 밝은 화면 ↔ 어두운 화면 전환 버튼.
 * - 헤더에 놓여 어느 페이지에서나 같은 자리에 있는다.
 * - 저장값을 읽기 전에는 상태를 단정할 수 없으므로, 그동안 스크린리더에 눌림 상태를 알리지 않는다.
 */
export default function ThemeToggle() {
  const { theme, loaded, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-pressed={loaded ? isDark : undefined}
      aria-label={isDark ? "밝은 화면으로 바꾸기" : "어두운 화면으로 바꾸기"}
      title={isDark ? "밝은 화면으로" : "어두운 화면으로"}
    >
      <span aria-hidden="true">{isDark ? "☾" : "☀"}</span>
    </button>
  );
}
