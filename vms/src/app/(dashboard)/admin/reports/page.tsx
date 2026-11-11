import { ReportsDashboard } from "@/components/admin/ReportsDashboard";

export default function AdminReportsPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="font-cinzel text-2xl font-bold silver-text">日报统计</h1>
        <p className="text-brand-silver-dim text-sm mt-1">
          Daily Reports · Revenue / Commissions / Traffic
        </p>
      </div>
      <ReportsDashboard />
    </div>
  );
}
