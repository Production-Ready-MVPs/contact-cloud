import { useState } from "react";
import { Plus, Pencil, Trash2, GripVertical, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  useCustomFields,
  useUserRole,
  useCreateCustomField,
  useUpdateCustomField,
  useDeleteCustomField,
  CustomFieldDefinition,
  EntityType,
  FieldType,
} from "@/hooks/useCustomFields";
import { CustomFieldDialog } from "./CustomFieldDialog";
import { DeleteFieldDialog } from "./DeleteFieldDialog";
import { toast } from "sonner";

const fieldTypeBadgeVariants: Record<FieldType, "default" | "secondary" | "outline"> = {
  text: "default",
  number: "secondary",
  date: "outline",
  dropdown: "default",
  checkbox: "secondary",
  url: "outline",
};

const entityTypeBadgeColors: Record<EntityType, string> = {
  contact: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  deal: "bg-green-500/10 text-green-500 border-green-500/20",
  task: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export function CustomFieldsBuilder() {
  const { data: role, isLoading: roleLoading } = useUserRole();
  const { data: fields, isLoading: fieldsLoading } = useCustomFields();
  const createField = useCreateCustomField();
  const updateField = useUpdateCustomField();
  const deleteField = useDeleteCustomField();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<CustomFieldDefinition | null>(null);

  const isAdmin = role === "admin";
  const isLoading = roleLoading || fieldsLoading;

  const handleCreate = () => {
    setSelectedField(null);
    setDialogOpen(true);
  };

  const handleEdit = (field: CustomFieldDefinition) => {
    setSelectedField(field);
    setDialogOpen(true);
  };

  const handleDelete = (field: CustomFieldDefinition) => {
    setSelectedField(field);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: {
    field_name: string;
    field_type: FieldType;
    entity_type: EntityType;
    required: boolean;
    options: string[];
  }) => {
    try {
      if (selectedField) {
        await updateField.mutateAsync({
          id: selectedField.id,
          updates: {
            field_name: data.field_name,
            field_type: data.field_type,
            entity_type: data.entity_type,
            required: data.required,
            options: data.options,
          },
        });
        toast.success("Custom field updated");
      } else {
        await createField.mutateAsync({
          field_name: data.field_name,
          field_type: data.field_type,
          entity_type: data.entity_type,
          required: data.required,
          options: data.options,
          display_order: (fields?.length || 0) + 1,
        });
        toast.success("Custom field created");
      }
      setDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save custom field");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedField) return;
    try {
      await deleteField.mutateAsync(selectedField.id);
      toast.success("Custom field deleted");
      setDeleteDialogOpen(false);
      setSelectedField(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete custom field");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Admin Access Required</AlertTitle>
        <AlertDescription>
          Only administrators can manage custom fields. Contact your admin to
          request access or to add custom fields to your CRM.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Define custom fields to track additional data on contacts, deals, and tasks.
        </p>
        <Button onClick={handleCreate} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Field
        </Button>
      </div>

      {fields && fields.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Field Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Required</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                  </TableCell>
                  <TableCell className="font-medium">{field.field_name}</TableCell>
                  <TableCell>
                    <Badge variant={fieldTypeBadgeVariants[field.field_type]}>
                      {field.field_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={entityTypeBadgeColors[field.entity_type]}
                    >
                      {field.entity_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {field.required ? (
                      <Badge variant="secondary">Yes</Badge>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(field)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(field)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">No custom fields defined</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click "Add Field" to create your first custom field
            </p>
          </div>
        </div>
      )}

      <CustomFieldDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        field={selectedField}
        onSubmit={handleSubmit}
        isLoading={createField.isPending || updateField.isPending}
      />

      <DeleteFieldDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        fieldName={selectedField?.field_name || ""}
        onConfirm={handleConfirmDelete}
        isLoading={deleteField.isPending}
      />
    </div>
  );
}
