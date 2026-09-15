// ─────────────────────────────────────────────
// [1-Tier · 데이터] MySQL 접속. 단, 이 MySQL은 **앱과 같은 EC2 안**에 있다.
//   화면도, API도, DB도 전부 이 서버 한 대에 얹혀 있다 = 한 덩어리(모놀리스).
//   이 EC2가 멈추면 셋 다 같이 멈추고, 디스크가 날아가면 데이터도 같이 날아간다.
//   → 3-Tier에서 DB를 RDS로 떼어내는 이유가 이것이다.
// ─────────────────────────────────────────────
import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "appuser",
  password: process.env.DB_PASSWORD || "apppassword",
  database: process.env.DB_NAME || "guestbook_db",
  waitForConnections: true,
  connectionLimit: 5,
});
