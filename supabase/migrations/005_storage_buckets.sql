-- Migration: Create Supabase Storage buckets for coach uploads
-- Part of US-002B: Supabase Storage buckets for uploads

-- Create coach-pdfs bucket (private, 50MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('coach-pdfs', 'coach-pdfs', false, 52428800)
ON CONFLICT (id) DO NOTHING;

-- Create coach-photos bucket (public, 5MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('coach-photos', 'coach-photos', true, 5242880)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for coach-pdfs bucket

-- Authenticated users can upload to their own coach folder
CREATE POLICY "coach_pdfs_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'coach-pdfs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Coaches can read their own PDFs
CREATE POLICY "coach_pdfs_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'coach-pdfs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Coaches can delete their own PDFs
CREATE POLICY "coach_pdfs_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'coach-pdfs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies for coach-photos bucket

-- Authenticated users can upload to their own coach folder
CREATE POLICY "coach_photos_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'coach-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Coach photos are publicly readable
CREATE POLICY "coach_photos_select" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'coach-photos');

-- Coaches can update their own photos
CREATE POLICY "coach_photos_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'coach-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Coaches can delete their own photos
CREATE POLICY "coach_photos_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'coach-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
