import { createClient } from '@/utils/supabase/server';
import { type IUser } from '@/utils/users';
import { AccountDetails } from './AccountDetails';
import { Projects } from './Projects';
import { redirect } from 'next/navigation';
import { projects } from '@/utils/projects';

export default async function ProjectsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Try to get user profile, create if doesn't exist
  let userData: IUser | null = null;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      userData = data as IUser;
    } else if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is OK
      // If error is about table not existing, create user anyway
      if (!error.message.includes('does not exist')) {
        console.warn('Error fetching user:', error);
      }
    }
  } catch (err) {
    // If table doesn't exist, we'll create user anyway
    console.warn('Exception fetching user (table may not exist):', err);
  }

  // If user profile doesn't exist or table doesn't exist, create it
  if (!userData) {
    try {
      const { error: insertError } = await supabase.from('users').insert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        provider: user.app_metadata?.provider || 'email',
        description: '',
        avatar: user.user_metadata?.avatar_url || '',
        links: [],
      });
      
      if (!insertError) {
        userData = {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          description: '',
          avatar: user.user_metadata?.avatar_url || '',
          created_at: new Date(),
          updated_at: new Date(),
          links: [],
          provider: (user.app_metadata?.provider || 'email') as 'email',
        };
      }
    } catch (err) {
      // If insert fails due to table not existing, still allow access
      console.warn('Exception creating user (table may not exist):', err);
      // Create user data anyway for UI purposes
      userData = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        description: '',
        avatar: user.user_metadata?.avatar_url || '',
        created_at: new Date(),
        updated_at: new Date(),
        links: [],
        provider: (user.app_metadata?.provider || 'email') as 'email',
      };
    }
  }
  
  // If still no user data, create default
  if (!userData) {
    userData = {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      description: '',
      avatar: user.user_metadata?.avatar_url || '',
      created_at: new Date(),
      updated_at: new Date(),
      links: [],
      provider: (user.app_metadata?.provider || 'email') as 'email',
    };
  }

  // Get user projects with error handling
  let userProjects: any[] = [];
  try {
    userProjects = await projects.getUserProjects(user.id);
  } catch (err) {
    console.warn('Error fetching projects (table may not exist):', err);
    userProjects = [];
  }

  return (
    <div className="w-[90%] flex flex-col md:flex-row mx-auto p-8 gap-4">
      <div className="w-full md:w-72">
        <AccountDetails initialData={userData} />
      </div>
      <div className="flex-1">
        <Projects initialProjects={userProjects} />
      </div>
    </div>
  );
}
