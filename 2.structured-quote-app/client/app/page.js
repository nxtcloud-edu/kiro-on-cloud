"use client";

import { useCallback, useEffect, useState } from "react";

// ─────────────────────────────────────────────
// [3-Tier · 프레젠테이션] 떼어낸 화면. S3에 정적 호스팅된다.
//   1-Tier와 같은 Next.js지만 API 라우트가 없다 — 데이터를 직접 갖지 않고
//   FastAPI 서버(/api/...)에만 요청한다. 그게 "계층을 나눈다"의 실체.
//
//   SERVER_URL: 화면이 서버를 찾아가는 주소. 빌드할 때 값이 박힌다.
//     예) SERVER_URL="http://<EC2-퍼블릭-IP>:8000" npm run build
// ─────────────────────────────────────────────
const API = process.env.SERVER_URL || "";
const MAX_LENGTH = 60;

export default function Home() {
  const [quote, setQuote] = useState({
    text: "버튼을 눌러 오늘의 문장을 만나보세요",
    author: "",
  });
  const [seq, setSeq] = useState(0); // 명언이 바뀔 때마다 페이드 인
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [text, setText] = useState("");
  const [username, setUsername] = useState("");
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [listOpen, setListOpen] = useState(false);

  // 서버의 /api/texts 가 아직 비어 있어도 화면은 그대로 뜨게 한다
  const loadList = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/texts`);
      const data = await res.json();
      setList(data?.quotes ?? []);
      setTotal(data?.total ?? 0);
    } catch {
      setList([]);
      setTotal(0);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const getQuote = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/text`);
      const data = await res.json();
      if (!data.text) {
        setQuote({ text: data.message, author: "" });
      } else {
        // API는 "명언 by 작성자" 한 줄로 준다 (1-Tier와 같은 응답 형식)
        const i = data.text.lastIndexOf(" by ");
        setQuote(
          i === -1
            ? { text: data.text, author: "" }
            : { text: data.text.slice(0, i), author: data.text.slice(i + 4) },
        );
      }
      setSeq((n) => n + 1);
    } finally {
      setLoading(false);
    }
  };

  const addQuote = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, username }),
      });
      const data = await res.json();
      setToast(data.message || data.error);
      setText("");
      setUsername("");
      await loadList();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <span className="wordmark">❞ 명언집</span>
          <span className="tier">3-Tier · S3 → FastAPI → MySQL</span>
        </div>
      </header>

      <main className="app">
        <h1>오늘의 명언</h1>
        <p className="lead">
          마음에 남는 한 문장을 만나고, 나의 문장을 더합니다.
        </p>

        <div className="card quote">
          <div className="quote-body" key={seq}>
            {loading ? (
              <p className="quote-text muted">문장을 고르는 중…</p>
            ) : (
              <>
                <p className="quote-text">{quote.text}</p>
                {quote.author && <p className="quote-author">{quote.author}</p>}
              </>
            )}
          </div>
        </div>

        <div className="actions">
          <button className="btn" onClick={getQuote} disabled={loading}>
            {loading ? "불러오는 중…" : "다른 명언 보기"}
          </button>
          <button
            className="btn ghost"
            onClick={() => setListOpen((open) => !open)}
            aria-expanded={listOpen}
          >
            {listOpen ? "목록 닫기" : `저장된 명언 ${total}`}
          </button>
        </div>

        {listOpen && (
          <section className="card list">
            <h2>저장된 명언 {total}</h2>
            {list.length === 0 ? (
              <p className="list-empty">아직 저장된 명언이 없습니다</p>
            ) : (
              <ul>
                {list.map((q, i) => (
                  <li key={i}>
                    <p className="list-text">{q.text}</p>
                    <p className="list-author">{q.username}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <form className="card form" onSubmit={addQuote}>
          <h2>명언 추가</h2>

          <label className="field">
            <span className="field-label">
              명언
              <em>
                {text.length}/{MAX_LENGTH}
              </em>
            </span>
            <input
              placeholder="마음에 남은 문장을 적어주세요"
              value={text}
              maxLength={MAX_LENGTH}
              onChange={(e) => setText(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">작성자</span>
            <input
              placeholder="누가 한 말인가요?"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>

          <button className="btn" type="submit" disabled={saving}>
            {saving ? "저장 중…" : "저장"}
          </button>
        </form>
      </main>

      <footer className="site-footer">© 2026 명언집 · KIRO on Cloud</footer>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
