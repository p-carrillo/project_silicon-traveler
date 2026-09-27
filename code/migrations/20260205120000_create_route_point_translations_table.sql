-- Migration: Create route_point_translations table
-- Version: 20260205120000
-- Description: Store multilingual prompts and narratives per route point

CREATE TABLE IF NOT EXISTS route_point_translations (
  route_point_id INT UNSIGNED NOT NULL,
  language VARCHAR(10) NOT NULL,
  image_prompt TEXT,
  narrative TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (route_point_id, language),
  FOREIGN KEY (route_point_id) REFERENCES route_points(id) ON DELETE CASCADE,
  INDEX idx_language (language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
