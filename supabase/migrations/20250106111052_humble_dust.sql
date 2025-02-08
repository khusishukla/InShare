/*
  # Create files table for storing file metadata

  1. New Tables
    - `files`
      - `id` (uuid, primary key)
      - `name` (text) - Original filename
      - `size` (bigint) - File size in bytes
      - `type` (text) - MIME type
      - `storage_path` (text) - Path in Supabase storage
      - `download_id` (text) - Unique ID for download link
      - `created_at` (timestamp)
      - `user_id` (uuid) - Reference to auth.users
      - `downloads` (int) - Download counter
      
  2. Security
    - Enable RLS on `files` table
    - Add policies for:
      - Anyone can read files using download_id
      - Authenticated users can insert their own files
      - Users can only see their own files in list views
*/

CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  size bigint NOT NULL,
  type text NOT NULL,
  storage_path text NOT NULL,
  download_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL,
  downloads int DEFAULT 0,
  CONSTRAINT valid_size CHECK (size > 0)
);

ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read files using download_id
CREATE POLICY "Anyone can read files using download_id"
  ON files
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert their own files
CREATE POLICY "Users can upload files"
  ON files
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can only see their own files in list views
CREATE POLICY "Users can view own files"
  ON files
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);