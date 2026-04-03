import { CheckInPanel } from "@/components/desk/CheckInPanel";

export default function CheckInPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="font-cinzel text-2xl font-bold silver-text">技师签到</h1>
        <p className="text-brand-silver-dim text-sm mt-1">
          Technician Check-In / Check-Out / Break
        </p>
      </div>
      <CheckInPanel />
    </div>
  );
}
