import type { TechnicianStatus } from "@/types";

interface StatusBadgeProps {
  status: TechnicianStatus;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<
  TechnicianStatus,
  { label: string; labelCn: string; dot: string; bg: string; text: string; border: string }
> = {
  available: {
    label: "Available",
    labelCn: "可接待",
    dot: "bg-green-400",
    bg: "bg-green-500/10",
    text: "text-green-400",
    border: "border-green-500/30",
  },
  busy: {
    label: "In Service",
    labelCn: "服务中",
    dot: "bg-red-400",
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/30",
  },
  break: {
    label: "On Break",
    labelCn: "休息中",
    dot: "bg-gray-400",
    bg: "bg-gray-500/10",
    text: "text-gray-400",
    border: "border-gray-500/30",
  },
  off: {
    label: "Off Duty",
    labelCn: "未签到",
    dot: "bg-zinc-600",
    bg: "bg-zinc-800/30",
    text: "text-zinc-500",
    border: "border-zinc-700/30",
  },
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 ${cfg.bg} ${cfg.text} ${cfg.border} ${
        size === "sm" ? "text-xs" : "text-sm"
      } font-medium`}
    >
      <span
        className={`rounded-full ${cfg.dot} ${
          size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2"
        } ${status === "available" ? "animate-pulse" : ""}`}
      />
      <span className="hidden sm:inline">{cfg.label}</span>
      <span className="sm:hidden">{cfg.labelCn}</span>
    </span>
  );
}

export { STATUS_CONFIG };
