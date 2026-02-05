-- Migration: Create photo_translations table
-- Version: 20260205120010
-- Description: Store multilingual photo metadata for display

CREATE TABLE IF NOT EXISTS photo_translations (
  photo_id INT UNSIGNED NOT NULL,
  language VARCHAR(10) NOT NULL,
  title VARCHAR(255) NOT NULL,
  narrative TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (photo_id, language),
  FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE,
  INDEX idx_language (language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
