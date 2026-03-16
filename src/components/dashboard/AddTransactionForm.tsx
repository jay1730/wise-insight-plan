import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddTransaction } from "@/hooks/useTransactions";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/constants";
import { Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AddTransactionForm() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const addMutation = useAddTransaction();

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;
    await addMutation.mutateAsync({
      type,
      amount: parseFloat(amount),
      category,
      description: description || undefined,
      date,
    });
    setAmount("");
    setCategory("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setOpen(false);
  };

  return (
    <div className="surface-card rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-heading text-foreground">Add Transaction</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(!open)}
          className="h-8 w-8"
        >
          <Plus className={`h-4 w-4 transition-transform ${open ? "rotate-45" : ""}`} />
        </Button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            onSubmit={handleSubmit}
            className="space-y-3 overflow-hidden"
          >
            {/* Type toggle */}
            <div className="flex rounded-md bg-background p-1">
              {(["expense", "income"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t);
                    setCategory("");
                  }}
                  className={`flex-1 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
                    type === t
                      ? t === "income"
                        ? "bg-success/20 text-success"
                        : "bg-destructive/20 text-destructive"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "income" ? "Income" : "Expense"}
                </button>
              ))}
            </div>

            <Input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="bg-background border-border tabular-nums"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <Input
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background border-border"
            />

            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-background border-border"
            />

            <Button type="submit" className="w-full" disabled={addMutation.isPending}>
              {addMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Add Transaction"
              )}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
