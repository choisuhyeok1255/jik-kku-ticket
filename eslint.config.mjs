import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

/**
 * FSD 레이어를 위→아래 순서로 나열한 것.
 * 각 레이어는 **자기보다 아래 레이어만** import할 수 있다(허용 정책이 이 순서에서 파생된다).
 * `routes`는 Next.js 라우팅 진입점(루트 `app/`), 나머지는 `src/` 아래 FSD 본체다.
 */
const LAYERS = [
  "routes",
  "app",
  "pages",
  "widgets",
  "features",
  "entities",
  "shared",
];

/**
 * 경계 검사 대상 범위 — 루트를 한 곳에서 관리해 두 설정이 따로 놀지 않게 한다.
 *
 * `files`에만 확장자를 거는 것은 의도적이다. `boundaries/include`는 **의존 대상**까지
 * 덮어야 하므로(css·svg·json 등을 import하면 include 밖으로 나가 오탐이 난다)
 * 확장자를 제한하지 않는다. 두 값을 "통일"하지 말 것.
 */
const FSD_ROOTS = ["app", "src"];
const fsdFiles = FSD_ROOTS.map(
  (root) => `${root}/**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}`,
);
const fsdInclude = FSD_ROOTS.map((root) => `${root}/**/*`);

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
 * `app/**`가 루트 `app/`뿐 아니라 `src/shared/app/` 같은 경로까지 잡아,
 * 그 폴더가 최상위 `routes` 권한을 얻어 의존 방향 검사를 통째로 우회하게 된다.
 *
 * 슬라이스를 쓰는 레이어는 `capture`로 슬라이스명을 뽑아 에러 메시지에 표시한다.
 * (같은 레이어의 다른 슬라이스 import 금지는 아래 정책에서 자기 레이어를 제외하는 것으로 강제된다)
 */
const fsdElements = [
  { type: "routes", pattern: "app/**", partialMatch: false },
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
 * 허용 의존 정책 — `LAYERS` 순서에서 파생한다.
 * 자기 레이어를 허용 목록에서 빼기 때문에 "같은 레이어의 다른 슬라이스 import"도 함께 막힌다.
 * (같은 슬라이스 내부 import는 동일 element라 애초에 검사 대상이 아니다)
 * 최하위 레이어는 내려갈 곳이 없으므로 정책을 만들지 않는다.
 */
const fsdPolicies = LAYERS.flatMap((layer, index) => {
  const lowerLayers = LAYERS.slice(index + 1);
  if (lowerLayers.length === 0) return [];
  return [
    {
      from: { element: { type: layer } },
      allow: { to: { element: { types: { anyOf: lowerLayers } } } },
    },
  ];
});

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
