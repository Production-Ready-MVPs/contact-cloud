import { TrendingUp, TrendingDown, DollarSign, Users, Target, Percent, CalendarIcon, Download } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAnalyticsMetrics, DateRange } from "@/hooks/useAnalytics";
import { RevenueLineChart } from "@/components/analytics/RevenueLineChart";
import { DealFunnelChart } from "@/components/analytics/DealFunnelChart";
import { ContactsBarChart } from "@/components/analytics/ContactsBarChart";
import { HealthPieChart } from "@/components/analytics/HealthPieChart";
import { TaskCompletionChart } from "@/components/analytics/TaskCompletionChart";
import { PipelineAnalysisChart } from "@/components/analytics/PipelineAnalysisChart";

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  formatValue = (v: number | string) => v,
  isLoading,
}: {
  title: string;
  value: number | string;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  formatValue?: (v: number | string) => string | number;
  isLoading?: boolean;
}) {
  const isPositive = change >= 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-1" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        <div className="flex items-center gap-1 mt-1">
          {isPositive ? (
            <TrendingUp className="h-3 w-3 text-green-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <Badge variant={isPositive ? "default" : "destructive"}>
            {isPositive ? "+" : ""}{change}%
          </Badge>
          <span className="text-xs text-muted-foreground">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { data: metrics, isLoading } = useAnalyticsMetrics(dateRange);

  const formatCurrency = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num}`;
  };

  const handleExport = () => {
    // Create a simple CSV export of metrics
    const csvContent = [
      "Metric,Value,Change",
      `Win Rate,${metrics?.winRate || 0}%,${metrics?.winRateChange || 0}%`,
      `Average Deal Size,$${metrics?.avgDealSize || 0},${metrics?.avgDealSizeChange || 0}%`,
      `Conversion Rate,${metrics?.conversionRate || 0}%,${metrics?.conversionRateChange || 0}%`,
      `New Contacts,${metrics?.newContacts || 0},${metrics?.newContactsChange || 0}%`,
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Insights and reports for your sales performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  "This Month"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({ from: range.from, to: range.to });
                  } else if (range?.from) {
                    setDateRange({ from: range.from, to: range.from });
                  } else {
                    setDateRange(undefined);
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Win Rate"
          value={metrics?.winRate || 0}
          change={metrics?.winRateChange || 0}
          icon={Percent}
          formatValue={(v) => `${v}%`}
          isLoading={isLoading}
        />
        <MetricCard
          title="Average Deal Size"
          value={metrics?.avgDealSize || 0}
          change={metrics?.avgDealSizeChange || 0}
          icon={DollarSign}
          formatValue={formatCurrency}
          isLoading={isLoading}
        />
        <MetricCard
          title="Conversion Rate"
          value={metrics?.conversionRate || 0}
          change={metrics?.conversionRateChange || 0}
          icon={Target}
          formatValue={(v) => `${v}%`}
          isLoading={isLoading}
        />
        <MetricCard
          title="New Contacts"
          value={metrics?.newContacts || 0}
          change={metrics?.newContactsChange || 0}
          icon={Users}
          isLoading={isLoading}
        />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <RevenueLineChart />
            <DealFunnelChart />
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4 mt-4">
          <PipelineAnalysisChart />
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <ContactsBarChart />
            <HealthPieChart />
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4 mt-4">
          <TaskCompletionChart />
        </TabsContent>
      </Tabs>
    </div>
  );
}
