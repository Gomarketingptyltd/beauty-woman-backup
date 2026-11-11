import { AgentManagement } from "@/components/admin/AgentManagement";

export default function AdminAgentsPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="font-cinzel text-2xl font-bold silver-text">中介管理</h1>
        <p className="text-brand-silver-dim text-sm mt-1">
          Agent Management · Profile / Technicians / Commissions
        </p>
      </div>
      <AgentManagement />
    </div>
  );
}
