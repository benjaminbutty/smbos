/*
  # Database Tables Schema

  1. New Tables
    - `database_tables`
      - `id` (uuid, primary key)
      - `name` (text)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `database_columns`
      - `id` (uuid, primary key)
      - `table_id` (uuid, foreign key to database_tables)
      - `name` (text)
      - `type` (text)
      - `order` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `database_rows`
      - `id` (uuid, primary key)
      - `table_id` (uuid, foreign key to database_tables)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `database_cells`
      - `id` (uuid, primary key)
      - `row_id` (uuid, foreign key to database_rows)
      - `column_id` (uuid, foreign key to database_columns)
      - `content` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - Read their own data
      - Create new data
      - Update their own data
      - Delete their own data
*/

-- Create database_tables table
CREATE TABLE IF NOT EXISTS database_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create database_columns table
CREATE TABLE IF NOT EXISTS database_columns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid NOT NULL REFERENCES database_tables(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('text', 'number')),
  "order" integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create database_rows table
CREATE TABLE IF NOT EXISTS database_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid NOT NULL REFERENCES database_tables(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create database_cells table
CREATE TABLE IF NOT EXISTS database_cells (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  row_id uuid NOT NULL REFERENCES database_rows(id) ON DELETE CASCADE,
  column_id uuid NOT NULL REFERENCES database_columns(id) ON DELETE CASCADE,
  content text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE database_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE database_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE database_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE database_cells ENABLE ROW LEVEL SECURITY;

-- Create policies for database_tables
CREATE POLICY "Users can view their own tables"
  ON database_tables
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tables"
  ON database_tables
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tables"
  ON database_tables
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tables"
  ON database_tables
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for database_columns
CREATE POLICY "Users can view columns of their tables"
  ON database_columns
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM database_tables
    WHERE database_tables.id = table_id
    AND database_tables.user_id = auth.uid()
  ));

CREATE POLICY "Users can create columns in their tables"
  ON database_columns
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM database_tables
    WHERE database_tables.id = table_id
    AND database_tables.user_id = auth.uid()
  ));

CREATE POLICY "Users can update columns in their tables"
  ON database_columns
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM database_tables
    WHERE database_tables.id = table_id
    AND database_tables.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete columns in their tables"
  ON database_columns
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM database_tables
    WHERE database_tables.id = table_id
    AND database_tables.user_id = auth.uid()
  ));

-- Create policies for database_rows
CREATE POLICY "Users can view rows in their tables"
  ON database_rows
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM database_tables
    WHERE database_tables.id = table_id
    AND database_tables.user_id = auth.uid()
  ));

CREATE POLICY "Users can create rows in their tables"
  ON database_rows
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM database_tables
    WHERE database_tables.id = table_id
    AND database_tables.user_id = auth.uid()
  ));

CREATE POLICY "Users can update rows in their tables"
  ON database_rows
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM database_tables
    WHERE database_tables.id = table_id
    AND database_tables.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete rows in their tables"
  ON database_rows
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM database_tables
    WHERE database_tables.id = table_id
    AND database_tables.user_id = auth.uid()
  ));

-- Create policies for database_cells
CREATE POLICY "Users can view cells in their tables"
  ON database_cells
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM database_rows
    JOIN database_tables ON database_tables.id = database_rows.table_id
    WHERE database_rows.id = row_id
    AND database_tables.user_id = auth.uid()
  ));

CREATE POLICY "Users can create cells in their tables"
  ON database_cells
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM database_rows
    JOIN database_tables ON database_tables.id = database_rows.table_id
    WHERE database_rows.id = row_id
    AND database_tables.user_id = auth.uid()
  ));

CREATE POLICY "Users can update cells in their tables"
  ON database_cells
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM database_rows
    JOIN database_tables ON database_tables.id = database_rows.table_id
    WHERE database_rows.id = row_id
    AND database_tables.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete cells in their tables"
  ON database_cells
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM database_rows
    JOIN database_tables ON database_tables.id = database_rows.table_id
    WHERE database_rows.id = row_id
    AND database_tables.user_id = auth.uid()
  ));

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_database_tables_user_id ON database_tables(user_id);
CREATE INDEX IF NOT EXISTS idx_database_columns_table_id ON database_columns(table_id);
CREATE INDEX IF NOT EXISTS idx_database_rows_table_id ON database_rows(table_id);
CREATE INDEX IF NOT EXISTS idx_database_cells_row_id ON database_cells(row_id);
CREATE INDEX IF NOT EXISTS idx_database_cells_column_id ON database_cells(column_id);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_database_tables_updated_at
  BEFORE UPDATE ON database_tables
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_database_columns_updated_at
  BEFORE UPDATE ON database_columns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_database_rows_updated_at
  BEFORE UPDATE ON database_rows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_database_cells_updated_at
  BEFORE UPDATE ON database_cells
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();