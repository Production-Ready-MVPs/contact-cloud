import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DealsByStage } from "@/hooks/useDashboard";

interface RevenueChartProps {
  data: DealsByStage[];
}

function formatCurrency(value: number) {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
}

export function RevenueChart({ data }: RevenueChartProps) {
  const hasData = data.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="flex h-[250px] items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground">Add deals to see revenue chart</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="stage"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          className="fill-muted-foreground"
          interval={0}
          angle={-20}
          textAnchor="end"
          height={60}
        />
        <YAxis
          tickFormatter={formatCurrency}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          className="fill-muted-foreground"
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload as DealsByStage;
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <p className="font-medium">{data.stage}</p>
                  <p className="text-sm text-muted-foreground">
                    ${data.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {data.count} deal{data.count !== 1 ? "s" : ""}
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
