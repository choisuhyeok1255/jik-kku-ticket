import type { CSSProperties } from "react";
import { Team } from "../model/types";

/**
 * 구단 색을 CSS 변수 두 벌(--team-l / --team-d)로 만들어 준다.
 *
 * 밝은 화면과 어두운 화면에서 쓸 색이 다르므로 둘 다 심어두고, 실제로 어느 쪽을 쓸지는
 * `.themed` 규칙(globals.css)이 현재 테마를 보고 고른다. 그래서 이 함수를 쓰는 컴포넌트는
 * 테마를 알 필요가 없고, 테마가 바뀌어도 리렌더가 일어나지 않는다.
 *
 * @param team 색을 가져올 구단. 없으면 빈 값을 주어 기본 인주색이 쓰이게 한다
 */
export function teamColorVars(team?: Team): CSSProperties {
  if (!team) return {};
  return {
    "--team-l": team.color,
    "--team-d": team.colorDark,
  } as CSSProperties;
}
