"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  Monitor,
  UserCog,
  Handshake,
} from "lucide-react";
import { OceanNoirLogo } from "./OceanNoirLogo";
import { createClient } from "@/lib/supabase/client";
import { hasPermission } from "@/lib/auth/permissions";
import type { Role, Profile } from "@/types";
import { toast } from "sonner";

interface NavItem {
  href: string;
  label: string;
  labelCn: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredPermission?: Parameters<typeof hasPermission>[1];
}

const DESK_NAV: NavItem[] = [
  {
    href: "/desk/orders",
    label: "New Order",
    labelCn: "前台开单",
    icon: ClipboardList,
  },
  {
    href: "/desk/checkin",
    label: "Check In/Out",
    labelCn: "技师签到",
    icon: UserCheck,
  },
  {
    href: "/desk/members",
    label: "Members",
    labelCn: "会员管理",
    icon: Users,
  },
];

const ADMIN_NAV: NavItem[] = [
  {
    href: "/admin/reports",
    label: "Reports",
    labelCn: "日报统计",
    icon: BarChart3,
  },
  {
    href: "/admin/technicians",
    label: "Technicians",
    labelCn: "技师管理",
    icon: UserCog,
  },
  {
    href: "/admin/members",
    label: "All Members",
    labelCn: "全部会员",
    icon: Users,
  },
  {
    href: "/admin/agents",
    label: "Agents",
    labelCn: "中介管理",
    icon: Handshake,
    requiredPermission: "VIEW_AGENTS",
  },
  {
    href: "/admin/accounts",
    label: "Accounts",
    labelCn: "账号管理",
    icon: Settings,
    requiredPermission: "MANAGE_ACCOUNTS",
  },
];

interface SidebarProps {
  profile: Profile;
}

export function DashboardSidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const role = profile.role as Role;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("已退出登录");
    router.push("/login");
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const filteredAdminNav = ADMIN_NAV.filter((item) =>
    item.requiredPermission
      ? hasPermission(role, item.requiredPermission)
      : true
  );

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-noir-800 border-r border-brand-red/10 flex flex-col z-40">
      {/* Logo */}
      <div className="p-5 border-b border-brand-red/10">
        <OceanNoirLogo size="sm" showTagline={false} />
        <p className="text-center text-xs text-brand-silver-dim mt-2 font-cinzel tracking-widest">
          夜色宫管理系统
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* Display screen link */}
        <div>
          <Link
            href="/display"
            target="_blank"
            className="nav-item text-xs"
          >
            <Monitor className="h-4 w-4" />
            <span>技师展示屏</span>
            <ChevronRight className="h-3 w-3 ml-auto opacity-40" />
          </Link>
        </div>

        {/* Desk section */}
        {hasPermission(role, "CREATE_ORDER") && (
          <div>
            <p className="px-3 mb-2 text-xs font-semibold text-brand-silver-dim/50 uppercase tracking-wider font-cinzel">
              Front Desk
            </p>
            <div className="space-y-0.5">
              {DESK_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${isActive(item.href) ? "active" : ""}`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.labelCn}</span>
                  {isActive(item.href) && (
                    <ChevronRight className="h-3 w-3 ml-auto" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Admin section */}
        {filteredAdminNav.length > 0 && (
          <div>
            <p className="px-3 mb-2 text-xs font-semibold text-brand-silver-dim/50 uppercase tracking-wider font-cinzel">
              Management
            </p>
            <div className="space-y-0.5">
              {filteredAdminNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${isActive(item.href) ? "active" : ""}`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.labelCn}</span>
                  {isActive(item.href) && (
                    <ChevronRight className="h-3 w-3 ml-auto" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* User info + logout */}
      <div className="p-3 border-t border-brand-red/10">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-noir-600 mb-2">
          <div className="h-8 w-8 rounded-full bg-brand-red/20 border border-brand-red/30 flex items-center justify-center">
            <span className="text-brand-red text-xs font-bold">
              {(profile.display_name || profile.username)[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-brand-silver truncate">
              {profile.display_name || profile.username}
            </p>
            <p className="text-xs text-brand-silver-dim capitalize">
              {profile.role}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full nav-item hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          <span>退出登录</span>
        </button>
      </div>
    </aside>
  );
}
