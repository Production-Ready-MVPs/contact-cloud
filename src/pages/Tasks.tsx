import { useState, useMemo } from "react";
import { Plus, Calendar, MoreHorizontal, CheckCircle2, Trash2, Pencil } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, isToday, isPast, isFuture, addDays } from "date-fns";
import { toast } from "sonner";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { DeleteTaskDialog } from "@/components/tasks/DeleteTaskDialog";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useToggleTaskStatus,
  useDeleteTask,
  useDeleteTasks,
  useBulkCompleteTask,
} from "@/hooks/useTasks";
import type { TaskWithRelations, TaskStatus, TaskPriority } from "@/hooks/useTasks";

function getPriorityBadgeVariant(priority: TaskPriority) {
  switch (priority) {
    case "high":
      return "destructive";
    case "medium":
      return "default";
    case "low":
      return "secondary";
    default:
      return "outline";
  }
}

function getDueDateBadge(dueDate: string | null) {
  if (!dueDate) return null;
  
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isPast(due) && !isToday(due)) {
    return <Badge variant="destructive">Overdue</Badge>;
  } else if (isToday(due)) {
    return <Badge className="bg-yellow-500 hover:bg-yellow-600">Due Today</Badge>;
  } else if (isFuture(due) && due <= addDays(today, 3)) {
    return <Badge variant="outline">Due Soon</Badge>;
  }
  return null;
}

function getStatusBadge(status: TaskStatus) {
  switch (status) {
    case "completed":
      return <Badge variant="secondary">Completed</Badge>;
    case "in_progress":
      return <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>;
    case "open":
      return <Badge variant="outline">Open</Badge>;
  }
}

