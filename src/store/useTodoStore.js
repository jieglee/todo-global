import { supabase } from "@/src/lib/supabase";
import { create } from "zustand";

export const useTodoStore = create((set, get) => ({
    todos: [],
    loading: false,
    error: null,

    fetchTodos: async () => {
        set({ loading: true, error: null });

        const { data, error } = await supabase
            .from("todos")
            .select("*")
            .order("created_at", { ascending: true });

        if (error) {
            set({ loading: false, error: error.message });
            return;
        }

        set({
            todos: (data ?? []).map((todo) => ({
                id: todo.id,
                title: todo.title,
                done: Boolean(todo.done),
            })),
            loading: false,
            error: null,
        });
    },

    addTodo: async (title) => {
        const trimmedTitle = title.trim();

        if (!trimmedTitle) {
            return;
        }

        const { data, error } = await supabase
            .from("todos")
            .insert({ title: trimmedTitle, done: false })
            .select()
            .single();

        if (error) {
            set({ error: error.message });
            return;
        }

        set((state) => ({
            todos: [
                ...state.todos,
                { id: data.id, title: data.title, done: Boolean(data.done) },
            ],
            error: null,
        }));
    },

    toggleTodo: async (id) => {
        const currentTodo = get().todos.find((todo) => todo.id === id);

        if (!currentTodo) {
            return;
        }

        const nextDone = !currentTodo.done;

        const { data, error } = await supabase
            .from("todos")
            .update({ done: nextDone })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            set({ error: error.message });
            return;
        }

        set((state) => ({
            todos: state.todos.map((todo) =>
                todo.id === id ? { ...todo, done: Boolean(data.done) } : todo,
            ),
            error: null,
        }));
    },

    removeTodo: async (id) => {
        const { error } = await supabase.from("todos").delete().eq("id", id);

        if (error) {
            set({ error: error.message });
            return;
        }

        set((state) => ({
            todos: state.todos.filter((todo) => todo.id !== id),
            error: null,
        }));
    },
}));