import { JIKKKU_HOME_URL } from "@/shared/config/site";

/**
 * 상단 링크 바.
 * - 이 앱이 "직꾸의 KBO 예매 도우미"임을 알리고, 직꾸 본체 웹과 앱 다운로드로 잇는다.
 * - 눈에 잘 띄도록 화면 최상단에 배치한다.
 */
export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="sf-brand">
        <b>직꾸 티켓</b>
        <span>직꾸의 KBO 예매 도우미</span>
      </div>
      <nav className="sf-links">
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
