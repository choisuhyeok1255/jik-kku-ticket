import { VendorKey } from "@/shared/config/vendor-keys";
import { Vendor } from "../model/types";

/**
 * 예매처 목록 (구단별 예매 사이트).
 * ⚠️ NC·롯데의 pingUrl(서버시간 관측 도메인)은 추정값이라 확인/수정이 필요합니다.
 *    실제 예매 링크는 구단마다 달라 Team.vendors[].bookingUrl에서 관리합니다.
 */
export const VENDORS: Record<VendorKey, Vendor> = {
  ticketlink: {
    key: "ticketlink",
    name: "티켓링크",
    shortName: "티켓링크",
    pingUrl: "https://www.ticketlink.co.kr",
  },
  nol: {
    key: "nol",
    name: "NOL 티켓",
    shortName: "NOL",
    pingUrl: "https://nol.interpark.com",
  },
  ssg: {
    key: "ssg",
    name: "SSG 티켓",
    shortName: "SSG",
    pingUrl: "https://www.ssg.com",
  },
  nc: {
    key: "nc",
    name: "NC Dinos",
    shortName: "NC",
    pingUrl: "https://www.ncdinos.com", // ⚠️ 추정값 — 확인 필요
  },
  lotte: {
    key: "lotte",
    name: "롯데 자이언츠",
    shortName: "롯데",
    pingUrl: "https://www.giantsclub.com", // ⚠️ 추정값 — 확인 필요
  },
};
