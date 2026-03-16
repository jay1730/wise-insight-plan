import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { Transaction } from "@/hooks/useTransactions";

interface SpendingChartProps {
  transactions: Transaction[];
}

export default function SpendingChart({ transactions }: SpendingChartProps) {
  const chartData = useMemo(() => {
    const last30 = new Map<string, { income: number; expenses: number }>();
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      last30.set(key, { income: 0, expenses: 0 });
    }

    transactions.forEach((t) => {
      const entry = last30.get(t.date);
      if (entry) {
        if (t.type === "income") entry.income += Number(t.amount);
        else entry.expenses += Number(t.amount);
      }
    });

    return Array.from(last30.entries()).map(([date, vals]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      income: vals.income,
      expenses: vals.expenses,
    }));
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="surface-card rounded-md p-3 text-sm">
        <p className="text-muted-foreground mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} className="tabular-nums" style={{ color: p.color }}>
            {p.dataKey === "income" ? "Income" : "Expenses"}: $
            {Number(p.value).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="surface-card rounded-lg p-5">
      <h3 className="text-heading text-foreground mb-4">Cash Flow — Last 30 Days</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(240, 3.7%, 15.9%)" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fill: "hsl(240, 5%, 55%)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "hsl(240, 5%, 55%)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="income"
              stroke="hsl(142, 70%, 45%)"
              fill="url(#incomeGrad)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="hsl(0, 84%, 60%)"
              fill="url(#expenseGrad)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
