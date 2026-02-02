-- Migration: Create journey table
-- Version: 20260202100001
-- Description: Create journey table for storing the around-the-world journey

CREATE TABLE IF NOT EXISTS journey (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL DEFAULT 'Around the World on Foot',
  origin_point POINT NOT NULL,
  current_position POINT NOT NULL,
  heading VARCHAR(10) NOT NULL DEFAULT 'east',
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  SPATIAL INDEX idx_origin (origin_point),
  SPATIAL INDEX idx_current (current_position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
