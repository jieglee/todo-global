import { supabase } from '../lib/supabase';
import { Todo } from '../types';

export const todoService = {
    getAll: async (): Promise<Todo[]> => {
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;
        return (data as Todo[]) ?? [];
    },

    create: async (title: string): Promise<Todo> => {
        const { data, error } = await supabase
            .from('todos')
            .insert({ title, done: false })
            .select()
            .single();

        if (error) throw error;
        return data as Todo;
    },

    update: async (id: string, done: boolean): Promise<Todo> => {
        const { data, error } = await supabase
            .from('todos')
            .update({ done })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Todo;
    },

    remove: async (id: string): Promise<void> => {
        const { error } = await supabase.from('todos').delete().eq('id', id);
        if (error) throw error;
    },
};