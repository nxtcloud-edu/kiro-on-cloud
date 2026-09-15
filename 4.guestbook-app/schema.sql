-- 데이터 계층 스키마.  **현재 선택된 데이터베이스**에 테이블과 초기 데이터를 만든다.
-- 데이터베이스·계정 생성은 여기서 하지 않는다 (1-Tier는 EC2 로컬, 3-Tier는 RDS라 다르다).
--
--   1-Tier:  sudo mysql guestbook_db < app/schema.sql
--   3-Tier:  mysql -h <RDS 엔드포인트> -u user_07 -p db_07 < app/schema.sql
--
-- 여러 번 실행해도 안전하다 (다시 배포해도 방명록이 중복으로 쌓이지 않는다).

-- 가게 정보 — 한 행만 쓴다. 주인장이 걸어두는 공지가 여기 있다.
CREATE TABLE IF NOT EXISTS shop (
  id TINYINT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  notice TEXT NOT NULL
);

-- 손님이 남기는 방명록
CREATE TABLE IF NOT EXISTS entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nickname VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  rating TINYINT NOT NULL DEFAULT 5,        -- 별점 1~5
  sticker VARCHAR(8) NOT NULL DEFAULT '☕',  -- 꾸미기 스티커
  reply TEXT NULL,                          -- 주인장 답글 (없으면 NULL)
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 초기 데이터 — 테이블이 비어 있을 때만 넣는다
INSERT INTO shop (id, name, notice)
SELECT 1, '구름다방', '오늘 원두는 에티오피아 예가체프입니다. 다녀가셨으면 한 줄 남겨주세요 ☕'
WHERE NOT EXISTS (SELECT 1 FROM (SELECT 1 FROM shop LIMIT 1) AS existing);

INSERT INTO entries (nickname, message, rating, sticker, reply)
SELECT seed.nickname, seed.message, seed.rating, seed.sticker, seed.reply FROM (
            SELECT '지나가던손님' AS nickname,
                   '웨이팅 40분. 그래도 또 옵니다.' AS message,
                   5 AS rating, '☕' AS sticker,
                   '기다려주셔서 고맙습니다. 다음엔 창가 자리 맡아둘게요.' AS reply
  UNION ALL SELECT '커피는생명', '창가 자리 햇빛이 좋았어요. 치즈케이크 강추.', 4, '🍰', NULL
  UNION ALL SELECT '야근러', '퇴근길에 들렀습니다. 오늘 하루도 무사히.', 5, '✨',
                   '고생하셨어요. 내일도 여기 있겠습니다.'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM (SELECT 1 FROM entries LIMIT 1) AS existing);
