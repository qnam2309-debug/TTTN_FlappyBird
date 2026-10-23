-- ============================================================
-- Flappy Bird - Database Schema (MySQL / MariaDB - XAMPP)
-- Chuyển từ ERD gốc (cú pháp SQL Server) sang MySQL.
-- Cấu trúc khớp 100% ERD: SKINS, USERS, USER_SKINS, GAME_RESULTS.
--
-- Chú thích chuyển đổi SQL Server -> MySQL:
--   IDENTITY(1,1)       -> AUTO_INCREMENT
--   NVARCHAR(...)       -> VARCHAR(...)  (utf8mb4 đã hỗ trợ Unicode)
--   BIT                 -> TINYINT(1)
--   DATETIME2           -> DATETIME(6)
--   SYSDATETIME()       -> CURRENT_TIMESTAMP(6)
--   GO                  -> (bỏ, MySQL không dùng)
-- ============================================================

-- ============================================
-- 1. TAO DATABASE
-- ============================================
CREATE DATABASE IF NOT EXISTS TTTN_FlappyBird
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE TTTN_FlappyBird;

-- ============================================
-- 2. BANG SKINS: DANH MUC TRANG PHUC
-- ============================================
CREATE TABLE IF NOT EXISTS SKINS (
    SkinID    BIGINT       NOT NULL AUTO_INCREMENT,
    SkinCode  VARCHAR(50)  NOT NULL,
    SkinName  VARCHAR(100) NOT NULL,
    ImageURL  VARCHAR(500) NOT NULL,
    Price     INT          NOT NULL DEFAULT 0,
    IsActive  TINYINT(1)   NOT NULL DEFAULT 1,
    CreatedAt DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (SkinID),
    UNIQUE KEY uq_skins_skincode (SkinCode),
    CONSTRAINT CK_SKINS_Price CHECK (Price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. BANG USERS: TAI KHOAN NGUOI CHOI
-- ============================================
CREATE TABLE IF NOT EXISTS USERS (
    UserID        BIGINT       NOT NULL AUTO_INCREMENT,
    Username      VARCHAR(50)  NOT NULL,
    PasswordHash  VARCHAR(255) NOT NULL,
    CurrentSkinID BIGINT       NULL,
    Coins         INT          NOT NULL DEFAULT 0,
    CreatedAt     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    UpdatedAt     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (UserID),
    UNIQUE KEY uq_users_username (Username),
    CONSTRAINT CK_USERS_Coins CHECK (Coins >= 0),
    CONSTRAINT FK_USERS_SKINS FOREIGN KEY (CurrentSkinID)
        REFERENCES SKINS (SkinID)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. BANG USER_SKINS: TRANG PHUC DA SO HUU (quan he n-n)
-- ============================================
CREATE TABLE IF NOT EXISTS USER_SKINS (
    UserID     BIGINT      NOT NULL,
    SkinID     BIGINT      NOT NULL,
    AcquiredAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (UserID, SkinID),
    CONSTRAINT FK_USER_SKINS_USERS FOREIGN KEY (UserID)
        REFERENCES USERS (UserID),
    CONSTRAINT FK_USER_SKINS_SKINS FOREIGN KEY (SkinID)
        REFERENCES SKINS (SkinID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. BANG GAME_RESULTS: KET QUA TUNG LUOT CHOI
-- ============================================
CREATE TABLE IF NOT EXISTS GAME_RESULTS (
    ResultID        BIGINT      NOT NULL AUTO_INCREMENT,
    UserID          BIGINT      NULL,
    GuestSessionID  CHAR(36)    NULL,
    Score           INT         NOT NULL DEFAULT 0,
    DurationSeconds INT         NOT NULL DEFAULT 0,
    PlayedAt        DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (ResultID),
    UNIQUE KEY uq_game_results_user (UserID),
    CONSTRAINT FK_GAME_RESULTS_USERS FOREIGN KEY (UserID)
        REFERENCES USERS (UserID)
        ON DELETE SET NULL,
    CONSTRAINT CK_GAME_RESULTS_Score CHECK (Score >= 0),
    CONSTRAINT CK_GAME_RESULTS_Duration CHECK (DurationSeconds >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. TAO INDEX CHO TRUY VAN DIEM SO
-- ============================================
CREATE INDEX IX_GAME_RESULTS_User_Score
    ON GAME_RESULTS (UserID, Score DESC);

CREATE INDEX IX_GAME_RESULTS_Score_Time
    ON GAME_RESULTS (Score DESC, PlayedAt ASC);

-- ============================================
-- 7. DU LIEU TRANG PHUC MAC DINH VA TRANG PHUC CUA HANG
-- ============================================
INSERT IGNORE INTO SKINS (SkinCode, SkinName, ImageURL, Price)
VALUES 
    ('default', 'Mặc định', 'images/skins/default.png', 0),
    ('blue', 'Chim Xanh Đại Dương', 'images/skins/blue.png', 15),
    ('red', 'Phượng Hoàng Đỏ', 'images/skins/red.png', 30),
    ('gold', 'Hoàng Kim Vua', 'images/skins/gold.png', 50),
    ('shadow', 'Bóng Đêm', 'images/skins/shadow.png', 80);
