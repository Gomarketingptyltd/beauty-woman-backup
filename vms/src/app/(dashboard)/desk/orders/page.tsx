import { QuickOrderPage } from "@/components/desk/QuickOrderPage";

export default function DeskOrdersPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="font-cinzel text-2xl font-bold silver-text">前台开单</h1>
        <p className="text-brand-silver-dim text-sm mt-1">
          Quick Order · Package → Technician → Room → Confirm
        </p>
      </div>
      <QuickOrderPage />
    </div>
  );
}
