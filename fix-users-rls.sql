-- ==========================================
-- FIX: Add INSERT policy for users table
-- ==========================================
-- This policy allows users to insert (create) their own profile
-- Note: The UPDATE policy already allows users to update their own profile

-- First, let's drop and recreate the users policies to include INSERT
DROP POLICY IF EXISTS "All users can view profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Recreate policies with INSERT capability
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Verify the policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users';
