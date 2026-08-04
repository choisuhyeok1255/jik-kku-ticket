import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * OG 이미지(공유 썸네일)에 쓸 본문 폰트를 읽어온다.
 *
 * 저장소 안의 파일을 읽는다. 예전에는 Google Fonts에서 받아 썼는데, OG 이미지는 빌드 시점에
 * 한 번 만들어져 캐시되므로 그때 네트워크가 한 번만 막혀도 **한글이 통째로 빠진 썸네일**이
 * 배포본에 그대로 굳어버렸다(재배포 전까지 복구되지 않는다). 로컬 파일이면 그 위험이 없고,
 * 화면 본문과 같은 글꼴이라 공유 카드와 실제 사이트의 인상도 맞는다.
 *
 * satori(OG 이미지 렌더러)는 woff는 읽지만 woff2는 읽지 못하므로 woff를 쓴다.
 */
export async function loadOgFont(): Promise<ArrayBuffer> {
  const path = join(process.cwd(), "public/fonts/LaundryGothic-Bold.woff");
  const file = await readFile(path);
  return Uint8Array.from(file).buffer;
}

/** OG 이미지에서 폰트를 부를 이름 (ImageResponse의 fonts와 style.fontFamily가 공유한다) */
export const OG_FONT_FAMILY = "LaundryGothic";
