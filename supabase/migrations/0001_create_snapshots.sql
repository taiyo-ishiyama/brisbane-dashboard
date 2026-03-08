-- Create snapshots table for caching normalised JSON per section

CREATE TABLE IF NOT EXISTS snapshots (
  id          UUID            DEFAULT gen_random_uuid() PRIMARY KEY,
  section     TEXT            NOT NULL,
  key         TEXT            NOT NULL DEFAULT 'latest',
  fetched_at  TIMESTAMPTZ     NOT NULL DEFAULT now(),
  payload     JSONB           NOT NULL,

  CONSTRAINT snapshots_section_key_uq UNIQUE (section, key)
);

-- Enable Row Level Security
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;

-- Allow anonymous reads (frontend fetches via anon key)
CREATE POLICY "Allow public read access"
  ON snapshots
  FOR SELECT
  USING (true);

-- Only service_role can insert/update (cron routes use service_role key)
CREATE POLICY "Allow service_role write access"
  ON snapshots
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
