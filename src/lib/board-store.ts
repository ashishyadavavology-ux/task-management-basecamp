import { create } from "zustand";
import { tasks as seedTasks } from "./mock-data";
import type { Task, TaskStatus } from "./types";

interface BoardState {
  tasks: Task[];
  moveTask: (taskId: string, toStatus: TaskStatus, toIndex: number) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, patch: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  tasks: seedTasks,
  moveTask: (taskId, toStatus, toIndex) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) return state;
      const rest = state.tasks.filter((t) => t.id !== taskId);
      const updated = { ...task, status: toStatus };
      const inColumn = rest
        .filter((t) => t.projectId === task.projectId && t.status === toStatus)
        .sort((a, b) => a.order - b.order);
      inColumn.splice(toIndex, 0, updated);
      const reordered = inColumn.map((t, i) => ({ ...t, order: i }));
      const others = rest.filter(
        (t) => !(t.projectId === task.projectId && t.status === toStatus),
      );
      return { tasks: [...others, ...reordered] };
    }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (taskId, patch) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
    })),
  deleteTask: (taskId) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== taskId) })),
}));
