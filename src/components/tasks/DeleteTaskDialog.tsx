import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { TaskWithRelations } from "@/hooks/useTasks";

interface DeleteTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskWithRelations | null;
  count?: number;
  onConfirm: () => void;
}

export function DeleteTaskDialog({
  open,
  onOpenChange,
  task,
  count,
  onConfirm,
}: DeleteTaskDialogProps) {
  const isBulk = count && count > 1;
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isBulk ? `Delete ${count} Tasks` : "Delete Task"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isBulk
              ? `Are you sure you want to delete ${count} tasks? This action cannot be undone.`
              : `Are you sure you want to delete "${task?.title}"? This action cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
