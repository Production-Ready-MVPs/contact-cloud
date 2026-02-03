import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDealFunnel } from "@/hooks/useAnalytics";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(217, 91%, 60%)",
  "hsl(199, 89%, 48%)",
  "hsl(172, 66%, 50%)",
  "hsl(142, 71%, 45%)",
];

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
};

export function DealFunnelChart() {
  const { data, isLoading } = useDealFunnel();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deal Pipeline Funnel</CardTitle>
          <CardDescription>Conversion through pipeline stages</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasData = data && data.some((d) => d.count > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deal Pipeline Funnel</CardTitle>
        <CardDescription>Conversion through pipeline stages</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
            <p className="text-sm text-muted-foreground">
              No deals yet. Create some deals to see your pipeline funnel.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={data} 
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                type="number"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis 
                type="category"
                dataKey="stage"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                width={70}
              />
              <Tooltip
                formatter={(value: number, name: string, props) => {
                  const item = props.payload;
                  return [
                    `${value} deals (${formatCurrency(item.value)})`,
                    "Count",
                  ];
                }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
