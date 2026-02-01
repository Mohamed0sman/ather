import { createClient } from './supabase/client';

// Helper function to safely extract error messages
function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  } else if (error && typeof error === 'object') {
    const errObj = error as Record<string, unknown>;
    if (typeof errObj.message === 'string') {
      return errObj.message;
    } else if (typeof errObj.error_description === 'string') {
      return errObj.error_description;
    } else if (typeof errObj.details === 'string') {
      return errObj.details;
    }
    // Safe fallback
    return 'Unknown error';
  }
  if (error !== null && error !== undefined) {
    // Only use String() for primitive values
    const type = typeof error;
    if (type === 'string') return error as string;
    if (type === 'number') return String(error);
    if (type === 'boolean') return String(error);
  }
  return 'Unknown error';
}

export const projects = {
  // Project management
  management: {
    create: async (projectData: ProjectWithOptions, userId: string) => {
      const supabase = createClient();
      try {
        // 1. Create project first
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .insert({
            name: projectData.name,
            description: projectData.description,
            readme: projectData.readme,
            created_by: userId,
            updated_at: new Date(),
            closed: false,
          })
          .select()
          .single();

        if (projectError) {
          // Handle Supabase error objects with proper message extraction
          let errorMessage = 'Unknown database error';
          
          if (projectError instanceof Error) {
            errorMessage = projectError.message;
          } else if (projectError && typeof projectError === 'object') {
            const errObj = projectError as Record<string, unknown>;
            if (typeof errObj.message === 'string') {
              errorMessage = errObj.message;
            } else if (typeof errObj.details === 'string') {
              errorMessage = errObj.details;
            } else if (typeof errObj.hint === 'string') {
              errorMessage = `${errObj.message || 'Database error'}: ${errObj.hint}`;
            }
          }
          
          // If table doesn't exist, throw a more user-friendly error
          if (errorMessage.includes('does not exist') || projectError.code === 'PGRST116') {
            throw new Error('Database tables not created. Please run the SQL schema in Supabase.');
          }
          
          // For foreign key violations, provide specific guidance
          if (errorMessage.includes('violates foreign key') || errorMessage.includes('not present in table')) {
            throw new Error('Referenced data does not exist. Please ensure all required data is set up first.');
          }
          
          throw new Error(`Database error: ${extractErrorMessage(projectError)}`);
        }

        // 2. If not skipping default options, create them
        if (projectData.statuses) {
          const { error: statusError } = await supabase.from('statuses').insert(
            projectData.statuses.map((status, index) => ({
              ...status,
              project_id: project.id,
              order: index,
              limit: 5,
              updated_at: new Date(),
            }))
          );
          if (statusError) {
            // Provide context-aware error message
            if (statusError.message?.includes('does not exist')) {
              throw new Error('Statuses table not found. Please run the SQL schema in Supabase.');
            }
            throw new Error(`Failed to create statuses: ${extractErrorMessage(statusError)}`);
          }
        }

        if (projectData.labels) {
          const { error: labelError } = await supabase.from('labels').insert(
            projectData.labels.map((label) => ({
              ...label,
              project_id: project.id,
              updated_at: new Date(),
            }))
          );
          if (labelError) {
            if (labelError.message?.includes('does not exist')) {
              throw new Error('Labels table not found. Please run the SQL schema in Supabase.');
            }
            throw new Error(`Failed to create labels: ${extractErrorMessage(labelError)}`);
          }
        }

        if (projectData.priorities) {
          const { error: priorityError } = await supabase
            .from('priorities')
            .insert(
              projectData.priorities.map((priority) => ({
                ...priority,
                project_id: project.id,
                updated_at: new Date(),
              }))
            );
          if (priorityError) {
            if (priorityError.message?.includes('does not exist')) {
              throw new Error('Priorities table not found. Please run the SQL schema in Supabase.');
            }
            throw new Error(`Failed to create priorities: ${extractErrorMessage(priorityError)}`);
          }
        }

        if (projectData.sizes) {
          const { error: sizeError } = await supabase.from('sizes').insert(
            projectData.sizes.map((size) => ({
              ...size,
              project_id: project.id,
              updated_at: new Date(),
            }))
          );
          if (sizeError) {
            if (sizeError.message?.includes('does not exist')) {
              throw new Error('Sizes table not found. Please run the SQL schema in Supabase.');
            }
            throw new Error(`Failed to create sizes: ${extractErrorMessage(sizeError)}`);
          }
        }

        return project;
      } catch (error) {
        throw error;
      }
    },
    update: async (projectId: string, updates: Partial<IProject>) => {
      const supabase = createClient();
      const { error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date(),
        })
        .eq('id', projectId);

      if (error) throw error;
    },
    delete: async (projectId: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
    },
    close: async (projectId: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from('projects')
        .update({
          closed: true,
          updated_at: new Date(),
        })
        .eq('id', projectId);

      if (error) throw error;
    },
    reopen: async (projectId: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from('projects')
        .update({
          closed: false,
          updated_at: new Date(),
        })
        .eq('id', projectId);

      if (error) throw error;
    },
  },

  // Project options/fields
  fields: {
    getStatuses: async (projectId: string) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('statuses')
        .select('*')
        .eq('project_id', projectId)
        .order('order');

      if (error) throw error;
      return data;
    },
    getLabels: async (projectId: string) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('labels')
        .select('*')
        .eq('project_id', projectId);

      if (error) throw error;
      return data;
    },
    getPriorities: async (projectId: string) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('priorities')
        .select('*')
        .eq('project_id', projectId)
        .order('order');

      if (error) throw error;
      return data;
    },
    getSizes: async (projectId: string) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('sizes')
        .select('*')
        .eq('project_id', projectId)
        .order('order');

      if (error) throw error;
      return data;
    },
  },

  // Project members
  members: {
    getAll: async (projectId: string) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('project_members')
        .select(
          `
          user:users (
            id,
            name,
            avatar,
            description,
            links
          )
        `
        )
        .eq('project_id', projectId);

      if (error) throw error;
      return (data as any[]).map((m) => m.user) as IUser[];
    },
    getProjectOwner: async (projectId: string) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('projects')
        .select(
          `
          creator:created_by (
            id,
            name,
            email,
            avatar,
            description,
            links,
            created_at,
            updated_at
          )
        `
        )
        .eq('id', projectId)
        .single();

      if (error) throw error;
      if (!data?.creator) return null;

      const creator = data.creator as Record<string, any>;

      return {
        id: creator.id,
        name: creator.name,
        email: creator.email,
        avatar: creator.avatar,
        description: creator.description,
        links: creator.links,
        created_at: creator.created_at,
        updated_at: creator.updated_at,
      } as IUser;
    },
  },

  // User's projects - returns all projects for all authenticated users
  getUserProjects: async (userId: string) => {
    const supabase = createClient();
    try {
      // Get ALL projects (since all authenticated users can see all projects)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist, return empty array
        if (error.message.includes('does not exist') || error.code === 'PGRST116') {
          return [];
        }
        throw error;
      }

      return (data as IProject[]) || [];
    } catch (err) {
      console.error('Error fetching projects:', err);
      return [];
    }
  },
};
