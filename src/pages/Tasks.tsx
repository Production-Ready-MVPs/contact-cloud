import { Plus, Calendar, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const tasks = [
  {
    id: "1",
    title: "Follow up with John Smith",
    description: "Send proposal for Enterprise License",
    dueDate: "2024-01-28",
    priority: "high",
    status: "open",
    contact: "John Smith",
    deal: "Enterprise License",
  },
  {
    id: "2",
    title: "Schedule demo call",
    description: "Product demo for TechStart team",
    dueDate: "2024-01-29",
    priority: "medium",
    status: "open",
    contact: "Sarah Johnson",
    deal: "Consulting Project",
  },
  {
    id: "3",
    title: "Send contract",
    description: "Final contract for signing",
    dueDate: "2024-01-25",
    priority: "high",
    status: "open",
    contact: "Emily Davis",
    deal: "Custom Development",
  },
  {
    id: "4",
    title: "Research competitor pricing",
    description: "Compare features and pricing",
    dueDate: "2024-01-30",
    priority: "low",
    status: "in-progress",
    contact: null,
    deal: null,
  },
  {
    id: "5",
    title: "Update CRM records",
    description: "Clean up duplicate contacts",
    dueDate: "2024-01-24",
    priority: "medium",
    status: "completed",
    contact: null,
    deal: null,
  },
];

function getPriorityBadgeVariant(priority: string) {
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

function getDueDateBadge(dueDate: string) {
  const today = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return <Badge variant="destructive">Overdue</Badge>;
  } else if (diffDays === 0) {
    return <Badge className="bg-yellow-500 hover:bg-yellow-600">Due Today</Badge>;
  } else if (diffDays <= 3) {
    return <Badge variant="outline">Due Soon</Badge>;
  }
  return null;
}

export default function Tasks() {
  const openTasks = tasks.filter((t) => t.status === "open");
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const TaskTable = ({ taskList }: { taskList: typeof tasks }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]"></TableHead>
          <TableHead>Task</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Related To</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {taskList.map((task) => (
          <TableRow key={task.id}>
            <TableCell>
              <Checkbox checked={task.status === "completed"} />
            </TableCell>
            <TableCell>
              <div>
                <p className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {task.description}
                </p>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="h-3 w-3" />
                  {new Date(task.dueDate).toLocaleDateString()}
                </div>
                {getDueDateBadge(task.dueDate)}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={getPriorityBadgeVariant(task.priority)}>
                {task.priority}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                {task.contact && <p>{task.contact}</p>}
                {task.deal && (
                  <p className="text-muted-foreground">{task.deal}</p>
                )}
                {!task.contact && !task.deal && (
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
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Mark Complete</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
        {taskList.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
              No tasks found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage your to-dos and follow-ups
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
          <CardDescription>
            {tasks.length} tasks total • {openTasks.length} open • {completedTasks.length} completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
              <TabsTrigger value="open">Open ({openTasks.length})</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress ({inProgressTasks.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <TaskTable taskList={tasks} />
            </TabsContent>
            <TabsContent value="open" className="mt-4">
              <TaskTable taskList={openTasks} />
            </TabsContent>
            <TabsContent value="in-progress" className="mt-4">
              <TaskTable taskList={inProgressTasks} />
            </TabsContent>
            <TabsContent value="completed" className="mt-4">
              <TaskTable taskList={completedTasks} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
