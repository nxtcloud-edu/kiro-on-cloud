"use client";

import { useState } from "react";

// ─────────────────────────────────────────────
// [1-Tier] 화면(이 파일)과 API(app/api/text/route.js)와 데이터가
//   모두 하나의 Next.js 앱 = EC2 한 대에서 돈다. 프론트/백이 한 프로젝트.
//   화면은 "같은 앱"의 /api/text 를 부른다 (같은 출처라 주소도 필요 없음).
// ─────────────────────────────────────────────
export default function Page() {
  const [quote, setQuote] = useState("버튼을 눌러 명언을 받아보세요");
  const [text, setText] = useState("");
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("");

  const getQuote = async () => {
    const res = await fetch("/api/text");
    const data = await res.json();
    setQuote(data.text || data.message);
  };

  const addQuote = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, username }),
    });
    const data = await res.json();
    setStatus(data.message || data.error);
    setText("");
    setUsername("");
  };

  return (
    <div className="app">
      <h1>💬 랜덤 명언</h1>
      <p className="badge">1-Tier · Next.js 한 앱 (화면 + API + 데이터)</p>
      <div className="card quote">{quote}</div>
      <button className="btn" onClick={getQuote}>
        명언 받기
      </button>

      <form className="card form" onSubmit={addQuote}>
        <h2>명언 추가</h2>
        <input
          placeholder="명언"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
        <input
          placeholder="누가 한 말인가요?"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <button className="btn" type="submit">
          저장
        </button>
        {status && <p className="status">{status}</p>}
      </form>
    </div>
  );
}
