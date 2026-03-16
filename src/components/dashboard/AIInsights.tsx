import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { Transaction } from "@/hooks/useTransactions";

interface AIInsightsProps {
  transactions: Transaction[];
}

export default function AIInsights({ transactions }: AIInsightsProps) {
  const [insights, setInsights] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getInsights = async () => {
    setLoading(true);
    setError("");
    setInsights("");

    const now = new Date();
    const monthly = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const summary = {
      totalIncome: monthly.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0),
      totalExpenses: monthly.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0),
      categories: Object.entries(
        monthly
          .filter((t) => t.type === "expense")
          .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
            return acc;
          }, {} as Record<string, number>)
      ),
      transactionCount: monthly.length,
    };

    try {
      const response = await supabase.functions.invoke("ai-insights", {
        body: { summary },
      });

      if (response.error) throw new Error(response.error.message);
      setInsights(response.data.insights);
    } catch (e: any) {
      setError(e.message || "Failed to get AI insights");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-card rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-heading text-foreground">AI Insights</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={getInsights}
          disabled={loading || transactions.length === 0}
          className="text-xs"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Analyze"}
        </Button>
      </div>

      {!insights && !loading && !error && (
        <p className="text-sm text-muted-foreground">
          Click "Analyze" to get AI-powered budgeting advice and investment recommendations based on your spending patterns.
        </p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {insights && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="prose prose-sm prose-invert max-w-none"
        >
          {insights.split("\n").map((line, i) => (
            <p key={i} className="text-sm text-foreground/90 mb-2 last:mb-0">
              {line}
            </p>
          ))}
        </motion.div>
      )}
    </div>
  );
}
