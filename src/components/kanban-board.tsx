import { useMemo } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { TaskCard } from "@/components/task-card";
import { useBoardStore } from "@/lib/board-store";
import { useAppData } from "@/hooks/use-app-data";
import { TASK_COLUMNS, type TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const COLUMN_STYLES: Record<TaskStatus, string> = {
  todo: "bg-kanban-todo",
  in_progress: "bg-kanban-progress",
  review: "bg-kanban-review",
  done: "bg-kanban-done",
};

const COLUMN_DOTS: Record<TaskStatus, string> = {
  todo: "bg-chart-4",
  in_progress: "bg-warning",
  review: "bg-chart-3",
  done: "bg-success",
};

export function KanbanBoard({ projectId }: { projectId: string }) {
  const tasks = useBoardStore((s) => s.tasks);
  const { moveTask, createTask, userById } = useAppData();

  const columns = useMemo(() => {
    const map: Record<TaskStatus, typeof tasks> = {
      todo: [],
      in_progress: [],
      review: [],
      done: [],
    };
    tasks
      .filter((t) => t.projectId === projectId)
      .sort((a, b) => a.order - b.order)
      .forEach((t) => map[t.status].push(t));
    return map;
  }, [tasks, projectId]);

  const onDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    moveTask(draggableId, destination.droppableId as TaskStatus, destination.index);
  };

  const addTask = () => {
    const title = window.prompt("Task title");
    if (title?.trim()) createTask(projectId, title.trim());
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid auto-cols-[minmax(280px,1fr)] grid-flow-col gap-4 overflow-x-auto pb-4 lg:grid-flow-row lg:grid-cols-4">
        {TASK_COLUMNS.map((col) => (
          <div
            key={col.id}
            className={cn("flex min-w-[280px] flex-col rounded-2xl p-3", COLUMN_STYLES[col.id])}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", COLUMN_DOTS[col.id])} />
                <h3 className="text-sm font-bold tracking-tight">{col.label}</h3>
                <span className="rounded-full bg-background/70 px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                  {columns[col.id].length}
                </span>
              </div>
              {col.id === "todo" && (
                <button
                  type="button"
                  onClick={addTask}
                  className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </div>
            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "flex min-h-[140px] flex-1 flex-col gap-2.5 rounded-xl p-1 transition-colors",
                    snapshot.isDraggingOver && "bg-background/40 ring-2 ring-primary/20 ring-inset",
                  )}
                >
                  {columns[col.id].map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(prov, snap) => (
                        <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}>
                          <TaskCard task={task} dragging={snap.isDragging} assignee={userById(task.assigneeId)} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
