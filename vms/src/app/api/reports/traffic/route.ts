import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { format, subDays } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const days = 7;
    const today = new Date();
    const dates = Array.from({ length: days }, (_, i) =>
      format(subDays(today, days - 1 - i), "yyyy-MM-dd")
    );

    const { data, error } = await supabase
      .from("orders")
      .select("business_day,total_cents")
      .in("business_day", dates)
      .eq("status", "paid");

    if (error) throw error;

    const grouped = dates.map((date) => {
      const dayOrders = (data ?? []).filter((o) => o.business_day === date);
      return {
        date,
        orders: dayOrders.length,
        revenue: Math.round(
          dayOrders.reduce((s, o) => s + o.total_cents, 0) / 100
        ),
      };
    });

    return NextResponse.json(grouped);
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
