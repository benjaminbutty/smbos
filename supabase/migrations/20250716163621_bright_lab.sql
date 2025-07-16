/*
  # Create pages table

  1. New Tables
    - `pages`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
      - `content` (jsonb, default empty object)

  2. Security
    - Enable RLS on `pages` table
    - Add policies for authenticated users to manage their own pages
*/

CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  content jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Add foreign key constraint to auth.users
ALTER TABLE pages 
ADD CONSTRAINT pages_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create policies for pages
CREATE POLICY "Users can create pages"
  ON pages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own pages"
  ON pages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own pages"
  ON pages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pages"
  ON pages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();