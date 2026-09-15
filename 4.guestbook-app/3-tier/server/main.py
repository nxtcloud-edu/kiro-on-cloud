import os

import pymysql
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

load_dotenv()

app = FastAPI()

# 화면(S3)이 다른 출처에서 API를 부르므로 CORS 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 손님이 고를 수 있는 꾸미기 스티커. 화면(page.js)도 같은 목록을 쓴다.
STICKERS = ["☕", "🍰", "🍜", "🔥", "💛", "✨"]


# ─────────────────────────────────────────────
# [3-Tier · 데이터 계층 연결] RDS의 MySQL에 접속.
#   접속 정보는 .env에서 읽는다 — DB 비밀번호는 이 서버에만 있고 화면엔 없다.
#   화면이 DB를 직접 부르지 않는 이유가 이것이다. 위험한 일은 닫힌 계층이 대신 한다.
# ─────────────────────────────────────────────
def get_db():
    return pymysql.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "appuser"),
        password=os.getenv("DB_PASSWORD", "apppassword"),
        database=os.getenv("DB_NAME", "guestbook_db"),
        cursorclass=pymysql.cursors.DictCursor,
    )


class Entry(BaseModel):
    nickname: str
    message: str
    rating: int = 5
    sticker: str = "☕"


@app.get("/api/shop")
def get_shop():
    """가게 이름과 주인장 공지. 화면 맨 위에 걸리는 한 줄이다."""
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT name, notice FROM shop WHERE id = 1")
            row = cur.fetchone()
    finally:
        conn.close()

    if not row:
        return {"name": "방명록", "notice": ""}
    return row


@app.get("/api/entries")
def list_entries():
    """방명록 전체를 최신순으로. 화면의 '다녀간 사람들' 목록이 이 응답을 그린다."""
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, nickname, message, rating, sticker, reply, created_at "
                "FROM entries ORDER BY id DESC"
            )
            rows = cur.fetchall()
    finally:
        conn.close()

    return {"entries": rows, "total": len(rows)}


@app.post("/api/entries", status_code=201)
def add_entry(e: Entry):
    """방명록을 남긴다. 데이터가 서버 메모리가 아니라 RDS로 들어가는 지점."""
    nickname = e.nickname.strip()
    message = e.message.strip()
    if not nickname or not message:
        return JSONResponse(
            status_code=400, content={"error": "이름과 한마디는 필수입니다"}
        )

    score = min(5, max(1, e.rating))
    mark = e.sticker if e.sticker in STICKERS else "☕"

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO entries (nickname, message, rating, sticker) "
                "VALUES (%s, %s, %s, %s)",
                (nickname, message, score, mark),
            )
        # pymysql은 자동 커밋이 아니다. 이걸 빼면 서버를 껐다 켰을 때 사라진다.
        conn.commit()
    finally:
        conn.close()

    return {"message": "방명록에 남겼습니다 (이제 서버를 껐다 켜도 유지됩니다!)"}


@app.get("/health")
def health():
    """배포 스크립트가 서버가 떴는지 확인할 때 쓴다."""
    return {"status": "ok"}
