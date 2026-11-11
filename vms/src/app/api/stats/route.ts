import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { format, subDays } from "date-fns";

/**
 * Public stats endpoint — returns non-sensitive operational data shown on the
 * login page background panel. No authentication required.
 * Returns only counts (no revenue figures) to avoid exposing financial data.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Technician availability
    const { data: technicians } = await supabase
      .from("technicians")
      .select("status")
      .eq("is_active", true);

    const totalTechs = technicians?.length ?? 0;
    const availableTechs = technicians?.filter((t) => t.status === "available").length ?? 0;

    // Last 7-day order counts (no revenue — safe to show publicly)
    const today = new Date();
    const dates = Array.from({ length: 7 }, (_, i) =>
      format(subDays(today, 6 - i), "yyyy-MM-dd")
    );

    const { data: orders } = await supabase
      .from("orders")
      .select("business_day")
      .in("business_day", dates)
      .eq("status", "paid");

    const traffic = dates.map((date) => ({
      date,
      day: format(new Date(date), "EEE"),
      orders: (orders ?? []).filter((o) => o.business_day === date).length,
    }));

    return NextResponse.json({ totalTechs, availableTechs, traffic });
  } catch {
    return NextResponse.json(
      { totalTechs: 0, availableTechs: 0, traffic: [] },
      { status: 200 }
    );
  }
}
