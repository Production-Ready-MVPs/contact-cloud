import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { TasksByStatus } from "@/hooks/useDashboard";

interface TasksCompletionChartProps {
  data: TasksByStatus[];
}

const COLORS = {
  Open: "hsl(var(--chart-1))",
  "In Progress": "hsl(var(--chart-2))",
  Completed: "hsl(var(--chart-3))",
};

export function TasksCompletionChart({ data }: TasksCompletionChartProps) {
  const hasData = data.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <div className="flex h-[250px] items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground">Create tasks to see status chart</p>
      </div>
    );
  }

  const filteredData = data.filter((d) => d.count > 0);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={filteredData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="count"
          nameKey="status"
        >
          {filteredData.map((entry) => (
            <Cell
              key={`cell-${entry.status}`}
              fill={COLORS[entry.status as keyof typeof COLORS] || "hsl(var(--muted))"}
            />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload as TasksByStatus;
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <p className="font-medium">{data.status}</p>
                  <p className="text-sm text-muted-foreground">
                    {data.count} task{data.count !== 1 ? "s" : ""}
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
