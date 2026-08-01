import { DEFAULT_THEME, THEME_STORAGE_KEY } from "../config/theme";

/**
 * 첫 페인트 전에 테마를 확정하는 인라인 스크립트 문자열.
 *
 * React가 붙기를 기다리면 기본 테마로 한 번 그려진 뒤 저장값으로 바뀌어 화면이 번쩍인다.
 * 그래서 `<head>`에서 동기로 실행해 `<html data-theme>`을 미리 박아둔다.
 * 저장값을 읽지 못하는 환경(사생활 보호 모드 등)에서도 기본 테마로 그려지도록 실패를 삼킨다.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY
)});if(t!=="light"&&t!=="dark")t=${JSON.stringify(
  DEFAULT_THEME
)};document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme=${JSON.stringify(
  DEFAULT_THEME
)};}})();`;
