import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { subMonths, startOfMonth, endOfMonth, format, parseISO, isWithinInterval } from "date-fns";

export interface DateRange {
  from: Date;
  to: Date;
}

export interface AnalyticsMetrics {
  winRate: number;
  winRateChange: number;
  avgDealSize: number;
  avgDealSizeChange: number;
  conversionRate: number;
  conversionRateChange: number;
  newContacts: number;
  newContactsChange: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
}

export interface DealFunnel {
  stage: string;
  count: number;
  value: number;
}

export interface ContactsByMonth {
  month: string;
  count: number;
}

export interface HealthDistribution {
  range: string;
  count: number;
  color: string;
}

export interface TaskCompletion {
  month: string;
  completed: number;
  total: number;
  rate: number;
}

export function useAnalyticsMetrics(dateRange?: DateRange) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["analytics-metrics", user?.id, dateRange?.from, dateRange?.to],
    queryFn: async (): Promise<AnalyticsMetrics> => {
      if (!user) throw new Error("Not authenticated");

      const now = new Date();
      const currentStart = dateRange?.from || startOfMonth(subMonths(now, 0));
      const currentEnd = dateRange?.to || endOfMonth(now);
      const previousStart = subMonths(currentStart, 1);
      const previousEnd = subMonths(currentEnd, 1);

      const [dealsResult, contactsResult] = await Promise.all([
        supabase.from("deals").select("*").eq("user_id", user.id),
        supabase.from("contacts").select("id, created_at").eq("user_id", user.id),
      ]);

      const deals = dealsResult.data || [];
      const contacts = contactsResult.data || [];

      // Filter by date range
      const currentDeals = deals.filter((d) => {
        const date = parseISO(d.created_at);
        return isWithinInterval(date, { start: currentStart, end: currentEnd });
      });

      const previousDeals = deals.filter((d) => {
        const date = parseISO(d.created_at);
        return isWithinInterval(date, { start: previousStart, end: previousEnd });
      });

      const currentContacts = contacts.filter((c) => {
        const date = parseISO(c.created_at);
        return isWithinInterval(date, { start: currentStart, end: currentEnd });
      });

      const previousContacts = contacts.filter((c) => {
        const date = parseISO(c.created_at);
        return isWithinInterval(date, { start: previousStart, end: previousEnd });
      });

      // Calculate win rate
      const closedCurrent = currentDeals.filter(
        (d) => d.stage === "closed_won" || d.stage === "closed_lost"
      );
      const wonCurrent = currentDeals.filter((d) => d.stage === "closed_won");
      const winRate = closedCurrent.length > 0 
        ? (wonCurrent.length / closedCurrent.length) * 100 
        : 0;

      const closedPrevious = previousDeals.filter(
        (d) => d.stage === "closed_won" || d.stage === "closed_lost"
      );
      const wonPrevious = previousDeals.filter((d) => d.stage === "closed_won");
      const prevWinRate = closedPrevious.length > 0 
        ? (wonPrevious.length / closedPrevious.length) * 100 
        : 0;

      // Calculate avg deal size
      const avgDealSize = wonCurrent.length > 0
        ? wonCurrent.reduce((sum, d) => sum + (Number(d.value) || 0), 0) / wonCurrent.length
        : 0;

      const prevAvgDealSize = wonPrevious.length > 0
        ? wonPrevious.reduce((sum, d) => sum + (Number(d.value) || 0), 0) / wonPrevious.length
        : 0;

      // Calculate conversion rate (leads to qualified)
      const leadsCount = currentDeals.filter((d) => d.stage === "lead").length;
      const qualifiedCount = currentDeals.filter(
        (d) => d.stage !== "lead"
      ).length;
      const conversionRate = currentDeals.length > 0
        ? (qualifiedCount / currentDeals.length) * 100
        : 0;

      const prevLeads = previousDeals.filter((d) => d.stage === "lead").length;
      const prevQualified = previousDeals.filter((d) => d.stage !== "lead").length;
      const prevConversionRate = previousDeals.length > 0
        ? (prevQualified / previousDeals.length) * 100
        : 0;

      return {
        winRate: Math.round(winRate),
        winRateChange: Math.round(winRate - prevWinRate),
        avgDealSize: Math.round(avgDealSize),
        avgDealSizeChange: prevAvgDealSize > 0 
          ? Math.round(((avgDealSize - prevAvgDealSize) / prevAvgDealSize) * 100)
          : 0,
        conversionRate: Math.round(conversionRate),
        conversionRateChange: Math.round(conversionRate - prevConversionRate),
        newContacts: currentContacts.length,
        newContactsChange: previousContacts.length > 0
          ? Math.round(((currentContacts.length - previousContacts.length) / previousContacts.length) * 100)
          : 0,
      };
    },
    enabled: !!user,
  });
}

