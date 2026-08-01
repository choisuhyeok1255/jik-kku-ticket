import Link from "next/link";
import { JIKKKU_HOME_URL } from "@/shared/config/site";

/**
 * 상단 링크 바.
 * - 이 앱이 "직꾸의 KBO 예매 도우미"임을 알리고, 직꾸 본체 웹으로 잇는다.
 * - 브랜드 영역을 홈 링크로 삼고, 티켓팅 연습 페이지로 가는 길을 함께 둔다.
 * - 눈에 잘 띄도록 화면 최상단에 배치한다.
 */
export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="sf-brand" href="/">
        <b>직꾸 티켓</b>
        <span>직꾸의 KBO 예매 도우미</span>
      </Link>
      <nav className="sf-links">
        <Link className="sf-link" href="/practice">
          포도알 연습
        </Link>
        <a
          className="sf-link home"
          href={JIKKKU_HOME_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          직꾸 홈
        </a>
      </nav>
    </header>
  );
}
