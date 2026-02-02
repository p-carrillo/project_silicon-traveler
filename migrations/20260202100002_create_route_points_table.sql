-- Migration: Create route_points table
-- Version: 20260202100002
-- Description: Create route_points table for storing journey waypoints

CREATE TABLE IF NOT EXISTS route_points (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  journey_id INT UNSIGNED NOT NULL,
  sequence INT UNSIGNED NOT NULL,
  
  -- Geographic data
  place_name VARCHAR(255),
  coordinates POINT NOT NULL,
  country VARCHAR(100),
  region VARCHAR(255),
  is_ferry_crossing BOOLEAN NOT NULL DEFAULT FALSE,
  distance_from_previous DECIMAL(6,2),
  
  -- Research & content data
  osm_data JSON,
  research_summary TEXT,
  image_prompt TEXT,
  narrative_prompt TEXT,
  camera_metadata JSON,
  
  -- Processing status
  status ENUM('pending', 'researched', 'content_generated', 'image_ready', 'published', 'failed') NOT NULL DEFAULT 'pending',
  error_message TEXT,
  
  -- Image paths
  image_path VARCHAR(500),
  thumbnail_path VARCHAR(500),
  
  -- Timestamps
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at DATETIME,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (journey_id) REFERENCES journey(id) ON DELETE CASCADE,
  UNIQUE KEY uk_journey_sequence (journey_id, sequence),
  INDEX idx_status (status),
  INDEX idx_published_at (published_at),
  INDEX idx_country (country),
  SPATIAL INDEX idx_coordinates (coordinates)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
