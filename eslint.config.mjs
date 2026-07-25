import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

/**
 * FSD 레이어를 위→아래 순서로 나열한 것.
 * 각 레이어는 **자기보다 아래 레이어만** import할 수 있다(허용 정책이 이 순서에서 파생된다).
 */
const LAYERS = [
  "app",
  "pages",
  "widgets",
  "features",
  "entities",
  "shared",
];

/**
 * 경계 검사 대상은 `src/` 뿐이다.
 *
 * 루트 `app/`은 Next.js가 강제하는 라우팅 규약 폴더(파일 위치가 곧 URL)라 FSD 레이어로
 * 분류할 대상이 아니다. FSD는 프론트엔드 코드 아키텍처이고, 그 본체는 `src/`에 있다.
 * `app/`을 검사에 끌어들이면 표준 FSD에 없는 레이어(routes 등)를 만들어야 한다.
 *
 * **`files`와 `boundaries/include`의 역할이 다르다. 통일하지 말 것.**
 * - `files`: 규칙을 **실행할 파일**. `src/`만 — 루트 `app/`은 검사하지 않는다.
 * - `include`: 의존 **대상**까지 판별할 범위. `app/`도 넣어야 어느 레이어에도 속하지 않는
 *   파일로 인식되어, `src/` → `app/` 역참조(FSD 코드가 라우트를 참조)를
 *   `no-unknown-dependencies`가 막는다. `include`에서 빼면 분석 대상 밖이 되어 그냥 통과한다.
 *   확장자를 제한하지 않는 것도 같은 이유다(css·svg·json 의존이 밖으로 나가면 오탐).
 */
const fsdFiles = ["src/**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}"];
const fsdInclude = ["src/**/*", "app/**/*"];

/**
 * FSD 레이어에 속하지 않지만 존재해야 하는 프레임워크 예약 파일.
 * Next.js는 `src/`를 쓰는 구조에서 proxy·instrumentation을 `src/` 바로 아래에만 둘 수 있는데,
 * 그 위치가 어느 레이어에도 안 맞아 `no-unknown-files`에 걸린다. 검사 대상에서 제외한다.
 */
const frameworkReservedFiles = [
  "src/proxy.*",
  "src/instrumentation.*",
  "src/instrumentation-client.*",
];

/**
 * 레이어별 경로 패턴.
 *
 * `partialMatch: false`가 필수다. 기본값(true)은 경로 **끝부분만** 맞아도 매칭하므로
 * `src/app/**`가 `src/shared/app/` 같은 경로까지 잡아, 그 폴더가 최상위 `app` 권한을 얻어
 * 의존 방향 검사를 통째로 우회하게 된다.
 *
 * 슬라이스를 쓰는 레이어는 `capture`로 슬라이스명을 뽑아 에러 메시지에 표시한다.
 * (같은 레이어의 다른 슬라이스 import 금지는 아래 정책에서 자기 레이어를 제외하는 것으로 강제된다)
 */
const fsdElements = [
  { type: "app", pattern: "src/app/**", partialMatch: false },
  {
    type: "pages",
    pattern: "src/pages/*",
    capture: ["slice"],
    partialMatch: false,
  },
  {
    type: "widgets",
    pattern: "src/widgets/*",
    capture: ["slice"],
    partialMatch: false,
  },
  {
    type: "features",
    pattern: "src/features/*",
    capture: ["slice"],
    partialMatch: false,
  },
  {
    type: "entities",
    pattern: "src/entities/*",
    capture: ["slice"],
    partialMatch: false,
  },
  { type: "shared", pattern: "src/shared/**", partialMatch: false },
];

/**
 * 레이어별 허용 대상 — `LAYERS` 순서에서 그대로 파생한다.
 * 자기 레이어를 허용 목록에서 빼기 때문에 "같은 레이어의 다른 슬라이스 import"도 함께 막힌다.
 * (같은 슬라이스 내부 import는 동일 element라 애초에 검사 대상이 아니다)
 */
const allowedLowerLayers = Object.fromEntries(
  LAYERS.map((layer, index) => [layer, LAYERS.slice(index + 1)]),
);

/**
 * 슬라이스로 나뉘는 레이어 — public API(`index.ts`)로만 접근할 수 있다.
 * `app`·`shared`는 슬라이스가 아니라 세그먼트 구조라(`shared/lib`, `app/providers`)
 * FSD 관례대로 세그먼트 단위 직접 접근을 허용한다.
 */
const SLICE_LAYERS = ["pages", "widgets", "features", "entities"];

/**
 * 슬라이스의 진입점. `index.server.ts`를 함께 두는 것은 서버 전용 로직 때문이다.
 * 서버 코드를 클라이언트용 `index.ts`에 얹으면 브라우저 번들에 딸려 들어가므로,
 * 진입점을 둘로 나눠 public API 규칙과 번들 경계를 동시에 지킨다.
 */
const SLICE_ENTRY_POINTS = ["index.{ts,tsx}", "index.server.{ts,tsx}"];

/**
 * 허용 정책. 내려갈 곳이 없는 최하위 레이어는 정책을 만들지 않는다.
 * 슬라이스 레이어를 향한 의존은 진입점 파일로 좁혀, 안쪽 파일 직접 import를 함께 막는다.
 * (별도 `entry-point` 규칙은 v7에서 deprecated라 여기에 합쳤다)
 */
const fsdPolicies = Object.entries(allowedLowerLayers).flatMap(
  ([layer, lowerLayers]) => {
    const sliceTargets = lowerLayers.filter((l) => SLICE_LAYERS.includes(l));
    const segmentTargets = lowerLayers.filter((l) => !SLICE_LAYERS.includes(l));

    const policies = [];
    if (sliceTargets.length > 0) {
      policies.push({
        from: { element: { type: layer } },
        allow: {
          to: {
            element: {
              types: { anyOf: sliceTargets },
              fileInternalPath: SLICE_ENTRY_POINTS,
            },
          },
        },
      });
    }
    if (segmentTargets.length > 0) {
      policies.push({
        from: { element: { type: layer } },
        allow: { to: { element: { types: { anyOf: segmentTargets } } } },
      });
    }
    return policies;
  },
);

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    name: "fsd/boundaries",
    files: fsdFiles,
    plugins: { boundaries },
    settings: {
      // 패턴은 이 경로 기준 상대경로로 매칭된다. 지정하지 않으면 기본값이 process.cwd()라
      // 하위 디렉토리에서 eslint를 실행할 때(IDE 확장·lint-staged 등) 아무 파일도 매칭되지 않아
      // 경고 없이 검사 전체가 통과해버린다.
      "boundaries/root-path": import.meta.dirname,
      "boundaries/include": fsdInclude,
      "boundaries/ignore": frameworkReservedFiles,
      "boundaries/elements": fsdElements,
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        { default: "disallow", policies: fsdPolicies },
      ],
      // 어느 레이어에도 속하지 않는 파일은 검사를 우회하므로 존재 자체를 막는다.
      "boundaries/no-unknown-files": "error",
      "boundaries/no-unknown-dependencies": "error",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
