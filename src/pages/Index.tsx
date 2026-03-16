import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTransactions } from "@/hooks/useTransactions";
import Navbar from "@/components/dashboard/Navbar";
import SummaryCards from "@/components/dashboard/SummaryCards";
import SpendingChart from "@/components/dashboard/SpendingChart";
import CategoryBreakdown from "@/components/dashboard/CategoryBreakdown";
import TransactionList from "@/components/dashboard/TransactionList";
import AddTransactionForm from "@/components/dashboard/AddTransactionForm";
import AIInsights from "@/components/dashboard/AIInsights";
import AIAgent from "@/components/dashboard/AIAgent";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: transactions = [], isLoading } = useTransactions();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-6 space-y-6">
        <div>
          <h1 className="text-display text-foreground">Dashboard</h1>
          <p className="text-body text-muted-foreground mt-1">
            Your financial overview for {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>

        <SummaryCards transactions={transactions} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SpendingChart transactions={transactions} />
          </div>
          <CategoryBreakdown transactions={transactions} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TransactionList transactions={transactions} />
          </div>
          <div className="space-y-6">
            <AddTransactionForm />
            <AIAgent transactions={transactions} />
            <AIInsights transactions={transactions} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
