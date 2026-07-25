# 0002. FSD 규칙을 eslint로 강제하고 검사 범위를 src로 한정한다

## 상태
승인됨 · 2026-07-26

## 배경
FSD 폴더 구조를 쓰지만 규칙 준수 여부를 사람 눈으로만 확인해왔다.
레이어를 거슬러 import하거나 슬라이스 안쪽 파일을 직접 가져와도 아무도 막지 않는다.
한편 Next.js App Router 때문에 루트 `app/`이라는 프레임워크 전용 폴더가 있어,
"어디까지를 FSD로 볼 것인가"를 먼저 정해야 했다.

## 결정
`eslint-plugin-boundaries`로 아래를 강제한다.

- 의존 방향: `app → pages → widgets → features → entities → shared` (위→아래만)
- 같은 레이어의 다른 슬라이스 직접 import 금지
- 슬라이스는 public API(`index.ts` / `index.server.ts`)로만 접근
- 어느 레이어에도 속하지 않는 파일은 만들 수 없음

**검사 범위는 `src/`로 한정한다.** 루트 `app/`은 Next.js가 강제하는 라우팅 규약 폴더
(파일 위치가 곧 URL)라 FSD 레이어로 분류할 대상이 아니다. 단 `boundaries/include`에는
`app/`을 포함시켜 `src/` → `app/` 역참조는 막는다.

서버 전용 로직은 `index.server.ts`를 따로 두어 public API 규칙과 번들 경계를 함께 지킨다.

## 고려했으나 안 한 것
- **루트 `app/`까지 레이어로 분류** → `routes`·`api-routes`처럼 표준 FSD에 없는 개념을
  만들어야 한다. UI 라우트(화면)와 API 라우트(서버 엔드포인트)는 성격이 달라 규칙이
  갈라지고, 프레임워크가 바뀔 때마다 예외가 늘어난다
- **`boundaries/include`까지 `src/`로 좁히기** → `app/`이 분석 대상 밖이 되어
  `src/` → `app/` 역참조가 그냥 통과한다 (실측으로 확인)
- **서버 함수를 클라이언트용 `index.ts`에 함께 노출** → 브라우저 번들에 서버 코드가 딸려간다
- **그 한 줄만 `eslint-disable`** → 예외가 코드에 흩어져 관리되지 않는다
- **별도 `entry-point` 규칙 사용** → v7에서 deprecated라 `dependencies` 정책에 합쳤다

## 결과
- 좋아진 점: 구조 위반이 리뷰 전에 lint에서 걸린다. 레이어 정의가 `fsd-architecture.md`의
  표와 정확히 일치해 억지 개념이 없다
- 나빠진 점: 새 슬라이스마다 `index.ts`가 반드시 필요하고, `src/` 바로 아래에 임의 파일을
  둘 수 없다. 루트 `app/` 내부는 규칙이 없어 라우트가 두꺼워져도 lint가 잡지 못한다
- 파생: Next.js 예약 파일(`src/proxy.*`, `src/instrumentation*.*`)은 어느 레이어에도 맞지
  않아 예외 목록으로 관리한다
- 함정: 플러그인 기본값 두 개가 검사를 조용히 무력화한다. `partialMatch`(경로 끝만 매칭)와
  `root-path`(기본값이 `process.cwd()`). 둘 다 명시적으로 지정해야 한다
