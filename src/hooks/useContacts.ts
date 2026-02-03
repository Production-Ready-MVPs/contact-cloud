import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  position: string | null;
  notes: string | null;
  tags: string[];
  health_score: number;
  custom_fields: Json;
  created_at: string;
  updated_at: string;
}

export interface ContactFormData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  notes?: string;
  tags?: string[];
  health_score?: number;
}

export function useContacts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["contacts", user?.id],
    queryFn: async (): Promise<Contact[]> => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useContact(id: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["contact", id],
    queryFn: async (): Promise<Contact | null> => {
      if (!user || !id) return null;

      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateContact() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ContactFormData): Promise<Contact> => {
      if (!user) throw new Error("Not authenticated");

      const { data: contact, error } = await supabase
        .from("contacts")
        .insert({
          user_id: user.id,
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          company: data.company || null,
          position: data.position || null,
          notes: data.notes || null,
          tags: data.tags || [],
          health_score: data.health_score || 50,
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from("activity_log").insert({
        user_id: user.id,
        entity_type: "contact",
        entity_id: contact.id,
        action: "created",
        metadata: { name: contact.name },
      });

      return contact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
      toast.success("Contact created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create contact: ${error.message}`);
    },
  });
}

export function useUpdateContact() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ContactFormData }): Promise<Contact> => {
      if (!user) throw new Error("Not authenticated");

      const { data: contact, error } = await supabase
        .from("contacts")
        .update({
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          company: data.company || null,
          position: data.position || null,
          notes: data.notes || null,
          tags: data.tags || [],
          health_score: data.health_score ?? 50,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from("activity_log").insert({
        user_id: user.id,
        entity_type: "contact",
        entity_id: contact.id,
        action: "updated",
        metadata: { name: contact.name },
      });

      return contact;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["contact", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
      toast.success("Contact updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update contact: ${error.message}`);
    },
  });
}

export function useDeleteContact() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!user) throw new Error("Not authenticated");

      // Get contact name for activity log before deleting
      const { data: contact } = await supabase
        .from("contacts")
        .select("name")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      // Log activity
      if (contact) {
        await supabase.from("activity_log").insert({
          user_id: user.id,
          entity_type: "contact",
          entity_id: id,
          action: "deleted",
          metadata: { name: contact.name },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
      toast.success("Contact deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete contact: ${error.message}`);
    },
  });
}

export function useDeleteContacts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]): Promise<void> => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("contacts")
        .delete()
        .in("id", ids)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
      toast.success(`${ids.length} contact(s) deleted successfully`);
    },
    onError: (error) => {
      toast.error(`Failed to delete contacts: ${error.message}`);
    },
  });
}
