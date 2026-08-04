import { Team } from "@/entities/team";
import { VENDORS, Vendor } from "@/entities/vendor";

/**
 * 구단의 예매처 목록을 화면이 바로 쓸 수 있는 형태로 풀어준다.
 *
 * 같은 정보를 캘린더(경기 칸의 작은 버튼)와 예매처 목록(구단별 한 줄)이 서로 다르게 그리는데,
 * "예매 링크가 있나 / 시계를 전환할 수 있나" 같은 판단까지 각자 하면 정책이 갈라진다.
 * 실제로 한쪽은 짧은 이름을, 다른 쪽은 정식 이름을 쓰는 식으로 이미 어긋난 적이 있다.
 * 그래서 판단만 여기 모으고, 어떻게 보여줄지는 각 화면이 정한다.
 *
 * 구단(team)과 예매처(vendor) 두 엔티티를 엮는 코드라 어느 한쪽 엔티티에 둘 수 없다
 * (같은 레이어의 다른 슬라이스는 서로 가져올 수 없다). 그 둘을 조합해 "예매처로 나간다"는
 * 하나의 행동을 만드는 것이 이 기능의 몫이므로 features에 둔다.
 */

export interface TeamVendorLink {
  vendor: Vendor;
  /** 구단 전용 예매 페이지. 아직 없는 예매처는 undefined */
  bookingUrl?: string;
  /**
   * 이 예매처를 누를 때 시계를 그 예매처 서버시간으로 바꿀 수 있는지.
   * 서버시간을 관측할 수 없는 예매처(Date 헤더 미제공)는 바꿀 것이 없다.
   */
  canSwitchClock: boolean;
}

export function getTeamVendorLinks(team: Team): TeamVendorLink[] {
  return team.vendors.map((teamVendor) => {
    const vendor = VENDORS[teamVendor.key];
    return {
      vendor,
      bookingUrl: teamVendor.bookingUrl || undefined,
      canSwitchClock: !vendor.noClock,
    };
  });
}
