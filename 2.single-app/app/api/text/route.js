// ─────────────────────────────────────────────
// [1-Tier · 백엔드] 명언 1개 조회(GET) · 추가(POST).
//   데이터는 같은 프로세스의 메모리 배열(app/api/quotes-store.js)에 있다.
// ─────────────────────────────────────────────
import { quotes } from "../quotes-store";

// GET 요청이 정적으로 캐시되지 않도록 (매번 새로 랜덤 뽑기)
export const dynamic = "force-dynamic";

export async function GET() {
  if (quotes.length === 0) {
    return Response.json({ message: "저장된 명언이 없습니다" }, { status: 404 });
  }
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  return Response.json({ text: `${q.text} by ${q.username}` });
}

export async function POST(request) {
  const { text, username } = await request.json();
  if (!text || !username) {
    return Response.json(
      { error: "text와 username은 필수입니다" },
      { status: 400 },
    );
  }
  quotes.push({ text: `${text} ...아마도...`, username });
  return Response.json(
    { message: "저장됨 (단, 서버를 재시작하면 사라집니다!)" },
    { status: 201 },
  );
}
