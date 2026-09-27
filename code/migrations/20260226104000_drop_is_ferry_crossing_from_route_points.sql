-- Migration: Drop legacy is_ferry_crossing column from route_points
-- Version: 20260226104000
-- Description: Remove obsolete ferry-crossing flag from route points

ALTER TABLE route_points
  DROP COLUMN IF EXISTS is_ferry_crossing;
