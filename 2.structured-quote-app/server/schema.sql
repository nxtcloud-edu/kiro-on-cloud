-- 서버에 설치한 MySQL(또는 MariaDB)에서 실행:  sudo mysql < schema.sql

-- 1) 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS quotes_db;

-- 2) 애플리케이션 전용 계정 생성 (root로 앱을 돌리지 않는 습관)
CREATE USER IF NOT EXISTS 'appuser'@'localhost' IDENTIFIED BY 'apppassword';
GRANT ALL PRIVILEGES ON quotes_db.* TO 'appuser'@'localhost';
FLUSH PRIVILEGES;

-- 3) 테이블 + 초기 데이터
USE quotes_db;

CREATE TABLE IF NOT EXISTS quotes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  text TEXT NOT NULL,
  username VARCHAR(255) NOT NULL
);

INSERT INTO quotes (text, username) VALUES
('언제나 현재에 집중하라 ...아마도...', '파울로 코엘료'),
('행복은 발치에서 키워가는 것 ...아마도...', '제임스 오펜하임');
