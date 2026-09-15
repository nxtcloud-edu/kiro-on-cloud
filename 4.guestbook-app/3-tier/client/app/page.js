// ─────────────────────────────────────────────
// [3-Tier · 화면] 1-Tier의 page.js와 **보이는 건 똑같다**. 딱 하나가 다르다.
//   fetch 주소 앞에 `${API}` 가 붙는다.
//   화면은 S3에, 서버는 EC2에 있으니 이제 서로의 주소를 알아야 하기 때문이다.
//   그 주소는 빌드할 때 SERVER_URL 로 박힌다 (next.config.js 참고).
// ─────────────────────────────────────────────
"use client";

import { useEffect, useState } from "react";

// 빌드 시점에 박히는 서버 주소. 비어 있으면 요청이 S3 자기 자신으로 날아간다.
const API = process.env.SERVER_URL || "";

// 손님이 고를 수 있는 꾸미기 스티커. 서버(main.py)도 같은 목록으로 검사한다.
const STICKERS = ["☕", "🍰", "🍜", "🔥", "💛", "✨"];

export default function Home() {
  const [shop, setShop] = useState({ name: "방명록", notice: "" });
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [sticker, setSticker] = useState("☕");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  async function loadShop() {
    try {
      const res = await fetch(`${API}/api/shop`);
      if (res.ok) setShop(await res.json());
    } catch {
      // 서버가 아직 없어도 화면은 떠야 한다 (그래야 "화면만 올라간 상태"가 보인다)
    }
  }

  async function loadEntries() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/entries`);
      const data = await res.json();
      setEntries(data.entries || []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadShop();
    loadEntries();
  }, []);

  function show(text) {
    setToast(text);
    setTimeout(() => setToast(""), 2200);
  }

  async function submit(e) {
    e.preventDefault();
    if (!nickname.trim() || !message.trim()) {
      show("이름과 한마디를 채워주세요");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, message, rating, sticker }),
      });
      if (!res.ok) throw new Error();
      setMessage("");
      await loadEntries();
      show("방명록에 남겼습니다");
    } catch {
      show("남기지 못했습니다");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <span className="wordmark">☕ {shop.name}</span>
          <span className="tier">3-Tier · S3 → FastAPI → MySQL</span>
        </div>
      </header>

      <main className="app">
        <h1>방명록</h1>
        <p className="lead">다녀가셨다면 한 줄 남겨주세요.</p>

        {shop.notice ? (
          <div className="notice">
            <span className="notice-label">주인장 공지</span>
            <p className="notice-text">{shop.notice}</p>
          </div>
        ) : null}

        <form className="card form" onSubmit={submit}>
          <div className="field">
            <label className="field-label" htmlFor="nickname">
              이름
            </label>
            <input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="지나가던손님"
              maxLength={50}
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="message">
              한마디
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="오늘 뭐가 좋았는지 적어주세요"
              rows={3}
            />
          </div>

          <div className="field">
            <span className="field-label">별점</span>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`star${n <= rating ? " on" : ""}`}
                  onClick={() => setRating(n)}
                  aria-label={`별 ${n}개`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="field-label">스티커</span>
            <div className="picker">
              {STICKERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`chip${s === sticker ? " on" : ""}`}
                  onClick={() => setSticker(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="actions">
            <button className="btn" type="submit" disabled={saving}>
              {saving ? "남기는 중…" : "방명록 남기기"}
            </button>
          </div>
        </form>

        <div className="list-head">
          <h2>다녀간 사람들</h2>
          <span className="count">{entries.length}명</span>
        </div>

        {loading ? (
          <p className="list-empty">불러오는 중…</p>
        ) : entries.length === 0 ? (
          <p className="list-empty">아직 아무도 남기지 않았습니다.</p>
        ) : (
          <ul className="list">
            {entries.map((it) => (
              <li className="entry" key={it.id}>
                <span className="entry-sticker">{it.sticker}</span>
                <div className="entry-body">
                  <div className="entry-head">
                    <span className="entry-nick">{it.nickname}</span>
                    <span className="entry-rating">
                      {"★".repeat(it.rating)}
                      <span className="dim">{"★".repeat(5 - it.rating)}</span>
                    </span>
                  </div>
                  <p className="entry-msg">{it.message}</p>
                  {it.reply ? (
                    <div className="entry-reply">
                      <span className="reply-label">주인장</span>
                      {it.reply}
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="site-footer">© 2026 {shop.name} · KIRO on Cloud</footer>

      {toast ? <div className="toast">{toast}</div> : null}
    </>
  );
}
