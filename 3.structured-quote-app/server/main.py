import os

import pymysql
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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


# ─────────────────────────────────────────────
# [3-Tier · 데이터 계층 연결] 같은 EC2의 MySQL에 접속.
#   접속 정보는 .env에서 읽는다 (DB 비밀번호는 서버에만 있고 화면엔 없다).
# ─────────────────────────────────────────────
def get_db():
    return pymysql.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "appuser"),
        password=os.getenv("DB_PASSWORD", "apppassword"),
        database=os.getenv("DB_NAME", "quotes_db"),
        cursorclass=pymysql.cursors.DictCursor,
    )


class Quote(BaseModel):
    text: str
    username: str


@app.get("/api/text")
def get_text():
    # TODO(KIRO): quotes 테이블에서 랜덤 1개(ORDER BY RAND() LIMIT 1)를 조회해
    #   {"text": "<text> by <username>"} 로 반환하세요. 결과가 없으면 404 {"message": ...}.
    #   (1-Tier와 응답 형식이 같아야 화면 코드가 그대로 동작함)
    ...


@app.post("/api/text", status_code=201)
def add_text(q: Quote):
    # TODO(KIRO): quotes 테이블에 INSERT. text 뒤에 " ...아마도..." 를 붙이세요.
    #   INSERT 후 conn.commit() 을 꼭 호출해야 실제로 저장됩니다 (pymysql은 자동 커밋이 아님).
    #   text나 username이 비어 있으면 400 {"error": "text와 username은 필수입니다"}.
    #   성공 시 {"message": "저장되었습니다 (이제 서버를 껐다 켜도 유지됩니다!)"}.
    ...


@app.get("/api/texts")
def list_texts():
    # TODO(KIRO): quotes 테이블 전체를 최신순(ORDER BY id DESC)으로 조회해
    #   {"quotes": [{"text": ..., "username": ...}, ...], "total": <개수>} 로 반환하세요.
    #   (화면의 "저장된 명언" 목록이 이 응답을 그대로 그린다)
    ...
