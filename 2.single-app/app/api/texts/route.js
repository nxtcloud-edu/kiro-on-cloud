// ─────────────────────────────────────────────
// [1-Tier · 백엔드] 저장된 명언 전체 목록(최신순)과 개수.
//   화면의 "저장된 명언" 버튼이 이 API를 부른다.
// ─────────────────────────────────────────────
import { quotes } from "../quotes-store";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    quotes: [...quotes].reverse(),
    total: quotes.length,
  });
}
