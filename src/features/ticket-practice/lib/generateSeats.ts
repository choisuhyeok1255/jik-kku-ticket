import { Zone } from "@/entities/stadium";

/**
 * 구역의 좌석 배치를 만들고, 시간이 흐르며 남이 먼저 채가는 것을 흉내 낸다.
 *
 * 실제 예매창의 함정은 여기에 있다 — 남이 자리를 잡아도 **내 화면은 그대로다.**
 * 빈자리로 보여서 눌렀는데 그제서야 "이미 선택된 좌석"이라는 알림을 받고 시간을 날린다.
 * 그래서 '남이 선점했다(reserved)'와 '내 화면에 팔린 것으로 보인다(taken)'를 따로 둔다.
 *
 * 좌석은 붙어 있지 않아도 고를 수 있다. 다만 배치를 만들 때 **붙은 자리를 고를 선택지가
 * 최소 하나는 있도록 보장**한다. 무작위로 흩뿌리기만 하면 두 장을 예매하러 들어왔는데
 * 나란한 자리가 한 곳도 없는 판이 나올 수 있기 때문이다.
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

/** 무작위로 n개를 뽑아 돌려준다 (원본은 건드리지 않는다) */
function sample<T>(items: T[], n: number): T[] {
  const pool = [...items];
  const out: T[] = [];
  for (let i = 0; i < n && pool.length > 0; i++) {
    out.push(...pool.splice(Math.floor(Math.random() * pool.length), 1));
  }
  return out;
}

/**
 * 한 줄에 나란히 붙은 자리를 그 자리에서 고를 수 있게 만든다.
 *
 * 이미 팔린 자리든 남이 선점한 자리든 가리지 않고 되돌려, 나란한 선택지가 반드시 생기게 한다.
 */
function carveRun(seats: Seat[], zone: Zone, runLength: number): void {
  const row = Math.floor(Math.random() * zone.rows);
  const startCol = Math.floor(Math.random() * (zone.cols - runLength + 1));

  for (let i = 0; i < runLength; i++) {
    const seat = seats[row * zone.cols + startCol + i];
    seat.taken = false;
    seat.reserved = false;
  }
}

/**
 * 좌석 목록을 생성한다.
 *
 * @param zone 대상 구역 (배치 크기와 매진율을 갖는다)
 * @param requiredSeats 잡아야 하는 매수. 이만큼 나란히 붙은 자리가 최소 한 곳은 보장된다
 *                      (붙은 자리로 잡아야 하는 건 아니고, 고르려면 고를 수 있게 두는 것)
 * @param preTakenRate 열리자마자 이미 남이 잡고 있는 빈자리의 비율 (0~1)
 * @returns 행 우선 순서로 나열된 좌석 목록
 */
export function generateSeats(
  zone: Zone,
  requiredSeats: number,
  preTakenRate = 0
): Seat[] {
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
  sample(seats, openCount).forEach((seat) => {
    seat.taken = false;
  });

  // 화면에는 빈자리로 보이지만 이미 남이 잡은 자리를 미리 깔아둔다
  const open = seats.filter((seat) => !seat.taken);
  sample(open, Math.round(open.length * preTakenRate)).forEach((seat) => {
    seat.reserved = true;
  });

  // 붙어 있는 자리가 하나도 없으면 시작부터 성공이 불가능하므로 한 줄을 뚫어준다
  if (requiredSeats > 1 && !hasAdjacentRun(seats, zone, requiredSeats)) {
    carveRun(seats, zone, requiredSeats);
  }

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

  const reservedIds = new Set(sample(available, count).map((seat) => seat.id));

  return seats.map((seat) =>
    reservedIds.has(seat.id) ? { ...seat, reserved: true } : seat
  );
}

/** 지금 고를 수 있는 자리 수 (화면에 빈자리로 보이고 남이 선점하지도 않은) */
export const countSelectable = (seats: Seat[]): number =>
  seats.filter(isTrulyOpen).length;

/**
 * 한 줄에 `length`개가 나란히 붙어 고를 수 있는 곳이 있는지.
 * 여러 장을 잡아야 할 때 이게 없으면 자리가 남아 있어도 예매를 끝낼 수 없다.
 */
export function hasAdjacentRun(
  seats: Seat[],
  zone: Zone,
  length: number
): boolean {
  if (length <= 1) return countSelectable(seats) >= length;

  for (let row = 0; row < zone.rows; row++) {
    let run = 0;
    for (let col = 0; col < zone.cols; col++) {
      run = isTrulyOpen(seats[row * zone.cols + col]) ? run + 1 : 0;
      if (run >= length) return true;
    }
  }
  return false;
}
