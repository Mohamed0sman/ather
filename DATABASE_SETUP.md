# Database Setup Guide

This guide will help you set up the Supabase database for your ATHER project.

## Option 1: Run SQL Manually (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **iosxrgofjxhmuzghghkuwy**
3. Click **SQL Editor** in the left sidebar
4. Copy the contents of `supabase-schema.sql`
5. Paste it into the SQL Editor
6. Click **Run** to execute

## Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
supabase db push
```

## What the SQL Does

The `supabase-schema.sql` file creates:

### Tables:
- `users` - User profiles (linked to auth.users)
- `projects` - Project data
- `project_members` - Project membership
- `statuses` - Board columns
- `labels` - Task labels
- `priorities` - Task priorities
- `sizes` - Task sizes
- `tasks` - Task items
- `task_labels` - Task-Label relationships
- `task_assignees` - Task-Assignee relationships
- `comments` - Task comments
- `activities` - Activity log

### Security:
- Enables Row Level Security (RLS)
- Creates policies that allow all authenticated users to:
  - View all projects and tasks
  - Create new projects and tasks
  - Update tasks (all users)
- Only project owners can:
  - Delete projects
  - Delete tasks

### Auto-Creation:
- Creates a user profile automatically when a new user signs up

## After Setup

1. Restart your development server
2. Try creating a new project
3. If you still see errors, check the browser console for details

## Troubleshooting

### "Policy already exists" error:
This means the policies were already created. The schema has been updated to drop existing policies first. Just run it again.

### Tables don't exist:
Make sure you clicked **Run** in the SQL Editor and saw the success message.

### Authentication errors:
- Make sure Email/Password auth is enabled in Supabase → Authentication → Providers
- Set site URL in Supabase → Authentication → URL Configuration
