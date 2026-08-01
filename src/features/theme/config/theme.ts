/**
 * 화면 밝기 테마의 상수.
 * 값이 localStorage 키와 `<html data-theme>` 속성으로 그대로 나가므로 한 곳에서 관리한다.
 */

export const THEME_STORAGE_KEY = "jikku:theme";

export const THEMES = ["light", "dark"] as const;

export type Theme = (typeof THEMES)[number];

/** 저장된 값이 없을 때의 기본 — 예매 오픈은 대개 밤이라 어두운 화면에서 시작한다 */
export const DEFAULT_THEME: Theme = "dark";
