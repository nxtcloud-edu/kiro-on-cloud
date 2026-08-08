import { useState } from "react";

// ─────────────────────────────────────────────
// [3-Tier · 프레젠테이션] 떼어낸 순수 화면(React). S3에 정적 호스팅된다.
//   데이터를 직접 갖지 않고 FastAPI 서버(/api/text)에만 요청한다.
//   API 주소:
//     - 로컬 개발: 비움 → "/api" (vite proxy가 localhost:8000으로)
//     - S3 배포:   VITE_API_URL="http://<EC2-퍼블릭-IP>:8000" 로 빌드
// ─────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || "";

export default function App() {
  const [quote, setQuote] = useState("버튼을 눌러 명언을 받아보세요");
  const [text, setText] = useState("");
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("");

  const getQuote = async () => {
    const res = await fetch(`${API}/api/text`);
    const data = await res.json();
    setQuote(data.text || data.message);
  };

  const addQuote = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/api/text`, {
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
