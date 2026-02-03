import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Tables, TablesInsert, TablesUpdate, Enums } from "@/integrations/supabase/types";

export type Task = Tables<"tasks">;
export type TaskInsert = TablesInsert<"tasks">;
export type TaskUpdate = TablesUpdate<"tasks">;
export type TaskStatus = Enums<"task_status">;
export type TaskPriority = Enums<"task_priority">;

export interface TaskWithRelations extends Task {
  contacts: {
    id: string;
    name: string;
  } | null;
  deals: {
    id: string;
    name: string;
  } | null;
}

export function useTasks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["tasks", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          contacts (
            id,
            name
          ),
          deals (
            id,
            name
          )
        `)
        .eq("user_id", user.id)
        .order("due_date", { ascending: true, nullsFirst: false });

      if (error) throw error;
      return data as TaskWithRelations[];
    },
    enabled: !!user,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (task: Omit<TaskInsert, "user_id">) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tasks")
        .insert({ ...task, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from("activity_log").insert({
        user_id: user.id,
        entity_type: "task",
        entity_id: data.id,
        action: "created",
        metadata: { title: data.title, priority: data.priority },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TaskUpdate & { id: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tasks")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from("activity_log").insert({
        user_id: user.id,
        entity_type: "task",
        entity_id: data.id,
        action: "updated",
        metadata: { title: data.title, updates: Object.keys(updates) },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useToggleTaskStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tasks")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from("activity_log").insert({
        user_id: user.id,
        entity_type: "task",
        entity_id: data.id,
        action: status === "completed" ? "completed" : "reopened",
        metadata: { title: data.title },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");

      // Get task info before deletion for logging
      const { data: task } = await supabase
        .from("tasks")
        .select("title")
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      // Log activity
      await supabase.from("activity_log").insert({
        user_id: user.id,
        entity_type: "task",
        entity_id: id,
        action: "deleted",
        metadata: { title: task?.title },
      });

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteTasks() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("tasks")
        .delete()
        .in("id", ids)
        .eq("user_id", user.id);

      if (error) throw error;

      // Log activity for bulk delete
      await supabase.from("activity_log").insert({
        user_id: user.id,
        entity_type: "task",
        entity_id: ids[0],
        action: "bulk_deleted",
        metadata: { count: ids.length },
      });

      return ids;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useBulkCompleteTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("tasks")
        .update({ status: "completed" as TaskStatus, updated_at: new Date().toISOString() })
        .in("id", ids)
        .eq("user_id", user.id);

      if (error) throw error;

      // Log activity for bulk complete
      await supabase.from("activity_log").insert({
        user_id: user.id,
        entity_type: "task",
        entity_id: ids[0],
        action: "bulk_completed",
        metadata: { count: ids.length },
      });

      return ids;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useContactsForTasks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["contacts-for-tasks", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("contacts")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useDealsForTasks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["deals-for-tasks", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("deals")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
