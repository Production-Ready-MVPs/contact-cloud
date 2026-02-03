import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Tables, TablesInsert, TablesUpdate, Enums } from "@/integrations/supabase/types";

export type Deal = Tables<"deals">;
export type DealInsert = TablesInsert<"deals">;
export type DealUpdate = TablesUpdate<"deals">;
export type DealStage = Enums<"deal_stage">;

export interface DealWithContact extends Deal {
  contacts: {
    id: string;
    name: string;
    company: string | null;
  } | null;
}

export function useDeals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["deals", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("deals")
        .select(`
          *,
          contacts (
            id,
            name,
            company
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DealWithContact[];
    },
    enabled: !!user,
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (deal: Omit<DealInsert, "user_id">) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("deals")
        .insert({ ...deal, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from("activity_log").insert({
        user_id: user.id,
        entity_type: "deal",
        entity_id: data.id,
        action: "created",
        metadata: { name: data.name, value: data.value },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updates }: DealUpdate & { id: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("deals")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from("activity_log").insert({
        user_id: user.id,
        entity_type: "deal",
        entity_id: data.id,
        action: "updated",
        metadata: { name: data.name, updates: Object.keys(updates) },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateDealStage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: DealStage }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("deals")
        .update({ stage, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from("activity_log").insert({
        user_id: user.id,
        entity_type: "deal",
        entity_id: data.id,
        action: "stage_changed",
        metadata: { name: data.name, new_stage: stage },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");

      // Get deal info before deletion for logging
      const { data: deal } = await supabase
        .from("deals")
        .select("name, value")
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("deals")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      // Log activity
      await supabase.from("activity_log").insert({
        user_id: user.id,
        entity_type: "deal",
        entity_id: id,
        action: "deleted",
        metadata: { name: deal?.name, value: deal?.value },
      });

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useContacts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["contacts-for-deals", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("contacts")
        .select("id, name, company")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
