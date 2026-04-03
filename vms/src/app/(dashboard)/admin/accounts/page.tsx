import { AccountManagement } from "@/components/admin/AccountManagement";

export default function AdminAccountsPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="font-cinzel text-2xl font-bold silver-text">账号管理</h1>
        <p className="text-brand-silver-dim text-sm mt-1">
          Account Management · Create / Disable / Role Assignment
        </p>
      </div>
      <AccountManagement />
    </div>
  );
}
