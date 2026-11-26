CREATE TABLE inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  project_type TEXT NOT NULL,
  goal TEXT NOT NULL,
  timing TEXT NOT NULL,
  budget TEXT NOT NULL,
  created_at TEXT NOT NULL,
  lead_status TEXT NOT NULL DEFAULT 'New' CHECK (lead_status IN ('New', 'Contacted', 'Closed')),
  project_name TEXT,
  project_status TEXT CHECK (project_status IN ('Planned', 'In progress', 'On hold', 'Complete')),
  notes TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 0,
  CHECK ((project_name IS NULL) = (project_status IS NULL))
);
CREATE INDEX inquiries_created_at ON inquiries (created_at DESC, id DESC);
