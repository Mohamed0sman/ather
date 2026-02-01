# 🚀 Fixed Database Setup for ATHER

## Corrected SQL Script
The previous script had column order issues. Use this corrected version:

### 1. Go to Supabase SQL Editor
Visit: https://supabase.com/dashboard/project/iosxrgofjxhmuzghkuwy/sql

### 2. Run This Fixed SQL Script:
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
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

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create policies for users
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Enable realtime for users
ALTER TABLE users REPLICA IDENTITY FULL;

-- PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE
);

-- Enable RLS for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can create own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

-- Create policies for projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can create own projects" ON projects
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (owner_id = auth.uid());

-- Enable realtime for projects
ALTER TABLE projects REPLICA IDENTITY FULL;
```

### 3. After Running SQL:
- The tables will be created correctly
- All policies will be set properly
- Create Account should work

### 4. Test Again:
Go to http://localhost:3000/create-account and try creating an account.

## What was fixed:
- Put owner_id at the end of projects table (after all other columns)
- Added DROP POLICY statements to avoid conflicts
- Ensured proper table creation order