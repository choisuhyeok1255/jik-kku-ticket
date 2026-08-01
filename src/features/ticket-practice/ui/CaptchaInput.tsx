"use client";

import { useEffect, useRef, useState } from "react";
import { drawCaptcha, generateCaptchaText } from "../lib/generateCaptcha";

/**
 * 보안문자 입력 화면. 구역을 고른 뒤, 좌석 배치도가 열리기 전 관문이다.
 *
 * 캔버스에 글자를 비틀어 그려, 실제 예매의 보안문자처럼 눈으로 읽어 입력하게 한다.
 * 틀리면 새 문자를 다시 뽑는다(실전과 동일). 여기서 지체하면 좋은 자리가 먼저 나간다.
 *
 * 연습용이라 정답을 숨길 이유가 없으므로, 화면을 읽어주는 도구에는 문자를 그대로 전해
 * 눈으로 읽지 않아도 진행할 수 있게 한다. 다만 눈으로 보는 사람에게는 답이 노출되지 않도록
 * 그 안내는 화면에서 감춘다.
 */

/** 입력 필드가 오류 문구를 가리킬 수 있도록 고정한 id */
const ERROR_MESSAGE_ID = "pr-captcha-error";

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

  /** 읽어주는 도구가 한 글자씩 또렷하게 읽도록 사이를 띄운다 */
  const spokenAnswer = answer.split("").join(" ");

  return (
    <section className="pr-card">
      <h2 className="pr-title">보안문자를 입력하세요</h2>
      <p className="pr-sub">통과해야 좌석 배치도가 열려요. 서두르세요.</p>

      <canvas
        ref={canvasRef}
        width={240}
        height={80}
        className="pr-captcha"
        role="img"
        aria-label={`보안문자 ${spokenAnswer}`}
      />

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
          aria-invalid={isWrong}
          // 나중에 입력으로 돌아와도 "왜 잘못됐는지"를 다시 들을 수 있게 오류 문구와 묶는다
          aria-errormessage={ERROR_MESSAGE_ID}
        />
        <button type="submit" className="pr-captcha-submit">
          확인
        </button>
      </form>

      {/* 틀리면 문자가 새로 바뀌므로, 화면을 못 보는 사용자에게도 그 사실과 새 문자를 알린다.
          이 자리는 항상 두고 내용만 바꾼다 — 요소를 지웠다 넣는 방식은 읽어주는 도구가
          놓치기 쉽고, 오류 표시가 나타났다 사라질 때 화면도 흔들린다.
          새 문자는 눈으로 읽는 사람에게 답이 되므로 화면에서는 감춘다 */}
      <p className="pr-captcha-error" role="alert" id={ERROR_MESSAGE_ID}>
        {isWrong && (
          <>
            틀렸어요. 새 보안문자로 바뀌었어요.
            <span className="sr-only">
              {" "}
              새 보안문자는 {spokenAnswer}입니다.
            </span>
          </>
        )}
      </p>

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
