-- Migration: Add metadata to photos table
-- Version: 20260203160000
-- Description: Add JSON metadata column for extra photo details

ALTER TABLE photos
  ADD COLUMN IF NOT EXISTS metadata JSON NULL AFTER tags;
