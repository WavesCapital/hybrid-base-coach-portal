-- Migration: Add auto-created columns to exercises table
-- Part of US-002: Database migrations for coach tables
--
-- Note: This migration assumes an existing exercises table in the Supabase project.
-- These columns track exercises that were auto-created during coach program uploads.

DO $$
BEGIN
  -- Add is_auto_created column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'exercises' AND column_name = 'is_auto_created'
  ) THEN
    ALTER TABLE exercises ADD COLUMN is_auto_created BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add auto_created_by column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'exercises' AND column_name = 'auto_created_by'
  ) THEN
    ALTER TABLE exercises ADD COLUMN auto_created_by UUID REFERENCES coaches(id);
  END IF;

  -- Add auto_created_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'exercises' AND column_name = 'auto_created_at'
  ) THEN
    ALTER TABLE exercises ADD COLUMN auto_created_at TIMESTAMPTZ;
  END IF;
END
$$;
