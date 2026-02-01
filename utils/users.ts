import { createClient } from './supabase/client';
import type { User } from '@supabase/supabase-js';

export interface IUserLink {
  id: string;
  label: string;
  url: string;
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  description: string;
  avatar: string;
  created_at: Date;
  updated_at: Date;
  links: IUserLink[];
  provider: 'google' | 'github' | 'email';
}

// Helper to check if table exists by attempting a simple query
const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    const supabase = createClient();
    const { error } = await supabase.from(tableName).select('count').limit(1);
    // If no error about table not existing, table exists
    if (!error) return true;
    // Check for PostgreSQL error code for undefined table (42P01)
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

export const users = {
  getUser: async (id: string): Promise<IUser | null> => {
    try {
      // Check if table exists first
      const exists = await tableExists('users');
      if (!exists) return null;

      const supabase = createClient();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) return null;
      return data as IUser | null;
    } catch {
      return null;
    }
  },

  createUser: async (user: Partial<IUser>): Promise<IUser | null> => {
    try {
      // Check if table exists first
      const exists = await tableExists('users');
      if (!exists) return null;

      const supabase = createClient();
      const { data, error } = await supabase
        .from('users')
        .insert([user])
        .select()
        .single();

      if (error) return null;
      return data as IUser;
    } catch {
      return null;
    }
  },

  captureUserDetails: async (authUser: User): Promise<IUser | null> => {
    try {
      // Check if table exists first
      const exists = await tableExists('users');
      if (!exists) return null;

      // Check if user already exists - do NOT create new users here
      const existingUser = await users.getUser(authUser.id);
      if (!existingUser) {
        // User doesn't exist - return null, don't create
        console.warn('User profile does not exist, not creating automatically:', authUser.id);
        return null;
      }

      // User exists, update their details if needed
      const provider = authUser.app_metadata.provider as IUser['provider'];
      
      // Update the user with latest info from auth
      const updatedUser: Partial<IUser> = {
        email: authUser.email!,
        name: authUser.user_metadata.full_name || authUser.email!.split('@')[0],
        avatar: authUser.user_metadata.avatar_url || '',
        provider,
      };

      return await users.updateUser(authUser.id, updatedUser);
    } catch {
      return null;
    }
  },

  updateUser: async (id: string, updates: Partial<IUser>): Promise<IUser | null> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) return null;
      return data as IUser;
    } catch {
      return null;
    }
  },

  updateProfile: async (
    userId: string,
    updates: Partial<Omit<IUser, 'id' | 'email' | 'provider'>>
  ): Promise<void> => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

      if (error) return;

      // Update auth user metadata if avatar or name changed
      const metadata: { avatar_url?: string; full_name?: string } = {};

      if (updates.avatar !== undefined) {
        metadata.avatar_url = updates.avatar;
      }

      if (updates.name !== undefined) {
        metadata.full_name = updates.name;
      }

      if (Object.keys(metadata).length > 0) {
        await supabase.auth.updateUser({
          data: metadata,
        });
      }
    } catch {
      // Silently fail
    }
  },
};
