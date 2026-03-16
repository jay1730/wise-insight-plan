import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet, Target } from "lucide-react";
import type { Transaction } from "@/hooks/useTransactions";
import { useCurrency } from "@/hooks/useCurrency";

interface SummaryCardsProps {
  transactions: Transaction[];
}

export default function SummaryCards({ transactions }: SummaryCardsProps) {
  const { formatAmount } = useCurrency();
  const now = new Date();
  const thisMonth = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalIncome = thisMonth
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);

  const totalExpenses = thisMonth
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  const netCashFlow = totalIncome - totalExpenses;

  const lastMonth = transactions.filter((t) => {
    const d = new Date(t.date);
    const lm = new Date(now.getFullYear(), now.getMonth() - 1);
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
  });
  const lastExpenses = lastMonth
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);
  const expenseChange = lastExpenses > 0
    ? ((totalExpenses - lastExpenses) / lastExpenses) * 100
    : 0;

  const cards = [
    {
      label: "Monthly Income",
      value: totalIncome,
      icon: TrendingUp,
      accent: "text-success",
      glowClass: "glow-success",
    },
    {
      label: "Monthly Expenses",
      value: totalExpenses,
      icon: TrendingDown,
      accent: "text-destructive",
      glowClass: "glow-destructive",
      change: expenseChange,
    },
    {
      label: "Net Cash Flow",
      value: netCashFlow,
      icon: Wallet,
      accent: netCashFlow >= 0 ? "text-success" : "text-destructive",
      glowClass: netCashFlow >= 0 ? "glow-success" : "glow-destructive",
    },
    {
      label: "Projected EOM",
      value: netCashFlow * (30 / Math.max(now.getDate(), 1)),
      icon: Target,
      accent: "text-primary",
      glowClass: "glow-primary",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
          className="surface-card rounded-lg p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-label text-muted-foreground">{card.label}</span>
            <card.icon className={`h-4 w-4 ${card.accent}`} />
          </div>
          <p className={`text-display tabular-nums ${card.accent}`}>
            {formatAmount(card.value)}
          </p>
          {card.change !== undefined && card.change !== 0 && (
            <p className={`text-xs mt-1 ${card.change > 0 ? "text-destructive" : "text-success"}`}>
              {card.change > 0 ? "+" : ""}
              {card.change.toFixed(1)}% vs last month
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
}
