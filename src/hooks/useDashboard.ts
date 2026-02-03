import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DashboardStats {
  totalContacts: number;
  activeDeals: number;
  openTasks: number;
  totalRevenue: number;
  contactsChange: number;
  dealsChange: number;
  tasksChange: number;
  revenueChange: number;
}

export interface DealsByStage {
  stage: string;
  count: number;
  value: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
}

export interface TasksByStatus {
  status: string;
  count: number;
}

export interface RecentActivity {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export function useDashboardStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user) throw new Error("Not authenticated");

      const [contactsResult, dealsResult, tasksResult] = await Promise.all([
        supabase.from("contacts").select("id", { count: "exact" }).eq("user_id", user.id),
        supabase.from("deals").select("id, value, stage").eq("user_id", user.id),
        supabase.from("tasks").select("id, status").eq("user_id", user.id),
      ]);

      const totalContacts = contactsResult.count || 0;
      const deals = dealsResult.data || [];
      const tasks = tasksResult.data || [];

      const activeDeals = deals.filter(
        (d) => d.stage !== "closed_won" && d.stage !== "closed_lost"
      ).length;

      const openTasks = tasks.filter((t) => t.status !== "completed").length;

      const totalRevenue = deals
        .filter((d) => d.stage === "closed_won")
        .reduce((sum, d) => sum + (Number(d.value) || 0), 0);

      return {
        totalContacts,
        activeDeals,
        openTasks,
        totalRevenue,
        contactsChange: 0,
        dealsChange: 0,
        tasksChange: 0,
        revenueChange: 0,
      };
    },
    enabled: !!user,
  });
}

export function useDealsByStage() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["deals-by-stage", user?.id],
    queryFn: async (): Promise<DealsByStage[]> => {
      if (!user) throw new Error("Not authenticated");

      const { data: deals } = await supabase
        .from("deals")
        .select("stage, value")
        .eq("user_id", user.id);

      const stageMap: Record<string, { count: number; value: number }> = {
        lead: { count: 0, value: 0 },
        qualified: { count: 0, value: 0 },
        proposal: { count: 0, value: 0 },
        negotiation: { count: 0, value: 0 },
        closed_won: { count: 0, value: 0 },
        closed_lost: { count: 0, value: 0 },
      };

      (deals || []).forEach((deal) => {
        if (stageMap[deal.stage]) {
          stageMap[deal.stage].count += 1;
          stageMap[deal.stage].value += Number(deal.value) || 0;
        }
      });

      return Object.entries(stageMap).map(([stage, data]) => ({
        stage: stage.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        count: data.count,
        value: data.value,
      }));
    },
    enabled: !!user,
  });
}

export function useTasksByStatus() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["tasks-by-status", user?.id],
    queryFn: async (): Promise<TasksByStatus[]> => {
      if (!user) throw new Error("Not authenticated");

      const { data: tasks } = await supabase
        .from("tasks")
        .select("status")
        .eq("user_id", user.id);

      const statusMap: Record<string, number> = {
        open: 0,
        in_progress: 0,
        completed: 0,
      };

      (tasks || []).forEach((task) => {
        if (statusMap[task.status] !== undefined) {
          statusMap[task.status] += 1;
        }
      });

      return Object.entries(statusMap).map(([status, count]) => ({
        status: status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        count,
      }));
    },
    enabled: !!user,
  });
}

export function useRecentActivity() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["recent-activity", user?.id],
    queryFn: async (): Promise<RecentActivity[]> => {
      if (!user) throw new Error("Not authenticated");

      const { data } = await supabase
        .from("activity_log")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      return (data || []).map((item) => ({
        id: item.id,
        action: item.action,
        entityType: item.entity_type,
        entityId: item.entity_id,
        metadata: item.metadata as Record<string, unknown>,
        createdAt: item.created_at,
      }));
    },
    enabled: !!user,
  });
}
