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
import { TASK_COLUMNS, type TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function KanbanBoard({ projectId }: { projectId: string }) {
  const tasks = useBoardStore((s) => s.tasks);
  const moveTask = useBoardStore((s) => s.moveTask);

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

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid auto-cols-[minmax(280px,1fr)] grid-flow-col gap-4 overflow-x-auto pb-4 lg:grid-flow-row lg:grid-cols-4">
        {TASK_COLUMNS.map((col) => (
          <div key={col.id} className="flex min-w-[280px] flex-col rounded-2xl bg-muted/40 p-3">
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">{col.label}</h3>
                <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
                  {columns[col.id].length}
                </span>
              </div>
              <button className="text-muted-foreground transition-colors hover:text-foreground">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "flex min-h-[120px] flex-1 flex-col gap-2.5 rounded-xl p-1 transition-colors",
                    snapshot.isDraggingOver && "bg-accent/40",
                  )}
                >
                  {columns[col.id].map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(prov, snap) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                        >
                          <TaskCard task={task} dragging={snap.isDragging} />
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
