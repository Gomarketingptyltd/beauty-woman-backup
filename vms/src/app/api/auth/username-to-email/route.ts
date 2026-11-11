import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Use RPC function to lookup email by username (no admin key needed)
    const { data: email, error } = await supabase.rpc(
      "lookup_email_by_username",
      { p_username: username.trim() }
    );

    if (error || !email) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ email });
  } catch (e) {
    console.error("Username lookup error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
