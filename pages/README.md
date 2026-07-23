# 이 폴더는 의도적으로 비어 있습니다 (지우지 마세요)

이 프로젝트는 **Next.js App Router(루트 `app/`)** 를 사용하고, 화면 로직은
**FSD 아키텍처의 `src/pages` 레이어**에 둡니다.

문제는 Next.js가 `pages`라는 폴더명을 **Pages Router 예약 디렉토리**로 자동
인식한다는 점입니다. 그래서 `src/pages`(FSD pages 레이어)를 옛 Pages Router로
오해해 다음 빌드 에러가 발생합니다.

```
`pages` and `app` directories should be under the same folder
```

**해결:** 루트에 이 빈 `pages/` 폴더를 둡니다. 그러면 Next.js의 Pages Router가
루트 `pages/`(라우트 없음)로 고정되고, 루트 `app/`과 같은 폴더(루트)에 위치하게
되어 위 에러가 사라집니다. `src/pages`는 더 이상 라우터로 오인되지 않고 FSD
pages 레이어로만 동작합니다.

- 이 폴더에는 `.js/.jsx/.ts/.tsx` 파일을 두지 마세요(라우트로 잡힙니다).
- 실제 화면은 `src/pages/<슬라이스>` 에 작성하고 `@/pages/...` 로 import합니다.
