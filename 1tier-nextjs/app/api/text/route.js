// ─────────────────────────────────────────────
// [1-Tier · 백엔드] 데이터가 이 서버 프로세스의 메모리(아래 배열)에 산다.
//   Next.js를 재시작하면 배열이 초기 상태로 돌아간다 = 데이터 증발!
//   (DB가 없어서 그렇다 → 3-Tier에서 MySQL이 등장한다)
// ─────────────────────────────────────────────

// GET 요청이 정적으로 캐시되지 않도록 (매번 새로 랜덤 뽑기)
export const dynamic = "force-dynamic";

let quotes = [
  { text: "언제나 현재에 집중하라 ...아마도...", username: "파울로 코엘료" },
  { text: "행복은 발치에서 키워가는 것 ...아마도...", username: "제임스 오펜하임" },
];

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
