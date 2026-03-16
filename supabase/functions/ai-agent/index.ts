import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, summary } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are Spendy AI, an expert personal finance advisor and expense planning agent. You have access to the user's financial data:

Current Month Summary:
- Currency: ${summary.currency}
- Total Income: ${summary.totalIncome}
- Total Expenses: ${summary.totalExpenses}
- Net Cash Flow: ${summary.totalIncome - summary.totalExpenses}
- Expense Categories: ${summary.categories.map(([cat, amt]: [string, number]) => `${cat}: ${amt}`).join(", ") || "None yet"}
- Transaction Count: ${summary.transactionCount}

Your capabilities:
1. Analyze spending patterns and identify areas for savings
2. Create personalized monthly/weekly budget plans
3. Suggest specific expense cuts with estimated savings
4. Recommend investment strategies based on surplus income
5. Provide financial goal-setting guidance (emergency fund, retirement, etc.)
6. Compare spending to recommended budgeting ratios (50/30/20 rule, etc.)

Rules:
- Be specific with numbers and percentages
- Reference the user's actual data
- Keep responses concise (under 250 words)
- Use the user's currency (${summary.currency}) for all amounts
- Be encouraging but honest
- No markdown formatting, use plain text with line breaks`;

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: aiMessages }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("AI agent error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
