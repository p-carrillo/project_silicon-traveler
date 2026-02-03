-- Migration: Create map_state table
-- Version: 20260203120000
-- Description: Stores global map viewport state and refresh metadata

CREATE TABLE IF NOT EXISTS map_state (
  id INT UNSIGNED PRIMARY KEY,
  min_lng DECIMAL(9,6) NOT NULL,
  min_lat DECIMAL(8,6) NOT NULL,
  max_lng DECIMAL(9,6) NOT NULL,
  max_lat DECIMAL(8,6) NOT NULL,
  zoom DECIMAL(4,2) NOT NULL,
  last_photo_id INT UNSIGNED NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
