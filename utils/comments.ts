import { createClient } from './supabase/client';
import { throwSupabaseError } from './error-utils';

export const comments = {
  // Get all comments for a task
  getTaskComments: async (taskId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('comments')
      .select(
        `
        id,
        content,
        created_at,
        updated_at,
        task_id,
        user:user_id (
          id,
          name,
          avatar,
          description,
          links
        )
      `
      )
      .eq('task_id', taskId)
      .order('created_at', { ascending: true }); // Show oldest comments first

    if (error) throwSupabaseError(error, 'Failed to fetch comments');
    return data as CommentResponse[];
  },

  // Create a new comment
  create: async (comment: {
    task_id: string;
    user_id: string;
    content: string;
  }) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('comments')
      .insert({
        ...comment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(
        `
        id,
        content,
        created_at,
        updated_at,
        task_id,
        user:user_id (
          id,
          name,
          avatar,
          description,
          links
        )
      `
      )
      .single();

    if (error) throwSupabaseError(error, 'Failed to create comment');
    return data as CommentResponse;
  },

  // Delete a comment
  delete: async (commentId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throwSupabaseError(error, 'Failed to delete comment');
  },

  // Update a comment
  update: async (commentId: string, updates: { content: string }) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('comments')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .select(
        `
        id,
        content,
        created_at,
        updated_at,
        task_id,
        user:user_id (
          id,
          name,
          avatar,
          description,
          links
        )
      `
      )
      .single();

    if (error) throwSupabaseError(error, 'Failed to update comment');
    return data as CommentResponse;
  },
};
