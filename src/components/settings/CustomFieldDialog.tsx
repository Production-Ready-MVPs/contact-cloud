import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { CustomFieldDefinition, EntityType, FieldType } from "@/hooks/useCustomFields";
import { useEffect } from "react";

const formSchema = z.object({
  field_name: z.string().min(1, "Field name is required").max(50),
  field_type: z.enum(["text", "number", "date", "dropdown", "checkbox", "url"]),
  entity_type: z.enum(["contact", "deal", "task"]),
  required: z.boolean().default(false),
  options: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CustomFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field?: CustomFieldDefinition | null;
  onSubmit: (data: {
    field_name: string;
    field_type: FieldType;
    entity_type: EntityType;
    required: boolean;
    options: string[];
  }) => void;
  isLoading?: boolean;
}

const fieldTypeLabels: Record<FieldType, string> = {
  text: "Text",
  number: "Number",
  date: "Date",
  dropdown: "Dropdown",
  checkbox: "Checkbox",
  url: "URL",
};

const entityTypeLabels: Record<EntityType, string> = {
  contact: "Contacts",
  deal: "Deals",
  task: "Tasks",
};

export function CustomFieldDialog({
  open,
  onOpenChange,
  field,
  onSubmit,
  isLoading,
}: CustomFieldDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      field_name: "",
      field_type: "text",
      entity_type: "contact",
      required: false,
      options: "",
    },
  });

  const watchFieldType = form.watch("field_type");

  useEffect(() => {
    if (field) {
      form.reset({
        field_name: field.field_name,
        field_type: field.field_type,
        entity_type: field.entity_type,
        required: field.required || false,
        options: field.options?.join(", ") || "",
      });
    } else {
      form.reset({
        field_name: "",
        field_type: "text",
        entity_type: "contact",
        required: false,
        options: "",
      });
    }
  }, [field, form]);

  const handleSubmit = (values: FormValues) => {
    const options =
      values.field_type === "dropdown" && values.options
        ? values.options
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean)
        : [];

    onSubmit({
      field_name: values.field_name,
      field_type: values.field_type,
      entity_type: values.entity_type,
      required: values.required,
      options,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {field ? "Edit Custom Field" : "Create Custom Field"}
          </DialogTitle>
          <DialogDescription>
            {field
              ? "Update the custom field configuration"
              : "Add a new custom field to track additional data"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="field_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Industry, Budget, Source" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="entity_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apply To</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select entity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(entityTypeLabels) as EntityType[]).map(
                          (type) => (
                            <SelectItem key={type} value={type}>
                              {entityTypeLabels[type]}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="field_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(fieldTypeLabels) as FieldType[]).map(
                          (type) => (
                            <SelectItem key={type} value={type}>
                              {fieldTypeLabels[type]}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {watchFieldType === "dropdown" && (
              <FormField
                control={form.control}
                name="options"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dropdown Options</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter options separated by commas (e.g., Option 1, Option 2, Option 3)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Separate each option with a comma
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="required"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Required Field</FormLabel>
                    <FormDescription>
                      Users must fill in this field when creating or editing
                      records
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : field ? "Update Field" : "Create Field"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
