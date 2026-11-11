import { MemberPanel } from "@/components/desk/MemberPanel";

export default function DeskMembersPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="font-cinzel text-2xl font-bold silver-text">会员管理</h1>
        <p className="text-brand-silver-dim text-sm mt-1">
          Member Management · Search / Create / Topup
        </p>
      </div>
      <MemberPanel />
    </div>
  );
}
