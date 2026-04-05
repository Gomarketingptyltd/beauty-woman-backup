import { DisplayScreen } from "@/components/display/DisplayScreen";
import { createClient } from "@/lib/supabase/server";
import type { TechnicianPublic } from "@/types";

export const revalidate = 0;

async function getTechnicians(): Promise<TechnicianPublic[]> {
  try {
    const supabase = await createClient();
    // Load ALL active technicians (including off-duty) so the display
    // screen can show the full roster and filter client-side
    const { data, error } = await supabase
      .from("technicians")
      .select(
        "id,code,name,age,body,cup_size,height,language,type,speciality,starting_price,holder_description,photos,status,created_at"
      )
      .eq("is_active", true)
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
