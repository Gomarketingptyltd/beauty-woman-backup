import { MemberPanel } from "@/components/desk/MemberPanel";

export default function AdminMembersPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="font-cinzel text-2xl font-bold silver-text">全部会员</h1>
        <p className="text-brand-silver-dim text-sm mt-1">
          All Members · Search / Edit / Topup
        </p>
      </div>
      <MemberPanel />
    </div>
  );
}
