import { Zone } from "@/entities/stadium";

/**
 * 구역의 좌석 배치를 만들고, 시간이 흐르며 남이 먼저 채가는 것을 흉내 낸다.
 *
 * 실제 예매창의 함정은 여기에 있다 — 남이 자리를 잡아도 **내 화면은 그대로다.**
 * 빈자리로 보여서 눌렀는데 그제서야 "이미 선택된 좌석"이라는 알림을 받고 시간을 날린다.
 * 그래서 '남이 선점했다(reserved)'와 '내 화면에 팔린 것으로 보인다(taken)'를 따로 둔다.
 */

export interface Seat {
  id: string;
  row: number;
  col: number;
  /** 내 화면에 '판매완료'로 보이는 자리 (회색) */
  taken: boolean;
  /** 남이 이미 잡아갔지만 내 화면에는 아직 빈자리로 보이는 자리 */
  reserved: boolean;
  /** 내가 고른 자리 (남이 채가지 못한다) */
  picked: boolean;
}

/** 실제로 고를 수 있는 자리인지 (화면에 빈자리로 보이고, 남이 선점하지도 않은) */
const isTrulyOpen = (seat: Seat): boolean =>
  !seat.taken && !seat.reserved && !seat.picked;

/** 팔린 자리 중 무작위로 골라 필요한 수만큼 비운다 */
function openMoreSeats(seats: Seat[], shortage: number): void {
  const takenIndexes = seats
    .map((seat, index) => (seat.taken ? index : -1))
    .filter((index) => index >= 0);

  for (let i = 0; i < shortage && takenIndexes.length > 0; i++) {
    const pick = Math.floor(Math.random() * takenIndexes.length);
    seats[takenIndexes[pick]].taken = false;
    takenIndexes.splice(pick, 1);
  }
}

/**
 * 좌석 목록을 생성한다.
 *
 * @param zone 대상 구역 (배치 크기와 매진율을 갖는다)
 * @param requiredSeats 잡아야 하는 매수. 최소 이만큼의 빈자리가 보장된다
 * @returns 행 우선 순서로 나열된 좌석 목록
 */
export function generateSeats(zone: Zone, requiredSeats: number): Seat[] {
  const seats: Seat[] = [];

  for (let row = 0; row < zone.rows; row++) {
    for (let col = 0; col < zone.cols; col++) {
      seats.push({
        id: `${row}-${col}`,
        row,
        col,
        taken: true,
        reserved: false,
        picked: false,
      });
    }
  }

  // 좌석마다 확률로 정하면 구역이 작을 때 빈자리 수가 크게 흔들려(5석~18석) 난이도가 들쭉날쭉해진다.
  // 그래서 매진율이 가리키는 '정확한 수'만큼만 무작위 위치로 비운다.
  const total = zone.rows * zone.cols;
  const openCount = Math.max(
    requiredSeats,
    Math.round(total * (1 - zone.soldOutRate))
  );
  openMoreSeats(seats, openCount);

  return seats;
}

/**
 * 소수점 개수를 확률로 처리한다. 0.4석이면 40% 확률로 1석.
 * 이렇게 해야 빈자리가 적은 구역에서 '최소 1석'에 걸려 순식간에 동나는 일이 없다.
 */
function stochasticCount(exact: number): number {
  return Math.floor(exact) + (Math.random() < exact % 1 ? 1 : 0);
}

/**
 * 다른 사람들이 자리를 채가는 한 순간을 반영한다.
 *
 * 채간 자리는 `reserved`로만 표시하고 화면 표시(`taken`)는 건드리지 않는다.
 * 즉 눈으로는 여전히 빈자리로 보이고, 눌러봐야 이미 나간 자리임을 알게 된다.
 *
 * 남는 자리를 따로 보장하지 않는다 — 꾸물거리면 결국 다 나가 예매에 실패한다.
 * 내가 이미 고른 자리만은 건드리지 않는다(선택하면 잠시 선점되기 때문).
 *
 * @param seats 현재 좌석 배치
 * @param perTick 이번에 나갈 좌석 수. 소수여도 되며 확률로 처리된다
 * @returns 일부가 선점된 새 좌석 배치. 더 채갈 자리가 없으면 원본을 그대로 돌려준다
 */
export function reserveSomeSeats(seats: Seat[], perTick: number): Seat[] {
  const available = seats.filter(isTrulyOpen);
  if (available.length === 0) return seats;

  const count = Math.min(available.length, stochasticCount(perTick));
  if (count === 0) return seats;

  const reservedIds = new Set<string>();
  const pool = [...available];
  for (let i = 0; i < count; i++) {
    const pick = Math.floor(Math.random() * pool.length);
    reservedIds.add(pool[pick].id);
    pool.splice(pick, 1);
  }

  return seats.map((seat) =>
    reservedIds.has(seat.id) ? { ...seat, reserved: true } : seat
  );
}

/** 지금 고를 수 있는 자리 수 (화면에 빈자리로 보이고 남이 선점하지도 않은) */
export const countSelectable = (seats: Seat[]): number =>
  seats.filter(isTrulyOpen).length;
