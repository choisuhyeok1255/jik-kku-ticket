"use client";

import { TEAM_LIST } from "@/entities/team";
import { getTeamVendorLinks } from "@/features/pick-vendor";
import { VendorKey } from "@/shared/config/vendor-keys";

/**
 * 구단별 예매처 바로가기 목록.
 *
 * 저장된 응원팀과 무관한 고정 정보(구단 ↔ 예매처 ↔ 예매 링크)만 다뤄, 아무것도 기다리지 않고
 * 바로 그려진다. 그래서 브라우저가 켜지기 전의 HTML에도 그대로 담긴다 —
 * 위쪽 캘린더는 저장된 응원팀을 읽어야 그려지는 탓에 검색·AI 크롤러 눈에는 비어 보이는데,
 * 이 사이트가 "구단별 예매처 바로가기"를 제공한다는 사실이 문서에서 통째로 빠지지 않게 한다.
 *
 * 캘린더와 겹치는 정보지만 쓰임이 다르다 — 캘린더는 "언제 경기가 있나"를,
 * 이 목록은 "우리 팀 예매는 어디서 하나"를 답한다. 날짜를 모르고 들어온 사람도 바로 갈 수 있다.
 * 대신 캘린더와 **같은 동작**을 준다 — 예매처로 나가면서 시계도 그 서버시간으로 바꾼다.
 * 이 사이트의 쓸모가 거기 있는데 한쪽에서만 되면 어디로 눌렀는지에 따라 결과가 달라진다.
 */

interface Props {
  onPickVendor: (vendor: VendorKey) => void;
}

export default function VendorDirectory({ onPickVendor }: Props) {
  return (
    <section className="vendor-dir">
      <h2 className="vendor-dir-title">구단별 예매처</h2>
      <ul className="vendor-dir-list">
        {TEAM_LIST.map((team) => (
          <li key={team.id} className="vendor-dir-row">
            <span className="vendor-dir-team">{team.name}</span>
            <span className="vendor-dir-links">
              {getTeamVendorLinks(team).map(
                ({ vendor, bookingUrl, canSwitchClock }) => {
                  if (!bookingUrl) {
                    return (
                      <span key={vendor.key} className="vendor-dir-plain">
                        {vendor.name}
                      </span>
                    );
                  }
                  return (
                    <a
                      key={vendor.key}
                      className="vendor-dir-link"
                      href={bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      // 링크만 훑는 사람에게는 "티켓링크"가 여러 번 반복될 뿐이라
                      // 어느 구단 예매인지 이름 자체에 담는다
                      aria-label={`${team.name} ${vendor.name} 예매 (새 탭에서 열림)`}
                      onClick={
                        canSwitchClock
                          ? () => onPickVendor(vendor.key)
                          : undefined
                      }
                    >
                      {vendor.name}
                    </a>
                  );
                }
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
