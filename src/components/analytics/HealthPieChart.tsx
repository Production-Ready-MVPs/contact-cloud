import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useHealthDistribution } from "@/hooks/useAnalytics";

export function HealthPieChart() {
  const { data, isLoading } = useHealthDistribution();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Relationship Health</CardTitle>
          <CardDescription>Distribution of health scores</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasData = data && data.some((d) => d.count > 0);
  const totalContacts = data?.reduce((sum, d) => sum + d.count, 0) || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relationship Health</CardTitle>
        <CardDescription>Distribution of health scores ({totalContacts} contacts)</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
            <p className="text-sm text-muted-foreground">
              No contacts yet. Add contacts to see health distribution.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="count"
                nameKey="range"
                label={({ percent }) => percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
                labelLine={false}
              >
                {data?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [value, "Contacts"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend 
                formatter={(value) => (
                  <span style={{ color: "hsl(var(--foreground))" }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
