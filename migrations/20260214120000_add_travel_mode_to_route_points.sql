-- Migration: Add travel mode to route_points
-- Version: 20260214120000
-- Description: Add travel_mode enum to support land and air segments

ALTER TABLE route_points
  ADD COLUMN IF NOT EXISTS travel_mode ENUM('land', 'air') NOT NULL DEFAULT 'land' AFTER is_ferry_crossing;
