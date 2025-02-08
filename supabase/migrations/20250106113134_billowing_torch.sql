-- Enable email/password auth
ALTER SYSTEM SET auth.email.enable_signup = false;
ALTER SYSTEM SET auth.email.enable_confirmations = false;

-- Create a new storage bucket for files if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('files', 'files', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Allow public access to files (for downloads)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'files');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'files');

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'files' AND auth.uid() = owner);