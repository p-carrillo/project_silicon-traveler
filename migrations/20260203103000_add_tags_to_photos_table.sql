-- Migration: Add tags to photos table
-- Version: 20260203103000
-- Description: Add optional tags column for search

ALTER TABLE photos
  ADD COLUMN IF NOT EXISTS tags VARCHAR(500) NULL AFTER narrative;
