import type { Role } from "@/types";

// Permission definitions
export const PERMISSIONS = {
  // Orders
  CREATE_ORDER: ["admin", "manager", "staff"] as Role[],
  VOID_ORDER: ["admin", "manager"] as Role[],

  // Technicians
  VIEW_TECHNICIANS: ["admin", "manager", "staff"] as Role[],
  MANAGE_TECHNICIANS: ["admin", "manager", "staff"] as Role[],
  VIEW_TECH_AGENT: ["admin", "manager"] as Role[], // agent_id field
  CHECKIN_TECHNICIAN: ["admin", "manager", "staff"] as Role[],

  // Members
  VIEW_MEMBERS: ["admin", "manager", "staff"] as Role[],
  CREATE_MEMBER: ["admin", "manager", "staff"] as Role[],
  TOPUP_MEMBER: ["admin", "manager", "staff"] as Role[],
  MANAGE_MEMBERS: ["admin", "manager"] as Role[],

  // Reports
  VIEW_REPORTS: ["admin", "manager", "staff"] as Role[],
  VIEW_AGENT_COMMISSION: ["admin", "manager"] as Role[], // hidden from staff
  VIEW_FULL_REPORTS: ["admin", "manager"] as Role[],

  // Agents
  VIEW_AGENTS: ["admin", "manager"] as Role[],
  MANAGE_AGENTS: ["admin", "manager"] as Role[],

  // Accounts
  MANAGE_ACCOUNTS: ["admin"] as Role[],

  // Agent portal (self-only)
  AGENT_PORTAL: ["agent"] as Role[],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

export function requiresRole(allowedRoles: Role[], userRole: Role): boolean {
  return allowedRoles.includes(userRole);
}

// Route access map
export const ROUTE_PERMISSIONS: Record<string, Role[]> = {
  "/desk": ["admin", "manager", "staff"],
  "/desk/orders": ["admin", "manager", "staff"],
  "/desk/members": ["admin", "manager", "staff"],
  "/desk/checkin": ["admin", "manager", "staff"],
  "/admin": ["admin", "manager", "staff"],
  "/admin/reports": ["admin", "manager", "staff"],
  "/admin/technicians": ["admin", "manager", "staff"],
  "/admin/members": ["admin", "manager", "staff"],
  "/admin/agents": ["admin", "manager"],
  "/admin/accounts": ["admin"],
  "/agent": ["agent"],
  "/agent/dashboard": ["agent"],
  "/agent/technicians": ["agent"],
  "/agent/commissions": ["agent"],
};

export function getDefaultRoute(role: Role): string {
  switch (role) {
    case "admin":
    case "manager":
      return "/admin/reports";
    case "staff":
      return "/desk/orders";
    case "agent":
      return "/agent/dashboard";
    default:
      return "/login";
  }
}

export function canAccessRoute(path: string, role: Role): boolean {
  // Find the most specific matching route
  const matchedRoutes = Object.keys(ROUTE_PERMISSIONS)
    .filter((route) => path.startsWith(route))
    .sort((a, b) => b.length - a.length);

  if (matchedRoutes.length === 0) return true; // public route
  const allowed = ROUTE_PERMISSIONS[matchedRoutes[0]];
  return allowed.includes(role);
}
