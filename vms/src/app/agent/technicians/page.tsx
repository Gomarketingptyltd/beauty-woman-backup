import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { TechnicianPublic } from "@/types";

export default async function AgentTechniciansPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("agent_id")
    .eq("id", user.id)
    .single();

  if (!profile?.agent_id) redirect("/login");

  const { data: technicians } = await supabase
    .from("technicians")
    .select(
      "id,code,name,age,body,cup_size,height,language,type,speciality,starting_price,holder_description,photos,status,created_at"
    )
    .eq("agent_id", profile.agent_id)
    .eq("is_active", true)
    .order("code");

  return (
    <div>
      <div className="page-header">
        <h1 className="font-cinzel text-2xl font-bold silver-text">旗下技师</h1>
        <p className="text-brand-silver-dim text-sm mt-1">
          My Technicians · {technicians?.length ?? 0} active
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {(technicians ?? []).map((tech) => (
          <div key={tech.id} className="brand-card overflow-hidden">
            <div className="relative" style={{ paddingBottom: "100%" }}>
              {tech.photos?.[0] ? (
                <Image
                  src={tech.photos[0]}
                  alt={tech.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-brand-red/10 to-noir-700 flex items-center justify-center">
                  <span className="text-4xl text-brand-silver/20 font-cinzel font-bold">
                    {tech.name[0]}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-noir-900/80 to-transparent" />
              <div className="absolute bottom-2 left-2">
                <StatusBadge status={tech.status} size="sm" />
              </div>
            </div>
            <div className="p-3">
              <p className="text-brand-silver font-medium font-cinzel">
                {tech.name}
              </p>
              <p className="text-brand-silver-dim/50 text-xs">{tech.code}</p>
              {tech.starting_price && (
                <p className="text-brand-red text-xs mt-1">
                  {tech.starting_price}
                </p>
              )}
              {tech.speciality && (
                <p className="text-brand-silver-dim/60 text-xs mt-1 line-clamp-1">
                  {tech.speciality}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
