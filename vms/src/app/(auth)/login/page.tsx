import { LoginPage } from "@/components/auth/LoginPage";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDefaultRoute } from "@/lib/auth/permissions";
import type { Role } from "@/types";

export default async function Login() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile) {
      redirect(getDefaultRoute(profile.role as Role));
    }
  }

  return <LoginPage />;
}
