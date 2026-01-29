-- Migration: Seed test coach for development
-- Part of US-002: Database migrations for coach tables
--
-- Creates a test coach with a known ID for MVP development.
-- The test-coach-uuid-0001 ID matches lib/testCoach.ts TEST_COACH_ID.

INSERT INTO coaches (id, user_id, display_name, slug, bio, verification_status)
VALUES (
  'test-coach-uuid-0001',
  '00000000-0000-0000-0000-000000000001',
  'Test Coach',
  'test-coach',
  'Test coach account for MVP development.',
  'verified'
)
ON CONFLICT (id) DO NOTHING;
