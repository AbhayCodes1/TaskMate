import { useState, useCallback, useEffect } from 'react';
import { DEFAULT_LISTS } from '../types/task';
import type { TaskList } from '../types/task';

const STORAGE_KEY = 'taskmate_lists';

function loadLists(): TaskList[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as TaskList[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* ignore parse errors */
  }
  return DEFAULT_LISTS;
}

function saveLists(lists: TaskList[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  } catch {
    /* ignore storage errors (private browsing quota) */
  }
}

const LIST_ICONS = ['📋', '🌱', '⚡', '💪', '💼', '📚', '🏠', '🚀', '🎯', '🎨', '🔬', '💡', '🧘', '🏃', '🍎'];
const LIST_COLORS = ['indigo', 'emerald', 'amber', 'rose', 'blue', 'violet', 'orange'];

export function useLists() {
  const [lists, setLists] = useState<TaskList[]>(loadLists);

  // Persist whenever lists change
  useEffect(() => {
    saveLists(lists);
  }, [lists]);

  const addList = useCallback((name: string, icon?: string, color?: string): TaskList => {
    const id = `list-${Date.now()}`;
    const chosenColor = color ?? LIST_COLORS[Math.floor(Math.random() * LIST_COLORS.length)];
    const chosenIcon = icon ?? LIST_ICONS[Math.floor(Math.random() * LIST_ICONS.length)];
    const newList: TaskList = { id, name: name.trim(), icon: chosenIcon, color: chosenColor };
    setLists((prev) => [...prev, newList]);
    return newList;
  }, []);

  const deleteList = useCallback((listId: string) => {
    setLists((prev) => prev.filter((l) => l.id !== listId));
  }, []);

  const updateList = useCallback((listId: string, updates: Partial<Omit<TaskList, 'id'>>) => {
    setLists((prev) => prev.map((l) => (l.id === listId ? { ...l, ...updates } : l)));
  }, []);

  return { lists, addList, deleteList, updateList, LIST_ICONS, LIST_COLORS };
}
