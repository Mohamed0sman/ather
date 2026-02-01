# 🚀 Complete Database Setup for ATHER

## Correct SQL Script Based on Original Schema

### 1. Go to Supabase SQL Editor
Visit: https://supabase.com/dashboard/project/iosxrgofjxhmuzghkuwy/sql

### 2. Run This Complete SQL Script:
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- USERS TABLE (Custom profile data)
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  links JSONB DEFAULT '[]',
  provider TEXT NOT NULL CHECK (provider IN ('google', 'github', 'email')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Enable realtime for users
ALTER TABLE users REPLICA IDENTITY FULL;

-- ==========================================
-- PROJECTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  readme TEXT DEFAULT '',
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed BOOLEAN DEFAULT FALSE
);

-- Enable RLS for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can create own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create own projects" ON projects
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (created_by = auth.uid());

-- Enable realtime for projects
ALTER TABLE projects REPLICA IDENTITY FULL;

-- ==========================================
-- PROJECT MEMBERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('read', 'write', 'admin', 'owner')),
  invitationStatus TEXT DEFAULT 'invited' CHECK (invitationStatus IN ('invited', 'accepted', 'declined', 'expired')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  UNIQUE(project_id, user_id)
);

-- Enable RLS for project_members
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Create policies for project_members
CREATE POLICY "Project members can view membership" ON project_members
  FOR SELECT USING (user_id = auth.uid() OR project_id IN (
    SELECT project_id FROM project_members WHERE user_id = auth.uid() AND invitationStatus = 'accepted'
  ));

-- ==========================================
-- STATUSES TABLE (Board columns)
-- ==========================================
CREATE TABLE IF NOT EXISTS statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT DEFAULT '',
  "order" INTEGER NOT NULL,
  "limit" INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for statuses
ALTER TABLE statuses ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- LABELS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for labels
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- SIZES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for sizes
ALTER TABLE sizes ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- PRIORITIES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS priorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for priorities
ALTER TABLE priorities ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- TASKS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  status_id UUID REFERENCES statuses(id) ON DELETE SET NULL,
  label_id UUID REFERENCES labels(id) ON DELETE SET NULL,
  size_id UUID REFERENCES sizes(id) ON DELETE SET NULL,
  priority_id UUID REFERENCES priorities(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  assignees JSONB DEFAULT '[]',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Enable realtime for all tables
ALTER TABLE statuses REPLICA IDENTITY FULL;
ALTER TABLE labels REPLICA IDENTITY FULL;
ALTER TABLE sizes REPLICA IDENTITY FULL;
ALTER TABLE priorities REPLICA IDENTITY FULL;
ALTER TABLE project_members REPLICA IDENTITY FULL;
ALTER TABLE tasks REPLICA IDENTITY FULL;
```

### 3. After Running SQL:
- All tables will be created with correct column names
- Create Account should work perfectly
- Full app functionality will be available

### 4. Test Account Creation:
Go to http://localhost:3000/create-account and try creating an account.