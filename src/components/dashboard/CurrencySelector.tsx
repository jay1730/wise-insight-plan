import { useCurrency, CURRENCIES } from "@/hooks/useCurrency";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();

  return (
    <Select
      value={currency.code}
      onValueChange={(code) => {
        const found = CURRENCIES.find((c) => c.code === code);
        if (found) setCurrency(found);
      }}
    >
      <SelectTrigger className="w-[130px] h-8 text-xs bg-background border-border">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((c) => (
          <SelectItem key={c.code} value={c.code} className="text-xs">
            {c.symbol} {c.code} — {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
