import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Send, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/hooks/useCurrency";
import type { Transaction } from "@/hooks/useTransactions";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAgentProps {
  transactions: Transaction[];
}

export default function AIAgent({ transactions }: AIAgentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { currency, formatAmount } = useCurrency();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const buildSummary = () => {
    const now = new Date();
    const monthly = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const totalIncome = monthly.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const totalExpenses = monthly.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
    const categories = Object.entries(
      monthly
        .filter((t) => t.type === "expense")
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
          return acc;
        }, {} as Record<string, number>)
    );

    return { totalIncome, totalExpenses, categories, transactionCount: monthly.length, currency: currency.code };
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await supabase.functions.invoke("ai-agent", {
        body: {
          messages: newMessages,
          summary: buildSummary(),
        },
      });

      if (response.error) throw new Error(response.error.message);
      setMessages([...newMessages, { role: "assistant", content: response.data.reply }]);
    } catch (e: any) {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "How can I reduce my expenses?",
    "Create a monthly budget plan",
    "Where am I overspending?",
    "Investment suggestions",
  ];

  return (
    <div className="surface-card rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <h3 className="text-heading text-foreground">Spendy AI Agent</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setOpen(!open)} className="text-xs">
          {open ? "Close" : "Chat"}
        </Button>
      </div>

      {!open && (
        <p className="text-sm text-muted-foreground">
          Chat with your AI finance advisor for personalized budgeting tips and investment recommendations.
        </p>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden"
          >
            {messages.length === 0 && (
              <div className="space-y-2 mb-3">
                <p className="text-xs text-muted-foreground">Quick prompts:</p>
                <div className="flex flex-wrap gap-1.5">
                  {quickPrompts.map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setInput(q);
                      }}
                      className="text-xs px-2.5 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={scrollRef} className="max-h-[300px] overflow-y-auto space-y-3 mb-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent/50 text-foreground"
                    }`}
                  >
                    {msg.content.split("\n").map((line, j) => (
                      <p key={j} className="mb-1 last:mb-0">{line}</p>
                    ))}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-accent/50 rounded-lg px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your finances..."
                className="bg-background border-border text-sm"
                disabled={loading}
              />
              <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
