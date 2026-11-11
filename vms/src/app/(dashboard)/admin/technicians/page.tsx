import { TechnicianManagement } from "@/components/admin/TechnicianManagement";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/types";

export default async function AdminTechniciansPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let canViewAgent = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    canViewAgent =
      profile?.role === "admin" || profile?.role === "manager";
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="font-cinzel text-2xl font-bold silver-text">技师管理</h1>
        <p className="text-brand-silver-dim text-sm mt-1">
          Technician Management · Info / Status / Photos
        </p>
      </div>
      <TechnicianManagement canViewAgent={canViewAgent} />
    </div>
  );
}
