import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { Transaction } from "@/hooks/useTransactions";
import { CATEGORY_COLORS } from "@/lib/constants";

interface CategoryBreakdownProps {
  transactions: Transaction[];
}

export default function CategoryBreakdown({ transactions }: CategoryBreakdownProps) {
  const data = useMemo(() => {
    const now = new Date();
    const monthly = transactions.filter((t) => {
      const d = new Date(t.date);
      return (
        t.type === "expense" &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    });

    const byCategory = new Map<string, number>();
    monthly.forEach((t) => {
      byCategory.set(t.category, (byCategory.get(t.category) || 0) + Number(t.amount));
    });

    return Array.from(byCategory.entries())
      .map(([name, value]) => ({
        name,
        value,
        color: CATEGORY_COLORS[name] || "hsl(240, 5%, 55%)",
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const total = data.reduce((s, d) => s + d.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null;
    const d = payload[0].payload;
    return (
      <div className="surface-card rounded-md p-3 text-sm">
        <p className="text-foreground">{d.name}</p>
        <p className="tabular-nums text-muted-foreground">
          ${d.value.toLocaleString("en-US", { minimumFractionDigits: 2 })} ({((d.value / total) * 100).toFixed(1)}%)
        </p>
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className="surface-card rounded-lg p-5">
        <h3 className="text-heading text-foreground mb-4">Spending by Category</h3>
        <p className="text-sm text-muted-foreground">No expenses this month yet.</p>
      </div>
    );
  }

  return (
    <div className="surface-card rounded-lg p-5">
      <h3 className="text-heading text-foreground mb-4">Spending by Category</h3>
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <div className="h-48 w-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2 w-full">
          {data.slice(0, 5).map((d) => (
            <div key={d.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-foreground">{d.name}</span>
              </div>
              <span className="tabular-nums text-muted-foreground">
                ${d.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
