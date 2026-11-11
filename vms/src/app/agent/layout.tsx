import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { OceanNoirLogo } from "@/components/shared/OceanNoirLogo";
import { LayoutDashboard, Users, DollarSign, LogOut } from "lucide-react";

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*,agent:agents(id,name)")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "agent") redirect("/login");

  const agentName =
    (profile.agent as { name?: string } | null)?.name || "中介";

  return (
    <div className="flex min-h-screen bg-noir-900">
      <aside className="fixed left-0 top-0 h-screen w-56 bg-noir-800 border-r border-brand-red/10 flex flex-col">
        <div className="p-5 border-b border-brand-red/10">
          <OceanNoirLogo size="sm" showTagline={false} />
          <p className="text-center text-xs text-amber-400 mt-2 font-medium">
            {agentName}
          </p>
          <p className="text-center text-xs text-brand-silver-dim/50 mt-0.5">
            中介门户
          </p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          <NavLink href="/agent/dashboard" icon={LayoutDashboard} label="仪表盘" />
          <NavLink href="/agent/technicians" icon={Users} label="旗下技师" />
          <NavLink href="/agent/commissions" icon={DollarSign} label="提成明细" />
        </nav>
        <div className="p-3 border-t border-brand-red/10">
          <form action="/api/auth/signout" method="POST">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-brand-silver-dim hover:text-red-400 hover:bg-red-500/10 transition-all text-sm">
              <LogOut className="h-4 w-4" />
              退出登录
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 ml-56 p-6">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link href={href} className="nav-item">
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
