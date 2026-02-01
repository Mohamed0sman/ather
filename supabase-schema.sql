-- ==========================================
-- ProjeX Database Schema - Reset & Recreate
-- Run this in Supabase SQL Editor
-- ==========================================

-- Step 1: Drop all policies from all tables
DO $$ DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Step 2: Drop all tables (CASCADE to remove dependencies)
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS task_assignees CASCADE;
DROP TABLE IF EXISTS task_labels CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS sizes CASCADE;
DROP TABLE IF EXISTS priorities CASCADE;
DROP TABLE IF EXISTS labels CASCADE;
DROP TABLE IF EXISTS statuses CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Step 3: Drop the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ==========================================
-- Enable UUID extension
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- USERS TABLE
-- ==========================================
CREATE TABLE users (
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

-- ==========================================
-- PROJECTS TABLE
-- ==========================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  readme TEXT DEFAULT '',
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed BOOLEAN DEFAULT FALSE
);

-- ==========================================
-- PROJECT MEMBERS TABLE
-- ==========================================
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('read', 'write', 'admin', 'owner')),
  invitationStatus TEXT DEFAULT 'invited' CHECK (invitationStatus IN ('invited', 'accepted', 'declined', 'expired')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  UNIQUE(project_id, user_id)
);

-- ==========================================
-- STATUSES TABLE
-- ==========================================
CREATE TABLE statuses (
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

-- ==========================================
-- LABELS TABLE
-- ==========================================
CREATE TABLE labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- PRIORITIES TABLE
-- ==========================================
CREATE TABLE priorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT DEFAULT '',
  "order" INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- SIZES TABLE
-- ==========================================
CREATE TABLE sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT DEFAULT '',
  "order" INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TASKS TABLE
-- ==========================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  status_id UUID REFERENCES statuses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  "statusPosition" INTEGER NOT NULL DEFAULT 0,
  priority_id UUID REFERENCES priorities(id) ON DELETE SET NULL,
  size_id UUID REFERENCES sizes(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  startDate TIMESTAMPTZ,
  endDate TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TASK LABELS (Junction table)
-- ==========================================
CREATE TABLE task_labels (
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (task_id, label_id)
);

-- ==========================================
-- TASK ASSIGNEES (Junction table)
-- ==========================================
CREATE TABLE task_assignees (
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (task_id, user_id)
);

-- ==========================================
-- COMMENTS TABLE
-- ==========================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ACTIVITIES TABLE
-- ==========================================
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS POLICIES FOR USERS
-- ==========================================
CREATE POLICY "All users can view profiles" ON users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- ==========================================
-- RLS POLICIES FOR PROJECTS
-- ==========================================
CREATE POLICY "All users can view projects" ON projects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "All users can create projects" ON projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Owners can update projects" ON projects FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Owners can delete projects" ON projects FOR DELETE USING (created_by = auth.uid());

-- ==========================================
-- RLS POLICIES FOR PROJECT MEMBERS
-- ==========================================
CREATE POLICY "All users can view project members" ON project_members FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Owners can manage members" ON project_members FOR ALL USING (
  project_id IN (SELECT id FROM projects WHERE created_by = auth.uid())
);

-- ==========================================
-- RLS POLICIES FOR STATUSES
-- ==========================================
CREATE POLICY "All users can view statuses" ON statuses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Owners can manage statuses" ON statuses FOR ALL USING (
  project_id IN (SELECT id FROM projects WHERE created_by = auth.uid())
);

-- ==========================================
-- RLS POLICIES FOR LABELS
-- ==========================================
CREATE POLICY "All users can view labels" ON labels FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Owners can manage labels" ON labels FOR ALL USING (
  project_id IN (SELECT id FROM projects WHERE created_by = auth.uid())
);

-- ==========================================
-- RLS POLICIES FOR PRIORITIES
-- ==========================================
CREATE POLICY "All users can view priorities" ON priorities FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Owners can manage priorities" ON priorities FOR ALL USING (
  project_id IN (SELECT id FROM projects WHERE created_by = auth.uid())
);

-- ==========================================
-- RLS POLICIES FOR SIZES
-- ==========================================
CREATE POLICY "All users can view sizes" ON sizes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Owners can manage sizes" ON sizes FOR ALL USING (
  project_id IN (SELECT id FROM projects WHERE created_by = auth.uid())
);

-- ==========================================
-- RLS POLICIES FOR TASKS
-- ==========================================
CREATE POLICY "All users can view tasks" ON tasks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "All users can create tasks" ON tasks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "All users can update tasks" ON tasks FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Owners can delete tasks" ON tasks FOR DELETE USING (
  project_id IN (SELECT id FROM projects WHERE created_by = auth.uid())
);

-- ==========================================
-- RLS POLICIES FOR TASK LABELS
-- ==========================================
CREATE POLICY "All users can manage task labels" ON task_labels FOR ALL USING (auth.role() = 'authenticated');

-- ==========================================
-- RLS POLICIES FOR TASK ASSIGNEES
-- ==========================================
CREATE POLICY "All users can manage task assignees" ON task_assignees FOR ALL USING (auth.role() = 'authenticated');

-- ==========================================
-- RLS POLICIES FOR COMMENTS
-- ==========================================
CREATE POLICY "All users can view comments" ON comments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "All users can create comments" ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (user_id = auth.uid());

-- ==========================================
-- RLS POLICIES FOR ACTIVITIES
-- ==========================================
CREATE POLICY "All users can view activities" ON activities FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "All users can create activities" ON activities FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ==========================================
-- TRIGGER TO AUTO-CREATE USER PROFILE
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.app_metadata->>'provider'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- CONFIRM SETUP COMPLETE
-- ==========================================
SELECT 'Database reset complete! All tables and policies recreated.' as status;
