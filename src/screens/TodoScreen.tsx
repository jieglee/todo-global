import { useThemeStore } from '@/src/store/useThemeStore';
import { useTodos } from '@/src/hooks/useTodos';
import { TodoItem } from '@/src/components/TodoItem';
import React, { useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { getThemeColors, ThemeMode } from '@/src/constants';

type Filter = 'all' | 'active' | 'done';

export default function TodoScreen() {
    const [newTodo, setNewTodo] = useState('');
    const [filter, setFilter] = useState<Filter>('all');

    const isDarkMode = useThemeStore((state) => state.isDarkMode);
    const toggleTheme = useThemeStore((state) => state.toggleTheme);
    const themeMode: ThemeMode = isDarkMode ? 'dark' : 'light';
    const theme = getThemeColors(themeMode);

    const { todos, loading, fetchTodos, addTodo, toggleTodo, removeTodo } = useTodos();

    useEffect(() => {
        fetchTodos();
    }, [fetchTodos]);

    const todoList = todos as Array<{ id: string; title: string; done: boolean }>;

    const visibleTodos = useMemo(() => {
        if (filter === 'active') {
            return todoList.filter((todo) => !todo.done);
        }

        if (filter === 'done') {
            return todoList.filter((todo) => todo.done);
        }

        return todoList;
    }, [filter, todoList]);

    const completedCount = todoList.filter((todo) => todo.done).length;

    const handleAddTodo = () => {
        const trimmed = newTodo.trim();

        if (!trimmed) {
            return;
        }

        addTodo(trimmed);
        setNewTodo('');
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={[styles.header, { backgroundColor: theme.panel, borderColor: theme.border }]}>
                    <View>
                        <Text style={[styles.eyebrow, { color: theme.muted }]}>Today</Text>
                        <Text style={[styles.title, { color: theme.text }]}>My tasks</Text>
                    </View>

                    <Pressable
                        accessibilityRole="button"
                        onPress={toggleTheme}
                        style={[styles.themeButton, { backgroundColor: theme.primarySoft }]}
                    >
                        <Text style={[styles.themeButtonText, { color: theme.primary }]}>
                            {isDarkMode ? 'Light' : 'Dark'}
                        </Text>
                    </Pressable>
                </View>

                <View style={[styles.summaryRow, { backgroundColor: theme.panel, borderColor: theme.border }]}>
                    <View>
                        <Text style={[styles.summaryLabel, { color: theme.muted }]}>Completed</Text>
                        <Text style={[styles.summaryValue, { color: theme.text }]}>{completedCount}/{todos.length}</Text>
                    </View>
                    <Text style={[styles.summaryHint, { color: theme.primary }]}>
                        {todos.length === 0 ? 'No tasks yet' : `${visibleTodos.length} visible`}
                    </Text>
                </View>

                <View style={[styles.inputRow, { backgroundColor: theme.panel, borderColor: theme.border }]}>
                    <TextInput
                        value={newTodo}
                        onChangeText={setNewTodo}
                        placeholder="Add a task..."
                        placeholderTextColor={theme.muted}
                        returnKeyType="done"
                        onSubmitEditing={handleAddTodo}
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.input,
                                color: theme.text,
                                borderColor: theme.border,
                            },
                        ]}
                    />

                    <Pressable
                        accessibilityRole="button"
                        onPress={handleAddTodo}
                        style={[styles.addButton, { backgroundColor: theme.primary }]}
                    >
                        <Text style={styles.addButtonText}>Add</Text>
                    </Pressable>
                </View>

                <View style={styles.filterRow}>
                    {(['all', 'active', 'done'] as Filter[]).map((option) => (
                        <Pressable
                            key={option}
                            accessibilityRole="button"
                            onPress={() => setFilter(option)}
                            style={[
                                styles.filterButton,
                                {
                                    backgroundColor: filter === option ? theme.primary : theme.panel,
                                    borderColor: theme.border,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    { color: filter === option ? '#ffffff' : theme.text },
                                ]}
                            >
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                <FlatList
                    data={visibleTodos}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={[styles.emptyState, { backgroundColor: theme.panel, borderColor: theme.border }]}>
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>Nothing here yet</Text>
                            <Text style={[styles.emptyText, { color: theme.muted }]}>
                                Start by adding a task to keep your day on track.
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TodoItem
                            item={item}
                            onToggle={() => toggleTodo(item.id)}
                            onDelete={() => removeTodo(item.id)}
                        />
                    )}
                    showsVerticalScrollIndicator={false}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingVertical: 16,
        borderRadius: 18,
        borderWidth: 1,
        marginBottom: 16,
    },
    eyebrow: {
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 6,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
    },
    themeButton: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
    },
    themeButtonText: {
        fontWeight: '600',
        fontSize: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingVertical: 16,
        borderRadius: 18,
        borderWidth: 1,
        marginBottom: 16,
    },
    summaryLabel: {
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    summaryValue: {
        marginTop: 4,
        fontSize: 22,
        fontWeight: '700',
    },
    summaryHint: {
        fontSize: 13,
        fontWeight: '600',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: 18,
        borderWidth: 1,
        marginBottom: 16,
    },
    input: {
        flex: 1,
        minHeight: 48,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
    },
    addButton: {
        minWidth: 78,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    filterRow: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 8,
    },
    filterButton: {
        flex: 1,
        borderRadius: 12,
        borderWidth: 1,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    listContent: {
        paddingBottom: 20,
        gap: 10,
    },
    emptyState: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20,
    },
});