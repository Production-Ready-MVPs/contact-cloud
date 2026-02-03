import { Users, Handshake, CheckSquare, DollarSign, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardStats, useDealsByStage, useTasksByStatus, useRecentActivity } from "@/hooks/useDashboard";
import { DealsPipelineChart } from "@/components/dashboard/DealsPipelineChart";
import { TasksCompletionChart } from "@/components/dashboard/TasksCompletionChart";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";
import { StatsCard } from "@/components/dashboard/StatsCard";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: dealsByStage, isLoading: dealsLoading } = useDealsByStage();
  const { data: tasksByStatus, isLoading: tasksLoading } = useTasksByStatus();
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}! Here's what's happening with your CRM.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => navigate("/contacts")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/deals")}>
            <Plus className="mr-2 h-4 w-4" />
            New Deal
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <StatsCard
              title="Total Contacts"
              value={stats?.totalContacts.toString() || "0"}
              description="People in your network"
              icon={Users}
            />
            <StatsCard
              title="Active Deals"
              value={stats?.activeDeals.toString() || "0"}
              description="Deals in progress"
              icon={Handshake}
            />
            <StatsCard
              title="Open Tasks"
              value={stats?.openTasks.toString() || "0"}
              description="Tasks to complete"
              icon={CheckSquare}
            />
            <StatsCard
              title="Revenue"
              value={formatCurrency(stats?.totalRevenue || 0)}
              description="From closed deals"
              icon={DollarSign}
            />
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Deal values by pipeline stage</CardDescription>
          </CardHeader>
          <CardContent>
            {dealsLoading ? (
              <Skeleton className="h-[250px]" />
            ) : (
              <RevenueChart data={dealsByStage || []} />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across your CRM</CardDescription>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : (
              <RecentActivityFeed activities={recentActivity || []} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Deal Pipeline</CardTitle>
            <CardDescription>Current deals by stage</CardDescription>
          </CardHeader>
          <CardContent>
            {dealsLoading ? (
              <Skeleton className="h-[250px]" />
            ) : (
              <DealsPipelineChart data={dealsByStage || []} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Status</CardTitle>
            <CardDescription>Tasks by completion status</CardDescription>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <Skeleton className="h-[250px]" />
            ) : (
              <TasksCompletionChart data={tasksByStatus || []} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
