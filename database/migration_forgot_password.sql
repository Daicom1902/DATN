-- ============================================================
--  Migration: Add password_reset_tokens table
--  Run once against datn_perfume database
-- ============================================================

USE datn_perfume;

-- Also ensure users table has google_id column (may not exist in older schema)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS google_id VARCHAR(100) DEFAULT NULL;

-- Password reset OTP tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED NOT NULL,
  otp        CHAR(6)      NOT NULL,
  expires_at DATETIME     NOT NULL,
  used       TINYINT(1)   NOT NULL DEFAULT 0,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_prt_user (user_id),
  CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
