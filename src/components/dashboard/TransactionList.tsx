import { motion, AnimatePresence } from "framer-motion";
import { Trash2, TrendingUp, TrendingDown } from "lucide-react";
import type { Transaction } from "@/hooks/useTransactions";
import { useDeleteTransaction } from "@/hooks/useTransactions";
import { CATEGORY_COLORS } from "@/lib/constants";

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  const deleteMutation = useDeleteTransaction();

  if (transactions.length === 0) {
    return (
      <div className="surface-card rounded-lg p-5">
        <h3 className="text-heading text-foreground mb-4">Recent Transactions</h3>
        <p className="text-sm text-muted-foreground">No transactions yet. Add your first one above.</p>
      </div>
    );
  }

  return (
    <div className="surface-card rounded-lg p-5">
      <h3 className="text-heading text-foreground mb-4">Recent Transactions</h3>
      <div className="space-y-0.5">
        <AnimatePresence initial={false}>
          {transactions.slice(0, 20).map((tx) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              className="group grid grid-cols-[auto_1fr_auto_auto] gap-3 items-center rounded-md px-3 py-2.5 hover:bg-accent/50 transition-colors"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-md"
                style={{
                  backgroundColor: `${CATEGORY_COLORS[tx.category] || "hsl(240, 5%, 55%)"}20`,
                }}
              >
                {tx.type === "income" ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-sm text-foreground truncate">
                  {tx.description || tx.category}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tx.category} · {new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>

              <p
                className={`text-sm font-medium tabular-nums ${
                  tx.type === "income" ? "text-success" : "text-foreground"
                }`}
              >
                {tx.type === "income" ? "+" : "-"}$
                {Number(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>

              <button
                onClick={() => deleteMutation.mutate(tx.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-destructive text-muted-foreground"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
