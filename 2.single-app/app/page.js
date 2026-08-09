"use client";

import { useCallback, useEffect, useState } from "react";

// ─────────────────────────────────────────────
// [1-Tier] 화면(이 파일)과 API(app/api/…)와 데이터가
//   모두 하나의 Next.js 앱 = EC2 한 대에서 돈다. 프론트/백이 한 프로젝트.
//   화면은 "같은 앱"의 /api/text 를 부른다 (같은 출처라 주소도 필요 없음).
// ─────────────────────────────────────────────
const MAX_LENGTH = 60;

export default function Page() {
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

  const loadList = useCallback(async () => {
    const res = await fetch("/api/texts");
    const data = await res.json();
    setList(data?.quotes ?? []);
    setTotal(data?.total ?? 0);
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
      const res = await fetch("/api/text");
      const data = await res.json();
      if (!data.text) {
        setQuote({ text: data.message, author: "" });
      } else {
        // API는 "명언 by 작성자" 한 줄로 준다 (3-Tier FastAPI도 같은 형식)
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
      const res = await fetch("/api/text", {
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
          <span className="tier">1-Tier · Next.js 한 앱</span>
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
