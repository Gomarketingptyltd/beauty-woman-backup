import { DisplayScreen } from "@/components/display/DisplayScreen";
import { createClient } from "@/lib/supabase/server";
import type { TechnicianPublic } from "@/types";

export const revalidate = 0;

async function getTechnicians(): Promise<TechnicianPublic[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("technicians")
      .select(
        "id,code,name,age,body,cup_size,height,language,type,speciality,starting_price,holder_description,photos,status,created_at"
      )
      .eq("is_active", true)
      .neq("status", "off")
      .order("status", { ascending: true })
      .order("name");

    if (error) throw error;
    return (data as TechnicianPublic[]) ?? [];
  } catch {
    return [];
  }
}

export default async function DisplayPage() {
  const technicians = await getTechnicians();

  return <DisplayScreen initialTechnicians={technicians} />;
}
