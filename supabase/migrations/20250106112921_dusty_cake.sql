/*
  # Create storage bucket for file sharing

  1. New Storage
    - Create a new public bucket named 'files' for storing uploaded files
    
  2. Security
    - Enable public access for file downloads
    - Restrict uploads to authenticated users only
*/

-- Create a new storage bucket for files
INSERT INTO storage.buckets (id, name, public)
VALUES ('files', 'files', true);

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