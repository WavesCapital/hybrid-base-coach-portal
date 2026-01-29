-- Migration: Create coach_programs table
-- Part of US-002: Database migrations for coach tables

CREATE TABLE IF NOT EXISTS coach_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES coaches NOT NULL,

  -- Basic Info
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Content
  duration_weeks INT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  focus TEXT[],
  equipment TEXT[],

  -- Program data (weeks, days, workouts, exercises)
  template_data JSONB NOT NULL,

  -- Source
  source_pdf_url TEXT,

  -- Status
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'archived')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(coach_id, slug)
);

-- RLS policies
ALTER TABLE coach_programs ENABLE ROW LEVEL SECURITY;

-- Coaches can read their own programs
CREATE POLICY "coach_programs_select_own" ON coach_programs
  FOR SELECT USING (
    coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid())
  );

-- Coaches can insert their own programs
CREATE POLICY "coach_programs_insert_own" ON coach_programs
  FOR INSERT WITH CHECK (
    coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid())
  );

-- Coaches can update their own programs
CREATE POLICY "coach_programs_update_own" ON coach_programs
  FOR UPDATE USING (
    coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid())
  );

-- Coaches can delete their own programs
CREATE POLICY "coach_programs_delete_own" ON coach_programs
  FOR DELETE USING (
    coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid())
  );

-- Public can read published (active) programs
CREATE POLICY "coach_programs_public_read" ON coach_programs
  FOR SELECT USING (status = 'active');
