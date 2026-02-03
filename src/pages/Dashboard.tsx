import { Users, Handshake, CheckSquare, DollarSign, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const stats = [
  {
    title: "Total Contacts",
    value: "1,234",
    change: "+12%",
    changeType: "positive" as const,
    icon: Users,
  },
  {
    title: "Active Deals",
    value: "56",
    change: "+8%",
    changeType: "positive" as const,
    icon: Handshake,
  },
  {
    title: "Open Tasks",
    value: "23",
    change: "-5%",
    changeType: "negative" as const,
    icon: CheckSquare,
  },
  {
    title: "Revenue",
    value: "$125,430",
    change: "+23%",
    changeType: "positive" as const,
    icon: DollarSign,
  },
];

const recentActivity = [
  { id: 1, action: "New contact added", name: "John Smith", time: "2 minutes ago" },
  { id: 2, action: "Deal moved to Proposal", name: "Acme Corp", time: "15 minutes ago" },
  { id: 3, action: "Task completed", name: "Follow up with Sarah", time: "1 hour ago" },
  { id: 4, action: "New contact added", name: "Jane Doe", time: "2 hours ago" },
  { id: 5, action: "Deal closed won", name: "TechStart Inc", time: "3 hours ago" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your CRM.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
          <Button size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            New Deal
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <Badge
                variant={stat.changeType === "positive" ? "default" : "destructive"}
                className="mt-1"
              >
                {stat.change} from last month
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue for the current year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
              <p className="text-sm text-muted-foreground">
                Chart will be displayed here
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across your CRM</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={activity.id}>
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.action}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.name}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {activity.time}
                    </p>
                  </div>
                  {index < recentActivity.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
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
            <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
              <p className="text-sm text-muted-foreground">
                Pipeline chart will be displayed here
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Completion</CardTitle>
            <CardDescription>Tasks completed this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
              <p className="text-sm text-muted-foreground">
                Task chart will be displayed here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
