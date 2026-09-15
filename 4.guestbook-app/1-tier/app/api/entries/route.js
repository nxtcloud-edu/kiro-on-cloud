// ─────────────────────────────────────────────
// [1-Tier · 백엔드] 방명록 조회(GET) · 작성(POST).
//   화면(app/page.js)과 이 API가 **같은 프로젝트·같은 프로세스**에 있다.
//   그래서 화면은 서버 주소를 몰라도 된다 — `/api/entries` 상대경로면 끝이다.
//   (3-Tier로 쪼개면 이 편의가 사라진다. 그게 분리의 대가다)
// ─────────────────────────────────────────────
import { pool } from "../db";

// GET 요청이 정적으로 캐시되지 않도록 (새로고침하면 방금 남긴 글이 보여야 한다)
export const dynamic = "force-dynamic";

// 꾸미기 스티커는 목록에 있는 것만 받는다 (아무 문자열이나 들어오면 안 된다)
const STICKERS = ["☕", "🍰", "🍜", "🔥", "💛", "✨"];

export async function GET() {
  const [rows] = await pool.query(
    `SELECT id, nickname, message, rating, sticker, reply, created_at
       FROM entries ORDER BY id DESC`,
  );
  return Response.json({ entries: rows, total: rows.length });
}

export async function POST(request) {
  const { nickname, message, rating, sticker } = await request.json();
  if (!nickname?.trim() || !message?.trim()) {
    return Response.json(
      { error: "이름과 한마디는 필수입니다" },
      { status: 400 },
    );
  }
  const score = Math.min(5, Math.max(1, Number(rating) || 5));
  const mark = STICKERS.includes(sticker) ? sticker : "☕";
  await pool.execute(
    "INSERT INTO entries (nickname, message, rating, sticker) VALUES (?, ?, ?, ?)",
    [nickname.trim(), message.trim(), score, mark],
  );
  return Response.json({ message: "방명록에 남겼습니다" }, { status: 201 });
}
