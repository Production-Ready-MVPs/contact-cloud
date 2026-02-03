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

interface DeleteFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fieldName: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteFieldDialog({
  open,
  onOpenChange,
  fieldName,
  onConfirm,
  isLoading,
}: DeleteFieldDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Custom Field</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the field "{fieldName}"? This action
            cannot be undone. Existing data using this field will not be
            affected, but users won't be able to see or edit it anymore.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Deleting..." : "Delete Field"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