export function useRevenueByMonth() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["revenue-by-month", user?.id],
    queryFn: async (): Promise<RevenueByMonth[]> => {
      if (!user) throw new Error("Not authenticated");

      const { data: deals } = await supabase
        .from("deals")
        .select("value, stage, created_at")
        .eq("user_id", user.id)
        .eq("stage", "closed_won");

      const monthMap: Record<string, number> = {};
      const now = new Date();

      // Initialize last 12 months
      for (let i = 11; i >= 0; i--) {
        const month = subMonths(now, i);
        const key = format(month, "MMM yyyy");
        monthMap[key] = 0;
      }

      (deals || []).forEach((deal) => {
        const date = parseISO(deal.created_at);
        const key = format(date, "MMM yyyy");
        if (monthMap[key] !== undefined) {
          monthMap[key] += Number(deal.value) || 0;
        }
      });

      return Object.entries(monthMap).map(([month, revenue]) => ({
        month,
        revenue,
      }));
    },
    enabled: !!user,
  });
}

export function useDealFunnel() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["deal-funnel", user?.id],
    queryFn: async (): Promise<DealFunnel[]> => {
      if (!user) throw new Error("Not authenticated");

      const { data: deals } = await supabase
        .from("deals")
        .select("stage, value")
        .eq("user_id", user.id);

      const stages = ["lead", "qualified", "proposal", "negotiation", "closed_won"];
      const stageLabels: Record<string, string> = {
        lead: "Lead",
        qualified: "Qualified",
        proposal: "Proposal",
        negotiation: "Negotiation",
        closed_won: "Closed Won",
      };

      const stageMap: Record<string, { count: number; value: number }> = {};
      stages.forEach((stage) => {
        stageMap[stage] = { count: 0, value: 0 };
      });

      (deals || []).forEach((deal) => {
        if (stageMap[deal.stage]) {
          stageMap[deal.stage].count += 1;
          stageMap[deal.stage].value += Number(deal.value) || 0;
        }
      });

      return stages.map((stage) => ({
        stage: stageLabels[stage],
        count: stageMap[stage].count,
        value: stageMap[stage].value,
      }));
    },
    enabled: !!user,
  });
}

export function useContactsByMonth() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["contacts-by-month", user?.id],
    queryFn: async (): Promise<ContactsByMonth[]> => {
      if (!user) throw new Error("Not authenticated");

      const { data: contacts } = await supabase
        .from("contacts")
        .select("created_at")
        .eq("user_id", user.id);

      const monthMap: Record<string, number> = {};
      const now = new Date();

      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const month = subMonths(now, i);
        const key = format(month, "MMM");
        monthMap[key] = 0;
      }

      (contacts || []).forEach((contact) => {
        const date = parseISO(contact.created_at);
        const key = format(date, "MMM");
        if (monthMap[key] !== undefined) {
          monthMap[key] += 1;
        }
      });

      return Object.entries(monthMap).map(([month, count]) => ({
        month,
        count,
      }));
    },
    enabled: !!user,
  });
}

export function useHealthDistribution() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["health-distribution", user?.id],
    queryFn: async (): Promise<HealthDistribution[]> => {
      if (!user) throw new Error("Not authenticated");

      const { data: contacts } = await supabase
        .from("contacts")
        .select("health_score")
        .eq("user_id", user.id);

      const ranges = [
        { range: "Critical (0-25)", min: 0, max: 25, color: "hsl(var(--destructive))" },
        { range: "At Risk (26-50)", min: 26, max: 50, color: "hsl(38, 92%, 50%)" },
        { range: "Healthy (51-75)", min: 51, max: 75, color: "hsl(48, 96%, 53%)" },
        { range: "Excellent (76-100)", min: 76, max: 100, color: "hsl(142, 71%, 45%)" },
      ];

      const distribution = ranges.map((r) => ({
        ...r,
        count: (contacts || []).filter(
          (c) => (c.health_score || 50) >= r.min && (c.health_score || 50) <= r.max
        ).length,
      }));

      return distribution;
    },
    enabled: !!user,
  });
}

export function useTaskCompletion() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["task-completion", user?.id],
    queryFn: async (): Promise<TaskCompletion[]> => {
      if (!user) throw new Error("Not authenticated");

      const { data: tasks } = await supabase
        .from("tasks")
        .select("status, created_at, updated_at")
        .eq("user_id", user.id);

      const monthMap: Record<string, { completed: number; total: number }> = {};
      const now = new Date();

      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const month = subMonths(now, i);
        const key = format(month, "MMM");
        monthMap[key] = { completed: 0, total: 0 };
      }

      (tasks || []).forEach((task) => {
        const date = parseISO(task.created_at);
        const key = format(date, "MMM");
        if (monthMap[key] !== undefined) {
          monthMap[key].total += 1;
          if (task.status === "completed") {
            monthMap[key].completed += 1;
          }
        }
      });

      return Object.entries(monthMap).map(([month, data]) => ({
        month,
        completed: data.completed,
        total: data.total,
        rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      }));
    },
    enabled: !!user,
  });
}
