import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // Look up the profile by username to get the user's auth email
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, is_active")
      .eq("username", username.trim())
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!profile.is_active) {
      return NextResponse.json({ error: "Account disabled" }, { status: 403 });
    }

    // Get the auth user email using service role
    const { data: authUser, error: authError } =
      await supabase.auth.admin.getUserById(profile.id);

    if (authError || !authUser?.user?.email) {
      return NextResponse.json({ error: "Auth user not found" }, { status: 404 });
    }

    return NextResponse.json({ email: authUser.user.email });
  } catch (e) {
    console.error("Username lookup error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
