import { useState, useCallback } from 'react';
import { todoService } from '../services/todoService';
import { Todo } from '../types';

export function useTodos() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTodos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await todoService.getAll();
            setTodos(data);
        } catch (err) {
            setError('Gagal memuat todo');
            setTodos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const addTodo = async (title: string): Promise<Todo | null> => {
        const trimmedTitle = title.trim();
        if (!trimmedTitle) return null;

        setError(null);
        try {
            const newTodo = await todoService.create(trimmedTitle);
            setTodos((prev) => [...prev, newTodo]);
            return newTodo;
        } catch (err) {
            setError('Gagal menambah todo');
            return null;
        }
    };

    const toggleTodo = async (id: string): Promise<Todo | null> => {
        const currentTodo = todos.find((todo) => todo.id === id);
        if (!currentTodo) return null;

        const nextDone = !currentTodo.done;
        setError(null);
        try {
            const updatedTodo = await todoService.update(id, nextDone);
            setTodos((prev) =>
                prev.map((todo) => (todo.id === id ? updatedTodo : todo))
            );
            return updatedTodo;
        } catch (err) {
            setError('Gagal mengupdate todo');
            return null;
        }
    };

    const removeTodo = async (id: string): Promise<boolean> => {
        setError(null);
        try {
            await todoService.remove(id);
            setTodos((prev) => prev.filter((todo) => todo.id !== id));
            return true;
        } catch (err) {
            setError('Gagal menghapus todo');
            return false;
        }
    };

    return {
        todos,
        loading,
        error,
        fetchTodos,
        addTodo,
        toggleTodo,
        removeTodo,
    };
}