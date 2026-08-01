"use client";

import { useEffect, useRef, useState } from "react";
import { drawCaptcha, generateCaptchaText } from "../lib/generateCaptcha";

/**
 * 보안문자 입력 화면. 구역을 고른 뒤, 좌석 배치도가 열리기 전 관문이다.
 *
 * 캔버스에 글자를 비틀어 그려, 실제 예매의 보안문자처럼 눈으로 읽어 입력하게 한다.
 * 틀리면 새 문자를 다시 뽑는다(실전과 동일). 여기서 지체하면 좋은 자리가 먼저 나간다.
 */

interface Props {
  onSolved: () => void;
}

export default function CaptchaInput({ onSolved }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [answer, setAnswer] = useState(generateCaptchaText);
  const [input, setInput] = useState("");
  const [isWrong, setIsWrong] = useState(false);

  // 보안문자가 바뀌면 캔버스에 다시 그린다 (캔버스는 React 밖의 그림판이라 effect로 맞춘다)
  useEffect(() => {
    if (canvasRef.current) drawCaptcha(canvasRef.current, answer);
  }, [answer]);

  /** 새 보안문자를 뽑는다. 그리기는 위 effect가 맡는다. 오답 표시는 건드리지 않는다 */
  const issueNewCaptcha = () => {
    setAnswer(generateCaptchaText());
    setInput("");
  };

  /** 사용자가 직접 새 문자를 요청한 경우 — 오답 표시까지 지운다 */
  const handleRefresh = () => {
    issueNewCaptcha();
    setIsWrong(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim().toUpperCase() === answer) {
      onSolved();
      return;
    }
    // 틀렸으면 새 문자를 주되, 틀렸다는 표시는 남겨둔다
    issueNewCaptcha();
    setIsWrong(true);
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    setIsWrong(false);
  };

  return (
    <section className="pr-card">
      <h2 className="pr-title">보안문자를 입력하세요</h2>
      <p className="pr-sub">통과해야 좌석 배치도가 열려요. 서두르세요.</p>

      <canvas ref={canvasRef} width={240} height={80} className="pr-captcha" />

      <form className="pr-captcha-form" onSubmit={handleSubmit}>
        <input
          className={`pr-captcha-input ${isWrong ? "wrong" : ""}`}
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="보안문자 입력"
          autoFocus
          autoComplete="off"
          spellCheck={false}
          aria-label="보안문자 입력"
        />
        <button type="submit" className="pr-captcha-submit">
          확인
        </button>
      </form>

      {isWrong && (
        <p className="pr-captcha-error">틀렸어요. 다시 입력하세요.</p>
      )}

      <button
        type="button"
        className="pr-captcha-refresh"
        onClick={handleRefresh}
      >
        새로운 보안문자
      </button>
    </section>
  );
}
