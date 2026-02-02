-- Migration: Create photos table
-- Version: 20260202100003
-- Description: Create photos table for published photos

CREATE TABLE IF NOT EXISTS photos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  route_point_id INT UNSIGNED NOT NULL UNIQUE,
  
  -- Display metadata
  title VARCHAR(255) NOT NULL,
  narrative TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  coordinates POINT NOT NULL,
  
  -- Camera metadata
  camera_model VARCHAR(100),
  lens VARCHAR(100),
  iso INT UNSIGNED,
  shutter_speed VARCHAR(20),
  
  -- Additional metadata
  roll_number VARCHAR(50),
  frame_number VARCHAR(50),
  series_name VARCHAR(255),
  volume_issue VARCHAR(50),
  
  -- Image paths
  image_path VARCHAR(500) NOT NULL,
  thumbnail_path VARCHAR(500) NOT NULL,
  
  -- Timestamps
  published_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (route_point_id) REFERENCES route_points(id) ON DELETE CASCADE,
  INDEX idx_published_at (published_at DESC),
  INDEX idx_location (location),
  SPATIAL INDEX idx_coordinates (coordinates)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
