/*
  # Database Schema Update

  1. New Tables
    - `database_tables`
      - For storing user-created tables
      - Includes name and user reference
    - `database_columns`
      - For storing table columns
      - Includes name, type, and order
    - `database_rows`
      - For storing table rows
      - Links to database_tables
    - `database_cells`
      - For storing cell values
      - Links to rows and columns
    - `pages`
      - For storing page metadata
      - Includes title, slug, and publish status
    - `page_content`
      - For storing page content
      - Links to pages and stores JSON content

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS database_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS database_columns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid NOT NULL REFERENCES database_tables(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  metadata jsonb DEFAULT '{}',
  "order" integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS database_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid NOT NULL REFERENCES database_tables(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS database_cells (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  row_id uuid NOT NULL REFERENCES database_rows(id) ON DELETE CASCADE,
  column_id uuid NOT NULL REFERENCES database_columns(id) ON DELETE CASCADE,
  content text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  is_published boolean DEFAULT false,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, slug)
);

CREATE TABLE IF NOT EXISTS page_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  content jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
DO $$ 
BEGIN
  ALTER TABLE database_tables ENABLE ROW LEVEL SECURITY;
  ALTER TABLE database_columns ENABLE ROW LEVEL SECURITY;
  ALTER TABLE database_rows ENABLE ROW LEVEL SECURITY;
  ALTER TABLE database_cells ENABLE ROW LEVEL SECURITY;
  ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
  ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Create policies if they don't exist
DO $$ 
BEGIN
  -- Policies for database_tables
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'database_tables' AND policyname = 'Users can view their own tables'
  ) THEN
    CREATE POLICY "Users can view their own tables"
      ON database_tables FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'database_tables' AND policyname = 'Users can create tables'
  ) THEN
    CREATE POLICY "Users can create tables"
      ON database_tables FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'database_tables' AND policyname = 'Users can update their own tables'
  ) THEN
    CREATE POLICY "Users can update their own tables"
      ON database_tables FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'database_tables' AND policyname = 'Users can delete their own tables'
  ) THEN
    CREATE POLICY "Users can delete their own tables"
      ON database_tables FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Policies for database_columns
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'database_columns' AND policyname = 'Users can view columns of their tables'
  ) THEN
    CREATE POLICY "Users can view columns of their tables"
      ON database_columns FOR SELECT
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM database_tables
        WHERE database_tables.id = table_id
        AND database_tables.user_id = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'database_columns' AND policyname = 'Users can create columns in their tables'
  ) THEN
    CREATE POLICY "Users can create columns in their tables"
      ON database_columns FOR INSERT
      TO authenticated
      WITH CHECK (EXISTS (
        SELECT 1 FROM database_tables
        WHERE database_tables.id = table_id
        AND database_tables.user_id = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'database_columns' AND policyname = 'Users can update columns in their tables'
  ) THEN
    CREATE POLICY "Users can update columns in their tables"
      ON database_columns FOR UPDATE
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM database_tables
        WHERE database_tables.id = table_id
        AND database_tables.user_id = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'database_columns' AND policyname = 'Users can delete columns in their tables'
  ) THEN
    CREATE POLICY "Users can delete columns in their tables"
      ON database_columns FOR DELETE
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM database_tables
        WHERE database_tables.id = table_id
        AND database_tables.user_id = auth.uid()
      ));
  END IF;

  -- Policies for database_rows
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'database_rows' AND policyname = 'Users can view rows in their tables'
  ) THEN
    CREATE POLICY "Users can view rows in their tables"
      ON database_rows FOR SELECT
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM database_tables
        WHERE database_tables.id = table_id
        AND database_tables.user_id = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'database_rows' AND policyname = 'Users can create rows in their tables'
  ) THEN
    CREATE POLICY "Users can create rows in their tables"
      ON database_rows FOR INSERT
      TO authenticated
      WITH CHECK (EXISTS (
        SELECT 1 FROM database_tables
        WHERE database_tables.id = table_id
        AND database_tables.user_id = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'database_rows' AND policyname = 'Users can update rows in their tables'
  ) THEN
    CREATE POLICY "Users can update rows in their tables"
      ON database_rows FOR UPDATE
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM database_tables
        WHERE database_tables.id = table_id
        AND database_tables.user_id = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'database_rows' AND policyname = 'Users can delete rows in their tables'
  ) THEN
    CREATE POLICY "Users can delete rows in their tables"
      ON database_rows FOR DELETE
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM database_tables
        WHERE database_tables.id = table_id
        AND database_tables.user_id = auth.uid()
      ));
  END IF;

  -- Policies for database_cells
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'database_cells' AND policyname = 'Users can view cells in their tables'
  ) THEN
    CREATE POLICY "Users can view cells in their tables"
      ON database_cells FOR SELECT
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM database_rows
        JOIN database_tables ON database_tables.id = database_rows.table_id
        WHERE database_rows.id = row_id
        AND database_tables.user_id = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'database_cells' AND policyname = 'Users can create cells in their tables'
  ) THEN
    CREATE POLICY "Users can create cells in their tables"
      ON database_cells FOR INSERT
      TO authenticated
      WITH CHECK (EXISTS (
        SELECT 1 FROM database_rows
        JOIN database_tables ON database_tables.id = database_rows.table_id
        WHERE database_rows.id = row_id
        AND database_tables.user_id = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'database_cells' AND policyname = 'Users can update cells in their tables'
  ) THEN
    CREATE POLICY "Users can update cells in their tables"
      ON database_cells FOR UPDATE
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM database_rows
        JOIN database_tables ON database_tables.id = database_rows.table_id
        WHERE database_rows.id = row_id
        AND database_tables.user_id = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'database_cells' AND policyname = 'Users can delete cells in their tables'
  ) THEN
    CREATE POLICY "Users can delete cells in their tables"
      ON database_cells FOR DELETE
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM database_rows
        JOIN database_tables ON database_tables.id = database_rows.table_id
        WHERE database_rows.id = row_id
        AND database_tables.user_id = auth.uid()
      ));
  END IF;

  -- Policies for pages
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pages' AND policyname = 'Users can view their own pages'
  ) THEN
    CREATE POLICY "Users can view their own pages"
      ON pages FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pages' AND policyname = 'Users can create pages'
  ) THEN
    CREATE POLICY "Users can create pages"
      ON pages FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pages' AND policyname = 'Users can update their own pages'
  ) THEN
    CREATE POLICY "Users can update their own pages"
      ON pages FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pages' AND policyname = 'Users can delete their own pages'
  ) THEN
    CREATE POLICY "Users can delete their own pages"
      ON pages FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Policies for page_content
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'page_content' AND policyname = 'Users can view content of their pages'
  ) THEN
    CREATE POLICY "Users can view content of their pages"
      ON page_content FOR SELECT
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM pages
        WHERE pages.id = page_id
        AND pages.user_id = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'page_content' AND policyname = 'Users can create content for their pages'
  ) THEN
    CREATE POLICY "Users can create content for their pages"
      ON page_content FOR INSERT
      TO authenticated
      WITH CHECK (EXISTS (
        SELECT 1 FROM pages
        WHERE pages.id = page_id
        AND pages.user_id = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'page_content' AND policyname = 'Users can update content of their pages'
  ) THEN
    CREATE POLICY "Users can update content of their pages"
      ON page_content FOR UPDATE
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM pages
        WHERE pages.id = page_id
        AND pages.user_id = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'page_content' AND policyname = 'Users can delete content of their pages'
  ) THEN
    CREATE POLICY "Users can delete content of their pages"
      ON page_content FOR DELETE
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM pages
        WHERE pages.id = page_id
        AND pages.user_id = auth.uid()
      ));
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_database_tables_user_id ON database_tables(user_id);
CREATE INDEX IF NOT EXISTS idx_database_columns_table_id ON database_columns(table_id);
CREATE INDEX IF NOT EXISTS idx_database_rows_table_id ON database_rows(table_id);
CREATE INDEX IF NOT EXISTS idx_database_cells_row_id ON database_cells(row_id);
CREATE INDEX IF NOT EXISTS idx_database_cells_column_id ON database_cells(column_id);
CREATE INDEX IF NOT EXISTS idx_pages_user_id ON pages(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_page_content_page_id ON page_content(page_id);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_database_tables_updated_at'
  ) THEN
    CREATE TRIGGER update_database_tables_updated_at
      BEFORE UPDATE ON database_tables
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_database_columns_updated_at'
  ) THEN
    CREATE TRIGGER update_database_columns_updated_at
      BEFORE UPDATE ON database_columns
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_database_rows_updated_at'
  ) THEN
    CREATE TRIGGER update_database_rows_updated_at
      BEFORE UPDATE ON database_rows
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_database_cells_updated_at'
  ) THEN
    CREATE TRIGGER update_database_cells_updated_at
      BEFORE UPDATE ON database_cells
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_pages_updated_at'
  ) THEN
    CREATE TRIGGER update_pages_updated_at
      BEFORE UPDATE ON pages
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_page_content_updated_at'
  ) THEN
    CREATE TRIGGER update_page_content_updated_at
      BEFORE UPDATE ON page_content
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;