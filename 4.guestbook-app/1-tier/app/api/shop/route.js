// ─────────────────────────────────────────────
// [1-Tier · 백엔드] 가게 정보 조회(GET).
//   주인장이 걸어둔 공지 한 줄. 손님은 읽기만 한다.
// ─────────────────────────────────────────────
import { pool } from "../db";

export const dynamic = "force-dynamic";

export async function GET() {
  const [rows] = await pool.query(
    "SELECT name, notice FROM shop WHERE id = 1",
  );
  if (rows.length === 0) {
    return Response.json({ name: "방명록", notice: "" });
  }
  return Response.json(rows[0]);
}