export default function Tasks() {
  const { data: tasks = [], isLoading } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const toggleTaskStatus = useToggleTaskStatus();
  const deleteTask = useDeleteTask();
  const deleteTasks = useDeleteTasks();
  const bulkComplete = useBulkCompleteTask();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithRelations | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState<TaskWithRelations | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const openTasks = useMemo(() => tasks.filter((t) => t.status === "open"), [tasks]);
  const inProgressTasks = useMemo(() => tasks.filter((t) => t.status === "in_progress"), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((t) => t.status === "completed"), [tasks]);

  const handleCreateTask = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const handleEditTask = (task: TaskWithRelations) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleDeleteTask = (task: TaskWithRelations) => {
    setDeletingTask(task);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTask) return;
    
    try {
      await deleteTask.mutateAsync(deletingTask.id);
      toast.success("Task deleted successfully");
      setDeleteDialogOpen(false);
      setDeletingTask(null);
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const handleSubmitTask = async (data: {
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    due_date: Date | null;
    contact_id: string | null;
    deal_id: string | null;
  }) => {
    try {
      const taskData = {
        ...data,
        due_date: data.due_date?.toISOString().split("T")[0] ?? null,
      };

      if (editingTask) {
        await updateTask.mutateAsync({ id: editingTask.id, ...taskData });
        toast.success("Task updated successfully");
      } else {
        await createTask.mutateAsync(taskData);
        toast.success("Task created successfully");
      }
    } catch {
      toast.error(editingTask ? "Failed to update task" : "Failed to create task");
      throw new Error("Failed to save task");
    }
  };

  const handleToggleComplete = async (task: TaskWithRelations) => {
    const newStatus: TaskStatus = task.status === "completed" ? "open" : "completed";
    try {
      await toggleTaskStatus.mutateAsync({ id: task.id, status: newStatus });
      toast.success(newStatus === "completed" ? "Task completed!" : "Task reopened");
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleSelectAll = (taskList: TaskWithRelations[], checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set([...selectedIds, ...taskList.map((t) => t.id)]));
    } else {
      const newSelected = new Set(selectedIds);
      taskList.forEach((t) => newSelected.delete(t.id));
      setSelectedIds(newSelected);
    }
  };

  const handleSelectTask = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkComplete = async () => {
    if (selectedIds.size === 0) return;
    
    try {
      await bulkComplete.mutateAsync(Array.from(selectedIds));
      toast.success(`${selectedIds.size} tasks completed`);
      setSelectedIds(new Set());
    } catch {
      toast.error("Failed to complete tasks");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    try {
      await deleteTasks.mutateAsync(Array.from(selectedIds));
      toast.success(`${selectedIds.size} tasks deleted`);
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
    } catch {
      toast.error("Failed to delete tasks");
    }
  };

  const TaskTableSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]"></TableHead>
          <TableHead>Task</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Related To</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-4 w-4" /></TableCell>
            <TableCell>
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
            <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
            <TableCell><Skeleton className="h-4 w-28" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const TaskTable = ({ taskList }: { taskList: TaskWithRelations[] }) => {
    const allSelected = taskList.length > 0 && taskList.every((t) => selectedIds.has(t.id));
    const someSelected = taskList.some((t) => selectedIds.has(t.id));

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => handleSelectAll(taskList, !!checked)}
                aria-label="Select all"
                {...(someSelected && !allSelected ? { "data-state": "indeterminate" } : {})}
              />
            </TableHead>
            <TableHead>Task</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Related To</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {taskList.map((task) => (
            <TableRow key={task.id} className={task.status === "completed" ? "opacity-60" : ""}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.has(task.id)}
                  onCheckedChange={(checked) => handleSelectTask(task.id, !!checked)}
                  aria-label={`Select ${task.title}`}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className="mt-0.5 shrink-0"
                  >
                    <CheckCircle2
                      className={`h-5 w-5 transition-colors ${
                        task.status === "completed"
                          ? "text-green-500 fill-green-500"
                          : "text-muted-foreground hover:text-green-500"
                      }`}
                    />
                  </button>
                  <div>
                    <p className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {task.due_date && (
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(task.due_date), "MMM d, yyyy")}
                    </div>
                  )}
                  {task.status !== "completed" && getDueDateBadge(task.due_date)}
                  {!task.due_date && <span className="text-muted-foreground">—</span>}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getPriorityBadgeVariant(task.priority)}>
                  {task.priority}
                </Badge>
              </TableCell>
              <TableCell>
                {getStatusBadge(task.status)}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {task.contacts && <p>{task.contacts.name}</p>}
                  {task.deals && (
                    <p className="text-muted-foreground">{task.deals.name}</p>
                  )}
                  {!task.contacts && !task.deals && (
                    <p className="text-muted-foreground">—</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditTask(task)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleComplete(task)}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {task.status === "completed" ? "Mark Open" : "Mark Complete"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteTask(task)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {taskList.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No tasks found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage your to-dos and follow-ups
          </p>
        </div>
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <>
              <Button variant="outline" onClick={handleBulkComplete}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Complete ({selectedIds.size})
              </Button>
              <Button
                variant="outline"
                className="text-destructive"
                onClick={() => setBulkDeleteOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({selectedIds.size})
              </Button>
            </>
          )}
          <Button onClick={handleCreateTask}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
          <CardDescription>
            {isLoading ? (
              <Skeleton className="h-4 w-48" />
            ) : (
              `${tasks.length} tasks total • ${openTasks.length} open • ${completedTasks.length} completed`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
              <TabsTrigger value="open">Open ({openTasks.length})</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress ({inProgressTasks.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
            </TabsList>
            {isLoading ? (
              <div className="mt-4">
                <TaskTableSkeleton />
              </div>
            ) : (
              <>
                <TabsContent value="all" className="mt-4">
                  <TaskTable taskList={tasks} />
                </TabsContent>
                <TabsContent value="open" className="mt-4">
                  <TaskTable taskList={openTasks} />
                </TabsContent>
                <TabsContent value="in_progress" className="mt-4">
                  <TaskTable taskList={inProgressTasks} />
                </TabsContent>
                <TabsContent value="completed" className="mt-4">
                  <TaskTable taskList={completedTasks} />
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        onSubmit={handleSubmitTask}
      />

      <DeleteTaskDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        task={deletingTask}
        onConfirm={handleConfirmDelete}
      />

      <DeleteTaskDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        count={selectedIds.size}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}
