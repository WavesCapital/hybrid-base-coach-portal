-- Migration: Create coaches table
-- Part of US-002: Database migrations for coach tables

CREATE TABLE IF NOT EXISTS coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,

  -- Profile
  display_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  profile_photo_url TEXT,
  social_links JSONB DEFAULT '{}',

  -- Status
  verification_status TEXT DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'rejected')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;

-- Coaches can read their own data
CREATE POLICY "coaches_select_own" ON coaches
  FOR SELECT USING (auth.uid() = user_id);

-- Coaches can update their own data
CREATE POLICY "coaches_update_own" ON coaches
  FOR UPDATE USING (auth.uid() = user_id);

-- Coaches can insert their own data
CREATE POLICY "coaches_insert_own" ON coaches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public can read verified coaches (for marketplace)
CREATE POLICY "coaches_public_read" ON coaches
  FOR SELECT USING (verification_status = 'verified');
