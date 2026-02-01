import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { name, description, readme, skipDefaultOptions } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    // Create server-side Supabase client
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'You must be logged in to create a project' }, { status: 401 });
    }

    // Check if user profile exists, if not create it
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existingUser) {
      // Create user profile
      const { error: createUserError } = await supabase.from('users').insert({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || user.email!.split('@')[0],
        avatar: user.user_metadata?.avatar_url || '',
        description: '',
        links: [],
        provider: (user.app_metadata?.provider as 'google' | 'github' | 'email') || 'email',
      });

      if (createUserError) {
        // If profile already exists, ignore the error
        if (!createUserError.message?.includes('duplicate key')) {
          return NextResponse.json({ error: 'Failed to create user profile: ' + createUserError.message }, { status: 500 });
        }
      }
    }

    // Create project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: name.trim(),
        description: description || '',
        readme: readme || '',
        created_by: user.id,
        updated_at: new Date().toISOString(),
        closed: false,
      })
      .select()
      .single();

    if (projectError) {
      // Check for foreign key violation
      if (projectError.message?.includes('violates foreign key') || projectError.code === '23503') {
        return NextResponse.json({ error: 'Your account is not fully set up. Please try signing out and signing in again to create your user profile.' }, { status: 400 });
      }
      return NextResponse.json({ error: projectError.message }, { status: 500 });
    }

    // If not skipping default options, create them
    if (!skipDefaultOptions) {
      // Create default statuses
      const statuses = [
        { label: 'To Do', color: '#6B7280', order: 0, limit: 5 },
        { label: 'In Progress', color: '#3B82F6', order: 1, limit: 5 },
        { label: 'Done', color: '#22C55E', order: 2, limit: 5 },
      ];

      const { error: statusError } = await supabase.from('statuses').insert(
        statuses.map((s, i) => ({
          ...s,
          project_id: project.id,
          order: i,
          limit: 5,
          updated_at: new Date().toISOString(),
        }))
      );

      if (statusError) {
        console.error('Error creating statuses:', statusError);
      }

      // Create default labels
      const labels = [
        { label: 'Bug', color: '#EF4444' },
        { label: 'Feature', color: '#3B82F6' },
        { label: 'Enhancement', color: '#8B5CF6' },
      ];

      const { error: labelError } = await supabase.from('labels').insert(
        labels.map((l) => ({
          ...l,
          project_id: project.id,
          updated_at: new Date().toISOString(),
        }))
      );

      if (labelError) {
        console.error('Error creating labels:', labelError);
      }

      // Create default priorities
      const priorities = [
        { label: 'High', color: '#EF4444', order: 0 },
        { label: 'Medium', color: '#F59E0B', order: 1 },
        { label: 'Low', color: '#22C55E', order: 2 },
      ];

      const { error: priorityError } = await supabase.from('priorities').insert(
        priorities.map((p) => ({
          ...p,
          project_id: project.id,
          updated_at: new Date().toISOString(),
        }))
      );

      if (priorityError) {
        console.error('Error creating priorities:', priorityError);
      }

      // Create default sizes
      const sizes = [
        { label: 'Small', color: '#22C55E', order: 0 },
        { label: 'Medium', color: '#F59E0B', order: 1 },
        { label: 'Large', color: '#EF4444', order: 2 },
      ];

      const { error: sizeError } = await supabase.from('sizes').insert(
        sizes.map((s) => ({
          ...s,
          project_id: project.id,
          updated_at: new Date().toISOString(),
        }))
      );

      if (sizeError) {
        console.error('Error creating sizes:', sizeError);
      }
    }

    return NextResponse.json({ success: true, projectId: project.id });
  } catch (err) {
    console.error('Error creating project:', err);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
