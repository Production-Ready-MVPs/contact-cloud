import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTaskCompletion } from "@/hooks/useAnalytics";

export function TaskCompletionChart() {
  const { data, isLoading } = useTaskCompletion();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Completion Rate</CardTitle>
          <CardDescription>Tasks completed over time</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasData = data && data.some((d) => d.total > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Completion Rate</CardTitle>
        <CardDescription>Tasks completed over time</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
            <p className="text-sm text-muted-foreground">
              No tasks yet. Create some tasks to track completion rates.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis 
                yAxisId="left"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                allowDecimals={false}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number, name: string) => {
                  if (name === "rate") return [`${value}%`, "Completion Rate"];
                  return [value, name === "completed" ? "Completed" : "Total"];
                }}
              />
              <Legend 
                formatter={(value) => {
                  const labels: Record<string, string> = {
                    total: "Total Tasks",
                    completed: "Completed",
                    rate: "Completion Rate",
                  };
                  return <span style={{ color: "hsl(var(--foreground))" }}>{labels[value] || value}</span>;
                }}
              />
              <Bar 
                yAxisId="left"
                dataKey="total" 
                fill="hsl(var(--muted))" 
                radius={[4, 4, 0, 0]}
                name="total"
              />
              <Bar 
                yAxisId="left"
                dataKey="completed" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
                name="completed"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="rate"
                stroke="hsl(142, 71%, 45%)"
                strokeWidth={2}
                dot={{ fill: "hsl(142, 71%, 45%)", strokeWidth: 2 }}
                name="rate"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
