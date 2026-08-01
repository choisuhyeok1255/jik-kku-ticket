"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/features/theme";

/**
 * 상단 바. 브랜드와 밝기 전환만 둔다.
 *
 * 부제를 빼고 브랜드만 크게 세운다. 설명은 배너와 본문이 이미 하고 있어,
 * 작은 글씨를 덧대면 상단이 복잡해지기만 한다.
 *
 * 홈으로 가는 길은 **브랜드 하나뿐**이다. 하위 페이지에서는 브랜드 앞에 화살표를 붙여
 * "누르면 돌아간다"를 드러내므로, 본문에 따로 뒤로가기 버튼을 두지 않는다.
 * 현재 위치는 pathname으로 스스로 판단해, 페이지가 아무것도 넘기지 않아도 된다.
 *
 * 연습·직관 기록으로 가는 링크는 여기 두지 않는다. 배너 영역이 그 역할을 하고,
 * 같은 목적지를 두 군데 두면 어느 쪽을 고쳐야 할지 흐려지기 때문이다.
 */
export default function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="site-header">
      <Link
        className={`sf-brand ${isHome ? "" : "back"}`}
        href="/"
        aria-label={isHome ? undefined : "홈으로 돌아가기"}
      >
        {!isHome && (
          <span className="sf-arrow" aria-hidden="true">
            ←
          </span>
        )}
        직꾸 티켓
      </Link>

      <ThemeToggle />
    </header>
  );
}
