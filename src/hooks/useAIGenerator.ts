import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface GenerateRequest {
  type: "email" | "proposal" | "followup";
  contactId?: string;
  dealId?: string;
  emailType?: string;
  tone?: string;
  followupReason?: string;
  daysSinceContact?: string;
  additionalContext?: string;
  keyPoints?: string;
}

export interface AIGeneration {
  id: string;
  generation_type: string;
  content: string;
  prompt: string | null;
  contact_id: string | null;
  created_at: string;
}

export function useGenerateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: GenerateRequest): Promise<string> => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await supabase.functions.invoke("generate-content", {
        body: request,
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to generate content");
      }

      return response.data.content;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-generations"] });
    },
  });
}

export function useAIGenerations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["ai-generations", user?.id],
    queryFn: async (): Promise<AIGeneration[]> => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("ai_generations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useDeleteAIGeneration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ai_generations")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-generations"] });
    },
  });
}
