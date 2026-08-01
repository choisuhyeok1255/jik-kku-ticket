import { CAPTCHA_CHARS, CAPTCHA_LENGTH } from "../config/practice";

/**
 * 보안문자(캡차) 생성 유틸.
 * 실제 예매의 마지막 관문을 흉내 내기 위해, 글자를 뽑고 캔버스에 비틀어 그린다.
 */

/** 보안문자로 쓸 무작위 문자열을 만든다. */
export function generateCaptchaText(length = CAPTCHA_LENGTH): string {
  let text = "";
  for (let i = 0; i < length; i++) {
    text += CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)];
  }
  return text;
}

/**
 * 보안문자를 캔버스에 그린다.
 * 글자마다 기울기·위치·색을 흔들고 잡선과 점을 얹어, 눈으로 읽는 부담을 실제와 비슷하게 만든다.
 *
 * @param canvas 그릴 대상 캔버스
 * @param text 그려 넣을 보안문자
 */
export function drawCaptcha(canvas: HTMLCanvasElement, text: string): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#f2f2f2";
  ctx.fillRect(0, 0, width, height);

  // 배경 잡선
  for (let i = 0; i < 6; i++) {
    ctx.strokeStyle = `hsl(${Math.random() * 360}, 40%, 70%)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.stroke();
  }

  // 글자를 하나씩 기울여 배치
  const step = width / (text.length + 1);
  for (let i = 0; i < text.length; i++) {
    const x = step * (i + 1);
    const y = height / 2 + (Math.random() - 0.5) * height * 0.25;
    const angle = (Math.random() - 0.5) * 0.6;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.font = `bold ${Math.floor(height * 0.55)}px monospace`;
    ctx.fillStyle = `hsl(${Math.random() * 360}, 55%, 30%)`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }

  // 노이즈 점
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = `hsl(${Math.random() * 360}, 40%, 60%)`;
    ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
  }
}
