import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type CustomFieldDefinition = Tables<"custom_field_definitions">;
export type EntityType = "contact" | "deal" | "task";
export type FieldType = "text" | "number" | "date" | "dropdown" | "checkbox" | "url";

export function useCustomFields(entityType?: EntityType) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["custom-field-definitions", entityType, user?.id],
    queryFn: async (): Promise<CustomFieldDefinition[]> => {
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from("custom_field_definitions")
        .select("*")
        .eq("user_id", user.id)
        .order("display_order", { ascending: true });

      if (entityType) {
        query = query.eq("entity_type", entityType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useUserRole() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async (): Promise<"admin" | "user" | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        return "user"; // Default to user if role not found
      }

      return data?.role || "user";
    },
    enabled: !!user,
  });
}

export function useCreateCustomField() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      field: Omit<TablesInsert<"custom_field_definitions">, "user_id">
    ) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("custom_field_definitions")
        .insert({
          ...field,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-field-definitions"] });
    },
  });
}

export function useUpdateCustomField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: TablesUpdate<"custom_field_definitions">;
    }) => {
      const { data, error } = await supabase
        .from("custom_field_definitions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-field-definitions"] });
    },
  });
}

export function useDeleteCustomField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("custom_field_definitions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-field-definitions"] });
    },
  });
}

export function useReorderCustomFields() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fields: { id: string; display_order: number }[]) => {
      const updates = fields.map(({ id, display_order }) =>
        supabase
          .from("custom_field_definitions")
          .update({ display_order })
          .eq("id", id)
      );

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-field-definitions"] });
    },
  });
}
