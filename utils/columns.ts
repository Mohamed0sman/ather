import { createClient } from '@/utils/supabase/client';
import { throwSupabaseError } from './error-utils';

export const columns = {
  updateLimit: async (columnId: string, limit: number) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('statuses')
      .update({ limit })
      .eq('id', columnId)
      .select()
      .single();

    if (error) throwSupabaseError(error, 'Failed to update column limit');
    return data;
  },

  updateDetails: async (columnId: string, updates: Partial<ICustomFieldData>) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('statuses')
      .update(updates)
      .eq('id', columnId)
      .select()
      .single();

    if (error) throwSupabaseError(error, 'Failed to update column details');
    return data;
  },

  deleteColumn: async (columnId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('statuses')
      .delete()
      .eq('id', columnId);

    if (error) throwSupabaseError(error, 'Failed to delete column');
  },

  createColumn: async (
    projectId: string,
    data: Omit<ICustomFieldData, 'id'>
  ) => {
    const supabase = createClient();
    const { data: column, error } = await supabase
      .from('statuses')
      .insert({
        ...data,
        project_id: projectId,
        limit: 5,
        order: await columns.getNextOrder(projectId),
      })
      .select()
      .single();

    if (error) throwSupabaseError(error, 'Failed to create column');
    return column;
  },

  getNextOrder: async (projectId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('statuses')
      .select('order')
      .eq('project_id', projectId)
      .order('order', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116')
      throwSupabaseError(error, 'Failed to get next column order');
    return (data?.order ?? -1) + 1;
  },
};
