import { Team } from "../model/types";

/**
 * KBO 구단 목록.
 * - vendors: 각 구단 홈경기 예매처 + 그 구단 전용 예매 링크.
 *   (각 구단 예매 페이지 링크 입력 완료)
 */
export const TEAMS: Record<string, Team> = {
  LG: {
    id: "LG",
    name: "LG 트윈스",
    short: "LG",
    color: "#c30452",
    colorDark: "#c30452",
    vendors: [
      {
        key: "ticketlink",
        bookingUrl: "https://www.ticketlink.co.kr/sports/137/59",
      },
    ],
  },
  DOOSAN: {
    id: "DOOSAN",
    name: "두산 베어스",
    short: "두산",
    color: "#131230",
    colorDark: "#5854bf",
    vendors: [
      {
        key: "nol",
        bookingUrl: "https://nol.yanolja.com/ticket/genre/sports/bears",
      },
    ],
  },
  KIWOOM: {
    id: "KIWOOM",
    name: "키움 히어로즈",
    short: "키움",
    color: "#570514",
    colorDark: "#c60b2d",
    vendors: [
      {
        key: "nol",
        bookingUrl: "https://nol.yanolja.com/ticket/genre/sports/heroes",
      },
    ],
  },
  SSG: {
    id: "SSG",
    name: "SSG 랜더스",
    short: "SSG",
    color: "#ce0e2d",
    colorDark: "#ce0e2d",
    vendors: [{ key: "ssg", bookingUrl: "https://ticket.ssg.com/ticket" }],
  },
  KT: {
    id: "KT",
    name: "KT 위즈",
    short: "KT",
    color: "#000000",
    colorDark: "#636363",
    vendors: [
      {
        key: "ticketlink",
        bookingUrl: "https://www.ticketlink.co.kr/sports/137/62",
      },
    ],
  },
  KIA: {
    id: "KIA",
    name: "KIA 타이거즈",
    short: "KIA",
    color: "#ea0029",
    colorDark: "#ea0029",
    vendors: [
      {
        key: "ticketlink",
        bookingUrl: "https://www.ticketlink.co.kr/sports/137/58",
      },
    ],
  },
  SAMSUNG: {
    id: "SAMSUNG",
    name: "삼성 라이온즈",
    short: "삼성",
    color: "#074ca1",
    colorDark: "#095ec8",
    vendors: [
      {
        key: "ticketlink",
        bookingUrl: "https://www.ticketlink.co.kr/sports/137/57",
      },
    ],
  },
  LOTTE: {
    id: "LOTTE",
    name: "롯데 자이언츠",
    short: "롯데",
    color: "#041e42",
    colorDark: "#0c5dcd",
    vendors: [{ key: "lotte", bookingUrl: "https://www.giantsclub.com/" }],
  },
  HANWHA: {
    id: "HANWHA",
    name: "한화 이글스",
    short: "한화",
    color: "#fc4e00",
    colorDark: "#fc4e00",
    vendors: [
      {
        key: "ticketlink",
        bookingUrl: "https://www.ticketlink.co.kr/sports/137/63",
      },
      {
        key: "hanwha",
        bookingUrl: "https://www.hanwhaeagles.co.kr/ticketInfo.do",
      },
    ],
  },
  NC: {
    id: "NC",
    name: "NC 다이노스",
    short: "NC",
    color: "#315288",
    colorDark: "#3a62a2",
    vendors: [{ key: "nc", bookingUrl: "https://www.ncdinos.com/" }],
  },
};

/** 팀 목록(배열) — 온보딩 등에서 순회용. */
export const TEAM_LIST: Team[] = Object.values(TEAMS);
