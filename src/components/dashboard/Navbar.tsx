import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { TrendingUp, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <span className="text-heading text-foreground">Lumen</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {user?.email}
          </span>
          <Button variant="ghost" size="icon" onClick={signOut} className="h-8 w-8">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
